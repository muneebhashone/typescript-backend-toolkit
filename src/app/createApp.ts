import express, { type Application } from 'express';
import { createServer, type Server } from 'http';
import type { AppContext, ToolkitPlugin } from '../plugins/types';
import logger from '@/plugins/observability/logger';
import config from '@/config/env';

export interface CreateAppOptions {
  plugins?: ToolkitPlugin[];
  config?: Record<string, unknown>;
  port: number;
}

export async function createApp(
  options: CreateAppOptions = { port: config.PORT },
): Promise<{
  app: Application;
  server: Server;
  plugins: ToolkitPlugin[];
}> {
  const { plugins = [], config = {}, port } = options;

  const app = express();
  const server = createServer(app);

  const context: AppContext = {
    app,
    server,
    config,
    port,
  };

  const sortedPlugins = [...plugins].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );

  for (const plugin of sortedPlugins) {
    try {
      const urls = await plugin.register(context);
      logger.info(`Plugin registered: ${plugin.name}`);

      if (urls) {
        for (const url of urls) {
          logger.info(`${plugin.name}: ${url}`);
        }
      }
      
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
