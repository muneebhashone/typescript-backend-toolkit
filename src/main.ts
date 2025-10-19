import './openapi/zod-extend';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { initializeApp } from './app/app';
import config from './config/env';
import { connectDatabase, disconnectDatabase } from './lib/database';
import logger from '@/plugins/observability/logger';
import { LifecycleManager } from '@/server/lifecycle';
import apiRoutes from './routes/routes';
import errorHandler from './middlewares/error-handler';
import { registeredQueues, closeAllQueues } from './lib/queue';
import { cacheProvider, RedisProvider } from './lib/cache';

import { adminApiRouter, registerAdminUI } from './admin/router';
import {
  adminAuthGuardApi,
  adminAuthGuardUI,
  signAdminSession,
  setAdminCookie,
  clearAdminCookie,
  compareCredentials,
  checkAdminLoginRateLimit,
} from './admin/admin-auth';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { resolvePort } from './server/port-resolver';

const bootstrapServer = async () => {
  // Resolve port availability (dev-only interactive prompt)
  const selectedPort =
    config.NODE_ENV === 'development'
      ? await resolvePort({ desiredPort: config.PORT })
      : config.PORT;

  await connectDatabase();

  const { app, server } = await initializeApp();

  app.use('/api', apiRoutes);

  // Admin authentication routes
  app.get('/admin/login', (_req, res) => {
    const loginPath = path.join(process.cwd(), 'public', 'admin', 'login.html');
    res.sendFile(loginPath);
  });

  app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const identifier = req.ip || 'unknown';

    // Rate limiting
    if (!checkAdminLoginRateLimit(identifier)) {
      logger.warn({ identifier }, 'Admin login rate limit exceeded');
      return res.status(429).json({ error: 'too_many_attempts' });
    }

    // Validate credentials
    if (!username || !password || !compareCredentials(username, password)) {
      logger.warn({ username, ip: identifier }, 'Failed admin login attempt');
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // Create session
    const token = signAdminSession(username);
    setAdminCookie(res, token);

    logger.info({ username, ip: identifier }, 'Admin login successful');

    // Redirect or return JSON based on Accept header
    const acceptsJson = req.headers.accept?.includes('application/json');
    if (acceptsJson) {
      return res.json({ ok: true });
    }

    const next = typeof req.query.next === 'string' ? req.query.next : '/admin';
    res.redirect(next);
  });

  app.post('/admin/logout', (req, res) => {
    clearAdminCookie(res);
    logger.info({ adminUser: (req as any).adminUser }, 'Admin logout');

    const acceptsJson = req.headers.accept?.includes('application/json');
    if (acceptsJson) {
      return res.json({ ok: true });
    }

    res.redirect('/admin/login');
  });

  // Admin dashboard (CRUD) — UI and JSON API (protected)
  registerAdminUI(app, adminAuthGuardUI);
  app.use('/admin/api', adminAuthGuardApi, adminApiRouter);

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  createBullBoard({
    queues: Object.entries(registeredQueues || {}).map(
      ([, values]) => new BullMQAdapter(values.queue),
    ),
    serverAdapter,
  });

  app.use('/queues', serverAdapter.getRouter());

  app.use(errorHandler);

  const lifecycle = new LifecycleManager({ gracefulShutdownTimeout: 30000 });
  lifecycle.registerServer(server);

  lifecycle.registerCleanup(async () => {
    await disconnectDatabase();
    await closeAllQueues();
    // Disconnect cache if using Redis
    if (cacheProvider instanceof RedisProvider) {
      await cacheProvider.getClient().quit();
    }
    const io = app.locals?.io as SocketServer | undefined;
    io?.disconnectSockets(true);
  });

  lifecycle.setupSignalHandlers();

  server.listen(selectedPort, () => {
    logger.info(`Server is running on http://localhost:${selectedPort}`);
    logger.info(`RESTful API: http://localhost:${selectedPort}/api`);
    logger.info(`OpenAPI Docs: http://localhost:${selectedPort}/docs`);
    logger.info(`Health: http://localhost:${selectedPort}/ops/health`);
    logger.info(`Readiness: http://localhost:${selectedPort}/ops/readiness`);
    logger.info(`Metrics: http://localhost:${selectedPort}/ops/metrics`);
    logger.info(`BullBoard: http://localhost:${selectedPort}/queues`);
    logger.info(`Client-side url set to: ${config.CLIENT_SIDE_URL}`);
    logger.info(`Admin dashboard: http://localhost:${selectedPort}/admin`);
    logger.info(
      `Socket Testing Suite: http://localhost:${selectedPort}/realtime`,
    );
  });
};

bootstrapServer().catch((err) => {
  logger.error({ err }, 'Failed to bootstrap server');
  process.exit(1);
});
