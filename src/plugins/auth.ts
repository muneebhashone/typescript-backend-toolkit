import type { ToolkitPlugin, PluginFactory } from './types';

export interface AuthOptions {
  jwtSecret?: string;
  jwtExpiration?: string;
  sessionSecret?: string;
}

export const authPlugin: PluginFactory<AuthOptions> = (
  options = {},
): ToolkitPlugin<AuthOptions> => {
  return {
    name: 'auth',
    priority: 70,
    options,

    register({ app }) {
      app.set('auth:configured', true);

      if (options.jwtSecret) {
        app.set('auth:jwt:secret', options.jwtSecret);
      }
      if (options.jwtExpiration) {
        app.set('auth:jwt:expiration', options.jwtExpiration);
      }
    },
  };
};

export default authPlugin;
