import '@/plugins/magic/zod-extend';
import { initializeApp } from './app/app';
import config from './config/env';
import { connectDatabase } from './lib/database';
import logger from '@/plugins/observability/logger';
import apiRoutes from './routes/routes';
import errorHandler from './middlewares/error-handler';

import { resolvePort } from './server/port-resolver';

const bootstrapServer = async () => {
  // Resolve port availability (dev-only interactive prompt)
  const selectedPort =
    config.NODE_ENV === 'development'
      ? await resolvePort({ desiredPort: config.PORT })
      : config.PORT;

  await connectDatabase();

  const { app, server } = await initializeApp(selectedPort);

  app.use('/api', apiRoutes);

  app.use(errorHandler);

  server.listen(selectedPort, () => {
    logger.info(`Server is running on http://localhost:${selectedPort}`);
    logger.info(`RESTful API: http://localhost:${selectedPort}/api`);
    logger.info(`Client-side url set to: ${config.CLIENT_SIDE_URL}`);
    logger.info(
      `Socket Testing Suite: http://localhost:${selectedPort}/realtime`,
    );
  });
};

bootstrapServer().catch((err) => {
  logger.error({ err }, 'Failed to bootstrap server');
  process.exit(1);
});
