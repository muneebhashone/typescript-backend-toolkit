import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import express from 'express';
import cookieParser from 'cookie-parser';

export const basicParserPlugin: PluginFactory = (
  options = {},
): ToolkitPlugin => {
  return {
    name: 'basic-parser',
    priority: 100,
    options,

    register({ app }) {
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      app.use(cookieParser());
    },

    onShutdown: async () => {},
  };
};

export default basicParserPlugin;
