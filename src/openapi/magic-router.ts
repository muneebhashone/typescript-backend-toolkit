import { NextFunction, Request, Response, Router } from 'express';
import { ZodTypeAny } from 'zod';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import { RequestZodSchemaType } from '../types';
import {
  parseRouteString,
  routeToClassName,
  camelCaseToTitleCase,
} from './openapi.utils';
import { registry } from './swagger-instance';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybePromise = any | Promise<any> | void;

export class MagicRouter {
  private router: Router;
  private rootRoute: string;

  constructor(rootRoute: string) {
    this.router = Router();
    this.rootRoute = rootRoute;
  }

  private getPath(path: string) {
    return this.rootRoute + parseRouteString(path);
  }

  public get(
    path: string,
    requestType: RequestZodSchemaType = {},
    responseModel: ZodTypeAny,
    ...middlewares: Array<
      (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: Request<any, any, any, any, any>,
        res: Response,
        next?: NextFunction,
      ) => MaybePromise
    >
  ): void {
    const bodySchema = requestType.body
      ? registry.register(routeToClassName(this.rootRoute), requestType.body)
      : null;

    registry.registerPath({
      method: 'get',
      path: this.getPath(path),
      description: camelCaseToTitleCase(
        middlewares[middlewares.length - 1].name,
      ),
      summary: camelCaseToTitleCase(middlewares[middlewares.length - 1].name),
      request: {
        params: requestType.params,
        query: requestType.query,
        ...(bodySchema
          ? {
              body: {
                content: {
                  'applicat ion/json': {
                    schema: bodySchema,
                  },
                },
              },
            }
          : {}),
      },
      responses: {
        200: {
          description: '',
          content: {
            'application/json': {
              schema: responseModel,
            },
          },
        },
      },
    });

    if (Object.keys(requestType).length) {
      this.router.get(path, validateZodSchema(requestType), ...middlewares);
    } else {
      this.router.get(path, ...middlewares);
    }
  }

  public post(
    path: string,
    requestType: RequestZodSchemaType = {},
    responseModel: ZodTypeAny,
    ...middlewares: Array<
      (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: Request<any, any, any, any, any>,
        res: Response,
        next?: NextFunction,
      ) => MaybePromise
    >
  ): void {
    this.router.post(path, ...middlewares);
  }
  public put(
    path: string,
    ...middlewares: Array<
      (req: Request, res: Response, next: NextFunction) => void
    >
  ): void {
    this.router.put(path, ...middlewares);
  }
  public delete(
    path: string,
    ...middlewares: Array<
      (req: Request, res: Response, next: NextFunction) => void
    >
  ): void {
    this.router.delete(path, ...middlewares);
  }
  public patch(
    path: string,
    ...middlewares: Array<
      (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: Request<any, any, any, any>,
        res: Response,
        next: NextFunction,
      ) => void
    >
  ): void {
    this.router.patch(path, ...middlewares);
  }

  public use(...args: Parameters<Router['use']>): void {
    this.router.use(...args);
  }

  // Method to get the router instance
  public getRouter(): Router {
    return this.router;
  }
}

export default MagicRouter;
