export { createApp } from './app/createApp';
export { initializeApp } from './app/app';

export { MagicRouter, createRouter, defineRoute } from './core/router';
export { validateZodSchema } from './core/validate';
export { registry } from './openapi/registry';

export { logger, httpLogger, createChildLogger } from './observability/logger';
export { metricsCollector, MetricsCollector } from './observability/metrics';

export { requestIdMiddleware } from './middlewares/requestId';
export { metricsMiddleware } from './middlewares/metrics';

export { applySecurity } from './server/security';
export { LifecycleManager } from './server/lifecycle';

export { createOpsRoutes } from './routes/ops';

export { securityPlugin } from './plugins/security';
export { observabilityPlugin } from './plugins/observability';
export { openApiPlugin } from './plugins/openapi';
export { authPlugin } from './plugins/auth';
export { cachePlugin } from './plugins/cache';
export { uploadsPlugin } from './plugins/uploads';

export type { ToolkitPlugin, PluginFactory, AppContext } from './plugins/types';
export type { SecurityOptions } from './server/security';
export type { ObservabilityOptions } from './plugins/observability';
export type { OpenApiOptions } from './plugins/openapi';
export type { HealthCheck, OpsRoutesOptions } from './routes/ops';
export type {
  MagicPathType,
  RequestAndResponseType,
  MagicMiddleware,
} from './openapi/magic-router';
