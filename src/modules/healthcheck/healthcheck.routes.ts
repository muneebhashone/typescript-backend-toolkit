import { z } from 'zod';
import MagicRouter from '@/plugins/magic/router';
import { R } from '@/plugins/magic/response.builders';
import { handleHealthCheck } from './healthcheck.controller';

export const HEALTH_ROUTER_ROOT = '/healthcheck';

const healthCheckRouter = new MagicRouter(HEALTH_ROUTER_ROOT);

// Healthcheck endpoint
healthCheckRouter.get(
  '/',
  {
    responses: {
      200: R.raw(
        z.object({
          uptime: z.number(),
          responseTime: z.tuple([z.number(), z.number()]),
          message: z.string(),
          timestamp: z.number(),
        }),
      ),
    },
  },
  handleHealthCheck,
);

export default healthCheckRouter.getRouter();
