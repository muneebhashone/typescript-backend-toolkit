import type { PluginFactory } from '../types';
import config from '@/config/env';
import logger from '@/plugins/observability/logger';
import { registerRealtimeHandlers } from './handlers';
import type { Server as IServer } from 'node:http';
import { Server as RealtimeServer } from 'socket.io';

export type RealtimeOptions = {
  path?: string;
  transports?: Array<'websocket' | 'polling'>;
  cors?: {
    origin: string | string[];
    methods?: string[];
    credentials?: boolean;
  };
};

export const setupSocketIo = (
  server: IServer,
  options: RealtimeOptions = {},
): RealtimeServer => {
  const io = new RealtimeServer(server, {
    path: options.path ?? '/socket.io',
    transports: options.transports ?? ['websocket', 'polling'],
    cors: {
      origin: options.cors?.origin ?? '*',
      methods: options.cors?.methods ?? ['GET', 'POST'],
      credentials: options.cors?.credentials ?? true,
    },
  });

  return io;
};

export const realtimePlugin: PluginFactory<RealtimeOptions> = (opts = {}) => {
  let io: RealtimeServer | undefined;

  return {
    name: 'realtime',
    priority: 85,
    options: opts,

    register({ app, server, port }) {
      if (!server) {
        logger.warn('Realtime plugin: HTTP server not available');
        return;
      }

      io = setupSocketIo(server, {
        path: opts.path ?? '/socket.io',
        transports: opts.transports,
        cors: {
          origin: [config.CLIENT_SIDE_URL],
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

      app.locals.io = io;

      registerRealtimeHandlers(io);
      logger.info('Realtime server initialized');

      return [`http://localhost:${port}/socket.io`];
    },
  };
};

export default realtimePlugin;
