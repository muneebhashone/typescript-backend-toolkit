import type { ToolkitPlugin, PluginFactory } from './types';
import { applySecurity, type SecurityOptions } from '../server/security';

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
