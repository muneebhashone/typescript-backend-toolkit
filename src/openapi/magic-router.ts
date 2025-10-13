import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import asyncHandler from 'express-async-handler';
import type { ZodTypeAny } from 'zod';
import {
  errorResponseSchema,
  successResponseSchema,
} from '../common/common.schema';
import { canAccess } from '../middlewares/can-access';
import { responseValidator } from '../middlewares/response-validator';
import { validateZodSchema } from '../middlewares/validate-zod-schema';
import type {
  RequestZodSchemaType,
  ResponseExtended,
  ResponseSchemaEntry,
} from '../types';
import {
  camelCaseToTitleCase,
  parseRouteString,
  routeToClassName,
} from './openapi.utils';
import { bearerAuth, registry } from './swagger-instance';

type Method =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'
  | 'trace';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type IDontKnow = unknown | never | any;
export type MaybePromise = void | Promise<void>;
export type RequestAny = Request<IDontKnow, IDontKnow, IDontKnow, IDontKnow>;
export type ResponseAny = Response<IDontKnow, Record<string, unknown>>;
export type MagicPathType = `/${string}`;
export type MagicRoutePType<PathSet extends boolean> = PathSet extends true
  ? [reqAndRes: RequestAndResponseType, ...handlers: MagicMiddleware[]]
  : [
      path: MagicPathType,
      reqAndRes: RequestAndResponseType,
      ...handlers: MagicMiddleware[],
    ];
export type MagicRouteRType<PathSet extends boolean> = Omit<
  MagicRouter<PathSet>,
  'route' | 'getRouter' | 'use'
>;
export type MagicMiddleware = (
  req: RequestAny,
  res: ResponseAny,
  next: NextFunction,
) => MaybePromise;

// Response configuration types
export type ResponseEntry =
  | ZodTypeAny
  | {
      schema: ZodTypeAny;
      description?: string;
      contentType?: string;
      headers?: Record<string, ZodTypeAny>;
      examples?: Record<string, unknown>;
    };

export type ResponsesConfig = Record<number, ResponseEntry>;

export type RequestAndResponseType = {
  requestType?: RequestZodSchemaType;
  // Legacy: treated as 200 response if provided
  responseModel?: ZodTypeAny;
  // New: supports multiple status codes with detailed config
  responses?: ResponsesConfig;
  contentType?:
    | 'application/json'
    | 'multipart/form-data'
    | 'application/x-www-form-urlencoded';
};

export class MagicRouter<PathSet extends boolean = false> {
  private router: Router;
  private rootRoute: string;
  private currentPath?: MagicPathType;

  constructor(rootRoute: string, currentPath?: MagicPathType) {
    this.router = Router();
    this.rootRoute = rootRoute;
    this.currentPath = currentPath;
  }

  private getPath(path: string) {
    return this.rootRoute + parseRouteString(path);
  }

  /**
   * Normalize response configuration to a Map of status -> ResponseSchemaEntry
   * Handles backward compatibility with responseModel
   */
  private normalizeResponses(
    requestAndResponseType: RequestAndResponseType,
  ): Map<number, ResponseSchemaEntry> {
    const normalized = new Map<number, ResponseSchemaEntry>();

    // New responses config takes priority
    if (requestAndResponseType.responses) {
      for (const [status, entry] of Object.entries(
        requestAndResponseType.responses,
      )) {
        const statusCode = Number(status);

        if (typeof entry === 'object' && 'schema' in entry) {
          // Full ResponseEntry object
          normalized.set(statusCode, {
            schema: entry.schema,
            contentType: entry.contentType || 'application/json',
            description: entry.description,
          });
        } else {
          // Just a Zod schema
          normalized.set(statusCode, {
            schema: entry as ZodTypeAny,
            contentType: 'application/json',
          });
        }
      }
    } else if (requestAndResponseType.responseModel) {
      // Legacy: responseModel treated as 200 response
      normalized.set(200, {
        schema: requestAndResponseType.responseModel,
        contentType: 'application/json',
      });
    } else {
      // Default: successResponseSchema for 200
      normalized.set(200, {
        schema: successResponseSchema,
        contentType: 'application/json',
      });
    }

    return normalized;
  }

  private wrapper(
    method: Method,
    path: MagicPathType,
    requestAndResponseType: RequestAndResponseType,
    ...middlewares: Array<MagicMiddleware>
  ): void {
    const bodyType = requestAndResponseType.requestType?.body;
    const paramsType = requestAndResponseType.requestType?.params;
    const queryType = requestAndResponseType.requestType?.query;

    // Normalize responses (handles backward compatibility)
    const normalizedResponses = this.normalizeResponses(requestAndResponseType);

    const className = routeToClassName(this.rootRoute);
    const title = camelCaseToTitleCase(
      middlewares[middlewares.length - 1]?.name,
    );

    const bodySchema = bodyType
      ? registry.register(`${title} Input`, bodyType)
      : null;

    const hasSecurity = middlewares.some((m) => m.name === canAccess().name);

    const contentType =
      requestAndResponseType.contentType ?? 'application/json';

    // Middleware to attach response schemas to res.locals
    const attachResponseSchemasMiddleware: MagicMiddleware = (
      _: RequestAny,
      res: ResponseAny,
      next: NextFunction,
    ) => {
      const extRes = res as ResponseExtended;
      extRes.locals.responseSchemas = normalizedResponses;
      // Legacy support
      extRes.locals.validateSchema = requestAndResponseType.responseModel;
      next();
    };

    // Build OpenAPI responses from normalized config
    const openapiResponses: Record<
      string,
      {
        description: string;
        content: Record<string, { schema: ZodTypeAny }>;
      }
    > = {};

    for (const [status, entry] of normalizedResponses) {
      const statusStr = String(status);
      const ct = entry.contentType || 'application/json';

      openapiResponses[statusStr] = {
        description: entry.description || '',
        content: {
          [ct]: {
            schema: entry.schema,
          },
        },
      };
    }

    // Add default error responses if not already configured
    const defaultErrors = [400, 404, 500];
    for (const errorStatus of defaultErrors) {
      if (!normalizedResponses.has(errorStatus)) {
        openapiResponses[String(errorStatus)] = {
          description: 'API Error Response',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        };
      }
    }

    registry.registerPath({
      method: method,
      tags: [className],
      path: this.getPath(path),
      security: hasSecurity ? [{ [bearerAuth.name]: ['bearer'] }] : [],
      description: title,
      summary: title,
      request: {
        params: paramsType,
        query: queryType,
        ...(bodySchema
          ? {
              body: {
                content: {
                  [contentType]: {
                    schema: bodySchema,
                  },
                },
              },
            }
          : {}),
      },
      responses: openapiResponses as never,
    });

    const requestType = requestAndResponseType.requestType ?? {};

    const controller = asyncHandler(middlewares[middlewares.length - 1]);

    middlewares.pop();

    if (Object.keys(requestType).length) {
      this.router[method](
        path,
        attachResponseSchemasMiddleware,
        responseValidator,
        validateZodSchema(requestType),
        ...middlewares,
        controller,
      );
    } else {
      this.router[method](
        path,
        attachResponseSchemasMiddleware,
        responseValidator,
        ...middlewares,
        controller,
      );
    }
  }

  public get(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
    return this.routeHandler('get', ...args);
  }

  public post(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
    return this.routeHandler('post', ...args);
  }

  public delete(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
    return this.routeHandler('delete', ...args);
  }

  public patch(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
    return this.routeHandler('patch', ...args);
  }

  public put(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
    return this.routeHandler('put', ...args);
  }

  public use(...args: Parameters<Router['use']>): void {
    this.router.use(...args);
  }

  public route(path: MagicPathType): MagicRouteRType<true> {
    // Create a proxy object that will use the same router instance
    const proxy = {
      get: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
        this.wrapper('get', path, ...args);
        return proxy;
      },
      post: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
        this.wrapper('post', path, ...args);
        return proxy;
      },
      put: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
        this.wrapper('put', path, ...args);
        return proxy;
      },
      delete: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
        this.wrapper('delete', path, ...args);
        return proxy;
      },
      patch: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
        this.wrapper('patch', path, ...args);
        return proxy;
      },
    };
    return proxy;
  }

  private routeHandler(method: Method, ...args: MagicRoutePType<PathSet>) {
    if (this.currentPath) {
      const [reqAndRes, ...handlers] = args as [
        RequestAndResponseType,
        ...MagicMiddleware[],
      ];
      this.wrapper(method, this.currentPath, reqAndRes, ...handlers);
    } else {
      const [path, reqAndRes, ...handlers] = args as [
        MagicPathType,
        RequestAndResponseType,
        ...MagicMiddleware[],
      ];
      this.wrapper(method, path, reqAndRes, ...handlers);
    }
    return this;
  }

  // Method to get the router instance
  public getRouter(): Router {
    return this.router;
  }
}

export default MagicRouter;
