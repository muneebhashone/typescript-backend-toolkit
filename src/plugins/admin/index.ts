import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import express from 'express';
import {
  adminAuthGuardApi,
  adminAuthGuardUI,
  signAdminSession,
  setAdminCookie,
  clearAdminCookie,
  compareCredentials,
  checkAdminLoginRateLimit,
} from './admin-auth';

import path from 'path';
import logger from '@/plugins/logger';

import { adminApiRouter, registerAdminUI } from './router';
import cookieParser from 'cookie-parser';

export interface AdminDashboardOptions {
  adminPath: string;
  authGuard: boolean;
}

export const adminDashboardPlugin: PluginFactory<AdminDashboardOptions> = (
  options,
): ToolkitPlugin<AdminDashboardOptions> => {
  const { adminPath, authGuard } = options as AdminDashboardOptions;

  return {
    name: 'admin-dashboard',
    priority: 50,
    options,

    register({ app, port }) {
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(cookieParser());

      app.get(`/admin/login`, (req, res) => {
        const loginPath = path.join(
          process.cwd(),
          'public',
          'admin',
          'login.html',
        );
        res.sendFile(loginPath);
      });

      // Admin authentication routes
      app.post(`/admin/login`, (req, res) => {
        const { username, password } = req.body;
        const identifier = req.ip || 'unknown';

        // Rate limiting
        if (!checkAdminLoginRateLimit(identifier)) {
          logger.warn({ identifier }, 'Admin login rate limit exceeded');
          return res.status(429).json({ error: 'too_many_attempts' });
        }

        // Validate credentials
        if (!username || !password || !compareCredentials(username, password)) {
          logger.warn(
            { username, ip: identifier },
            'Failed admin login attempt',
          );
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

        const next =
          typeof req.query.next === 'string' ? req.query.next : '/admin';
        res.redirect(next);
      });

      app.post(`/admin/logout`, (req, res) => {
        clearAdminCookie(res);
        return res.json({ ok: true });
      });

      app.use(`/admin/api`, adminAuthGuardApi, adminApiRouter);

      // Admin dashboard (CRUD) — UI and JSON API (protected)
      registerAdminUI(
        app,
        adminPath,
        authGuard ? adminAuthGuardUI(adminPath) : undefined,
      );

      return [`http://localhost:${port}${adminPath}`];
    },
  };
};

export default adminDashboardPlugin;
