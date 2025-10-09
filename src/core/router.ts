import { MagicRouter } from '../openapi/magic-router';
import type {
  MagicPathType,
  RequestAndResponseType,
  MagicMiddleware,
} from '../openapi/magic-router';

export function defineRoute(
  path: string,
  config: RequestAndResponseType,
): { path: MagicPathType; config: RequestAndResponseType } {
  return {
    path: path as MagicPathType,
    config,
  };
}

export function createRouter(rootRoute: string): MagicRouter {
  return new MagicRouter(rootRoute);
}

export { MagicRouter };

export type {
  MagicPathType,
  RequestAndResponseType,
  MagicMiddleware,
};

export default MagicRouter;
