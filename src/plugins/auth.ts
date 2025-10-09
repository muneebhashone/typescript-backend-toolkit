import type { ToolkitPlugin, PluginFactory } from './types';
import { initializeSessionManager, type SessionManager } from '../modules/auth/session/session.manager';
import type { SessionStoreConfig } from '../modules/auth/session/session.types';
import config from '../config/env';

export interface AuthOptions {
  jwtSecret?: string;
  jwtExpiration?: string;
  sessionSecret?: string;
  session?: Partial<SessionStoreConfig> & { enabled?: boolean };
}

export const authPlugin: PluginFactory<AuthOptions> = (
  options = {},
): ToolkitPlugin<AuthOptions> => {
  let sessionManager: SessionManager | null = null;

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

      if (config.SET_SESSION && options.session?.enabled !== false) {
        sessionManager = initializeSessionManager(options.session);
        app.locals.sessionManager = sessionManager;
        app.set('auth:session:enabled', true);
      }
    },

    async onShutdown() {
      if (sessionManager) {
        await sessionManager.cleanup();
      }
    },
  };
};

export default authPlugin;
