import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import asyncHandler from "express-async-handler";
import type { ZodTypeAny } from "zod";
import {
	errorResponseSchema,
	successResponseSchema,
} from "../common/common.schema";
import { canAccess } from "../middlewares/can-access.middleware";
import { validateZodSchema } from "../middlewares/validate-zod-schema.middleware";
import type {
	RequestExtended,
	RequestZodSchemaType,
	ResponseExtended,
} from "../types";
import responseInterceptor from "../utils/responseInterceptor";
import {
	camelCaseToTitleCase,
	parseRouteString,
	routeToClassName,
} from "./openapi.utils";
import { bearerAuth, registry } from "./swagger-instance";

type Method =
	| "get"
	| "post"
	| "put"
	| "delete"
	| "patch"
	| "head"
	| "options"
	| "trace";

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
	"route" | "getRouter" | "use"
>;
export type MagicMiddleware = (
	req: RequestAny,
	res: ResponseAny,
	next?: NextFunction,
) => MaybePromise;

export type RequestAndResponseType = {
	requestType?: RequestZodSchemaType;
	responseModel?: ZodTypeAny;
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

	private wrapper(
		method: Method,
		path: MagicPathType,
		requestAndResponseType: RequestAndResponseType,
		...middlewares: Array<MagicMiddleware>
	): void {
		const bodyType = requestAndResponseType.requestType?.body;
		const paramsType = requestAndResponseType.requestType?.params;
		const queryType = requestAndResponseType.requestType?.query;
		const responseType =
			requestAndResponseType.responseModel ?? successResponseSchema;

		const className = routeToClassName(this.rootRoute);
		const title = camelCaseToTitleCase(
			middlewares[middlewares.length - 1]?.name,
		);

		const bodySchema = bodyType
			? registry.register(`${title} Input`, bodyType)
			: null;

		const hasSecurity = middlewares.some((m) => m.name === canAccess().name);

		const attachResponseModelMiddleware = (
			_: RequestAny,
			res: ResponseAny,
			next: NextFunction,
		) => {
			res.locals.validateSchema = requestAndResponseType.responseModel;
			next();
		};

		registry.registerPath({
			method: method,
			tags: [className],
			path: this.getPath(path),
			security: hasSecurity ? [{ [bearerAuth.name]: ["bearer"] }] : [],
			description: title,
			summary: title,
			request: {
				params: paramsType,
				query: queryType,
				...(bodySchema
					? {
							body: {
								content: {
									"application/json": {
										schema: bodySchema,
									},
								},
							},
						}
					: {}),
			},
			responses: {
				200: {
					description: "",
					content: {
						"application/json": {
							schema: responseType,
						},
					},
				},
				400: {
					description: "API Error Response",
					content: {
						"application/json": {
							schema: errorResponseSchema,
						},
					},
				},
				404: {
					description: "API Error Response",
					content: {
						"application/json": {
							schema: errorResponseSchema,
						},
					},
				},
				500: {
					description: "API Error Response",
					content: {
						"application/json": {
							schema: errorResponseSchema,
						},
					},
				},
			},
		});

		const requestType = requestAndResponseType.requestType ?? {};

		const controller = asyncHandler(middlewares[middlewares.length - 1]);

		const responseInterceptorWrapper = (
			req: RequestAny | RequestExtended,
			res: ResponseAny | ResponseExtended,
			next: NextFunction,
		) => {
			return responseInterceptor(
				req as RequestExtended,
				res as ResponseExtended,
				next,
			);
		};

		middlewares.pop();

		if (Object.keys(requestType).length) {
			this.router[method](
				path,
				attachResponseModelMiddleware,
				responseInterceptorWrapper,
				validateZodSchema(requestType),
				...middlewares,
				controller,
			);
		} else {
			this.router[method](
				path,
				attachResponseModelMiddleware,
				...middlewares,
				responseInterceptorWrapper,
				controller,
			);
		}
	}

	public get(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
		return this.routeHandler("get", ...args);
	}

	public post(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
		return this.routeHandler("post", ...args);
	}

	public delete(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
		return this.routeHandler("delete", ...args);
	}

	public patch(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
		return this.routeHandler("patch", ...args);
	}

	public put(...args: MagicRoutePType<PathSet>): MagicRouteRType<PathSet> {
		return this.routeHandler("put", ...args);
	}

	public use(...args: Parameters<Router["use"]>): void {
		this.router.use(...args);
	}

	public route(path: MagicPathType): MagicRouteRType<true> {
		// Create a proxy object that will use the same router instance
		const proxy = {
			get: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
				this.wrapper("get", path, ...args);
				return proxy;
			},
			post: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
				this.wrapper("post", path, ...args);
				return proxy;
			},
			put: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
				this.wrapper("put", path, ...args);
				return proxy;
			},
			delete: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
				this.wrapper("delete", path, ...args);
				return proxy;
			},
			patch: (...args: [RequestAndResponseType, ...MagicMiddleware[]]) => {
				this.wrapper("patch", path, ...args);
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
