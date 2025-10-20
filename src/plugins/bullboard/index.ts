import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { registeredQueues } from '@/lib/queue';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import pathLib from 'path';
import {
  queueAuthGuardAdaptive,
  signQueueSession,
  setQueueCookie,
  compareQueueCredentials,
  checkQueueLoginRateLimit,
  clearQueueCookie,
} from './queue-auth';

export interface BullboardOptions {
  path: string;
  authGuard?: boolean;
}

export const bullboardPlugin: PluginFactory<BullboardOptions> = (
  options = { path: '/queues', authGuard: true },
): ToolkitPlugin<BullboardOptions> => {
  const { path, authGuard = true } = options;

  return {
    name: 'bullboard',
    priority: 50,
    options,

    register({ app, port }) {
      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath(path);

      createBullBoard({
        queues: Object.entries(registeredQueues || {}).map(
          ([, values]) => new BullMQAdapter(values.queue),
        ),
        serverAdapter,
      });

      // Queues login page
      app.get(`${path}/login`, (_req, res) => {
        const loginPath = pathLib.join(process.cwd(), 'public', 'queues', 'login.html');
        res.sendFile(loginPath);
      });

      // Queues login
      app.post(`${path}/login`, (req, res) => {
        const { username, password } = req.body || {};
        const identifier = req.ip || 'unknown';

        if (!checkQueueLoginRateLimit(identifier)) {
          return res.status(429).json({ error: 'too_many_attempts' });
        }

        if (!username || !password || !compareQueueCredentials(username, password)) {
          return res.status(401).json({ error: 'invalid_credentials' });
        }

        const token = signQueueSession(username);
        setQueueCookie(res, token);

        const acceptsJson = req.headers.accept?.includes('application/json');
        if (acceptsJson) {
          return res.json({ ok: true });
        }

        const nextUrl = typeof req.query.next === 'string' ? req.query.next : path;
        return res.redirect(nextUrl);
      });

      // Queues logout
      app.post(`${path}/logout`, (req, res) => {
        clearQueueCookie(res);
        const acceptsJson = req.headers.accept?.includes('application/json');
        if (acceptsJson) {
          return res.json({ ok: true });
        }
        return res.redirect(`${path}/login`);
      });

      if (authGuard) {
        app.use(path, queueAuthGuardAdaptive(path), serverAdapter.getRouter());
      } else {
        app.use(path, serverAdapter.getRouter());
      }

      return [`http://localhost:${port}${path}`];
    },

    onShutdown: async () => {},
  };
};

export default bullboardPlugin;
