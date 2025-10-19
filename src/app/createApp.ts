import express, { type Application } from 'express';
import { createServer, type Server } from 'http';
import type { AppContext, ToolkitPlugin } from '../plugins/types';
import logger from '@/plugins/observability/logger';

export interface CreateAppOptions {
  plugins?: ToolkitPlugin[];
  config?: Record<string, unknown>;
}

export async function createApp(options: CreateAppOptions = {}): Promise<{
  app: Application;
  server: Server;
  plugins: ToolkitPlugin[];
}> {
  const { plugins = [], config = {} } = options;

  const app = express();
  const server = createServer(app);

  const context: AppContext = {
    app,
    server,
    config,
  };

  const sortedPlugins = [...plugins].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );

  for (const plugin of sortedPlugins) {
    try {
      logger.info(`Registering plugin: ${plugin.name}`);
      await plugin.register(context);
      logger.debug(`Plugin registered: ${plugin.name}`);
    } catch (error) {
      logger.error(
        { err: error, plugin: plugin.name },
        `Failed to register plugin: ${plugin.name}`,
      );
      throw error;
    }
  }

  return { app, server, plugins: sortedPlugins };
}

export default createApp;
