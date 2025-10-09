import type { ToolkitPlugin, PluginFactory } from './types';
import { requestIdMiddleware } from '../middlewares/requestId';
import { httpLogger } from '../observability/logger';
import { metricsMiddleware } from '../middlewares/metrics';

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
