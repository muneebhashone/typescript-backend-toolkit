import type { ToolkitPlugin, PluginFactory } from '../types';
import { requestIdMiddleware } from './requestId.middleware';
import { httpLogger } from '../observability/logger';
import { metricsMiddleware } from './observability.middleware';
import { checkEmailHealth } from '@/lib/email';
import { checkStorageHealth } from '@/lib/storage';
import { checkCacheHealth } from '@/lib/cache';
import { checkDatabaseHealth } from '@/lib/database';
import { checkQueueHealth } from '@/lib/queue';
import createOpsRoutes from './ops';
import config from '@/config/env';

export interface ObservabilityOptions {
  requestId?: boolean;
  logging?: boolean;
  metrics?: boolean;
}

export const observabilityPlugin: PluginFactory<ObservabilityOptions> = (
  options = {},
): ToolkitPlugin<ObservabilityOptions> => {
  const { requestId = true, logging = true, metrics = true } = options;

  return {
    name: 'observability',
    priority: 90,
    options,

    register({ app }) {
      const opsRoutes = createOpsRoutes({
        healthChecks: [
          { name: 'database', check: checkDatabaseHealth() },
          { name: 'cache', check: checkCacheHealth() },
          { name: 'queues', check: checkQueueHealth() },
          { name: 'email', check: checkEmailHealth() },
          { name: 'storage', check: checkStorageHealth() },
        ],
        metricsEnabled: config.METRICS_ENABLED,
      });

      app.use('/ops', opsRoutes);

      if (requestId) {
        app.use(requestIdMiddleware);
      }

      if (logging) {
        app.use(httpLogger);
      }

      if (metrics) {
        app.use(metricsMiddleware);
      }
    },
  };
};

export default observabilityPlugin;
