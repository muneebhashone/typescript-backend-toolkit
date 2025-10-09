import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { createApp } from './createApp';
import config from '../config/env';
import { extractJwt } from '../middlewares/extract-jwt';
import { securityPlugin } from '../plugins/security';
import { observabilityPlugin } from '../plugins/observability';
import { openApiPlugin } from '../plugins/openapi';

export async function initializeApp() {
  const { app, server, plugins } = await createApp({
    plugins: [
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
      openApiPlugin({
        path: '/api-docs',
        enabled: config.NODE_ENV !== 'production',
      }),
    ],
    config: config,
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(express.static(path.join(__dirname, '..', '..', 'public')));

  app.use(cookieParser());
  app.use(compression());
  app.use(extractJwt);

  return { app, server, plugins };
}

export default initializeApp;
