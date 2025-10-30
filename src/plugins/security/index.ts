import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import { applySecurity, type SecurityOptions } from './security';

export const securityPlugin: PluginFactory<SecurityOptions> = (
  options = {},
): ToolkitPlugin<SecurityOptions> => {
  return {
    name: 'security',
    priority: 100,
    options,

    register({ app }) {
      applySecurity(app, options);
    },
  };
};

export default securityPlugin;
