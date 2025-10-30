import express from 'express';
import compression from 'compression';
import path from 'path';
import { createApp } from './createApp';
import config from '../config/env';
import { observabilityPlugin } from '@/plugins/observability';
import { magicRouterPlugin } from '@/plugins/magic';
import { lifecyclePlugin } from '@/plugins/lifecycle';
import { basicParserPlugin } from '@/plugins/basicParser';

export async function initializeApp(port: number) {
  const { app, server, plugins } = await createApp({
    plugins: [
      basicParserPlugin({
        enabled: true,
      }),
      observabilityPlugin({
        requestId: true,
        logging: true,
        metrics: false,
      }),
      magicRouterPlugin({
        path: '/docs',
        description:
          "Robust backend boilerplate designed for scalability, flexibility, and ease of development. It's packed with modern technologies and best practices to kickstart your next backend project",
        servers: [{ url: '/api' }],
      }),
      lifecyclePlugin({
        gracefulShutdownTimeout: 30000,
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
