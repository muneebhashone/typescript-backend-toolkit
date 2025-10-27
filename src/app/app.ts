import express from 'express';
import compression from 'compression';
import path from 'path';
import { createApp } from './createApp';
import config from '../config/env';
import { securityPlugin } from '@/plugins/security';
import { observabilityPlugin } from '@/plugins/observability';
import { magicRouterPlugin } from '@/plugins/magic';
import { authPlugin } from '@/plugins/auth';
import { realtimePlugin } from '@/plugins/realtime';
import { lifecyclePlugin } from '@/plugins/lifecycle';
import { adminDashboardPlugin } from '@/plugins/admin';
import { bullboardPlugin } from '@/plugins/bullboard';
import { basicparserPlugin } from '@/plugins/basicparser';

export async function initializeApp(port: number) {
  const { app, server, plugins } = await createApp({
    plugins: [
      basicparserPlugin({
        enabled: true,
      }),
      authPlugin({
        session: {
          enabled: config.SET_SESSION,
          driver: 'mongo',
          debug: false,
        },
      }),
      securityPlugin({
        corsEnabled: config.CORS_ENABLED,
        corsOrigins: [config.CLIENT_SIDE_URL],
        corsCredentials: true,
        helmetEnabled: config.NODE_ENV === 'production',
        rateLimitEnabled: config.RATE_LIMIT_ENABLED,
        rateLimitWindowMs: config.RATE_LIMIT_WINDOW_MS,
        rateLimitMax: config.RATE_LIMIT_MAX_REQUESTS,
        trustProxy: config.TRUST_PROXY,
      }),
      observabilityPlugin({
        requestId: true,
        logging: true,
        metrics: config.METRICS_ENABLED,
      }),
      realtimePlugin(),
      magicRouterPlugin({
        path: '/docs',
        description:
          "Robust backend boilerplate designed for scalability, flexibility, and ease of development. It's packed with modern technologies and best practices to kickstart your next backend project",
        servers: [{ url: '/api' }],
      }),
      lifecyclePlugin({
        gracefulShutdownTimeout: 30000,
      }),
      adminDashboardPlugin({ adminPath: '/admin', authGuard: true }),
      bullboardPlugin({
        path: '/queues',
      }),
    ],
    config: config,
    port,
  });

  app.use(
    '/assets',
    express.static(path.join(process.cwd(), 'public', 'assets')),
  );

  app.use(compression({ threshold: 1024 * 10 }));

  return { app, server, plugins };
}

export default initializeApp;
