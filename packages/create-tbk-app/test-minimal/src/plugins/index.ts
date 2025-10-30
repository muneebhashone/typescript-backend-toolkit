import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import cookieParser from 'cookie-parser';
import express from 'express';

export interface BasicParserOptions {
  enabled?: boolean;
}

export const basicParserPlugin: PluginFactory<BasicParserOptions> = (
  options = {},
): ToolkitPlugin<BasicParserOptions> => {
  const { enabled = true } = options;

  return {
    name: 'basicParser',
    priority: 100,
    options,

    register({ app }) {
      if (!enabled) {
        return;
      }

      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(cookieParser())

      // Plugin implementation here
      console.log('BasicParser plugin registered');
    },

    onShutdown: async () => {
      // Cleanup logic here
      console.log('BasicParser plugin shutdown');
    },
  };
};

export default basicParserPlugin;
