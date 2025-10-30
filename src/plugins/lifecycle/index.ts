import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import { LifecycleManager, type LifecycleOptions } from './lifecycle-manager';
import { disconnectDatabase } from '@/lib/database';
import { Server as SocketServer } from 'socket.io';
import { cacheProvider, RedisProvider } from '@/lib/cache';
import { closeAllQueues } from '@/lib/queue';

export const lifecyclePlugin: PluginFactory<LifecycleOptions> = (
  options = {},
): ToolkitPlugin<LifecycleOptions> => {
  return {
    name: 'lifecycle',
    priority: 10,
    options,

    register({ app, server }) {
      const lifecycle = new LifecycleManager({
        gracefulShutdownTimeout: 30000,
      });
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
    },
  };
};

export default lifecyclePlugin;
