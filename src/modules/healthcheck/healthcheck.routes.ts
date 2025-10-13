import { handleHealthCheck } from './healthcheck.controller';
import MagicRouter from '../../openapi/magic-router';

export const HEALTH_ROUTER_ROOT = '/healthcheck';

const healthCheckRouter = new MagicRouter(HEALTH_ROUTER_ROOT);

healthCheckRouter.get('/', {}, handleHealthCheck);

export default healthCheckRouter.getRouter();
