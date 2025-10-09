import './openapi/zod-extend';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { initializeApp } from './app/app';
import config from './config/env';
import { connectDatabase, disconnectDatabase } from './lib/database';
import logger from './observability/logger';
import { setupSocketIo } from './lib/realtime.server';
import { LifecycleManager } from './server/lifecycle';
import { createOpsRoutes } from './routes/ops';
import apiRoutes from './routes/routes';
import globalErrorHandler from './utils/globalErrorHandler';
import { getRegisteredQueues } from './lib/queue.server';
import { scheduleSessionCleanup } from './queues/session-cleanup.queue';
import { getSessionManager } from './modules/auth/session/session.manager';

const bootstrapServer = async () => {
  await connectDatabase();

  if (config.SET_SESSION) {
    try {
      const sessionManager = getSessionManager();
      const stats = await sessionManager.cleanupSessions('revoked');
      logger.info({ stats }, 'Startup session cleanup completed');
    } catch (err) {
      logger.warn({ err }, 'Startup session cleanup failed');
    }
  }

  await scheduleSessionCleanup();

  const { app, server } = await initializeApp();

  const io = setupSocketIo(server);

  app.use((req, _, next) => {
    req.io = io;
    next();
  });

  // Mock routes for ops health checks - don't forget to implement the actual checks
  const opsRoutes = createOpsRoutes({
    healthChecks: [
      {
        name: 'database',
        check: async () => {
          return true;
        },
      },
      {
        name: 'redis',
        check: async () => {
          return true;
        },
      },
    ],
    metricsEnabled: config.METRICS_ENABLED,
  });

  app.use('/ops', opsRoutes);

  app.use('/api', apiRoutes);

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');


  createBullBoard({
    queues: Object.entries(getRegisteredQueues() || {}).map(
      ([, values]) => new BullMQAdapter(values.queue),
    ),
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  app.use(globalErrorHandler);

  const lifecycle = new LifecycleManager({ gracefulShutdownTimeout: 30000 });
  lifecycle.registerServer(server);

  lifecycle.registerCleanup(async () => {
    await disconnectDatabase();
    io.disconnectSockets(true);
  });

  lifecycle.setupSignalHandlers();

  server.listen(config.PORT, () => {
    logger.info(`Server is running on http://localhost:${config.PORT}`);
    logger.info(`RESTful API: http://localhost:${config.PORT}/api`);
    logger.info(`Swagger API Docs: http://localhost:${config.PORT}/api-docs`);
    logger.info(`Health: http://localhost:${config.PORT}/ops/health`);
    logger.info(`Readiness: http://localhost:${config.PORT}/ops/readiness`);
    logger.info(`Metrics: http://localhost:${config.PORT}/ops/metrics`);
    logger.info(`BullBoard: http://localhost:${config.PORT}/admin/queues`);
    logger.info(`Client-side url set to: ${config.CLIENT_SIDE_URL}`);
  });
};

bootstrapServer().catch((err) => {
  logger.error({ err }, 'Failed to bootstrap server');
  process.exit(1);
});
