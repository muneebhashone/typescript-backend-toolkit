import type { ToolkitPlugin, PluginFactory } from './types';

export interface CacheOptions {
  enabled?: boolean;
  ttl?: number;
}

export const cachePlugin: PluginFactory<CacheOptions> = (
  options = {},
): ToolkitPlugin<CacheOptions> => {
  const { enabled = true, ttl = 3600 } = options;

  return {
    name: 'cache',
    priority: 50,
    options,
    
    register({ app }) {
      if (!enabled) {
        return;
      }

      app.set('cache:ttl', ttl);
    },
  };
};

export default cachePlugin;
