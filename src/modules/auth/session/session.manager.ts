import type {
  SessionStore,
  SessionStoreConfig,
  CreateSessionInput,
  SessionRecord,
  SessionValidationResult,
} from './session.types';
import { MongoSessionStore } from './mongo.session.store';
import { RedisSessionStore } from './redis.session.store';
import { hashToken, isSessionExpired } from './session.utils';
import { createChildLogger } from '../../../observability/logger';
import redisClient from '../../../lib/redis.server';
import config from '../../../config/env';

const logger = createChildLogger({ context: 'SessionManager' });

export class SessionManager {
  private store: SessionStore;
  private config: SessionStoreConfig;

  constructor(storeConfig?: Partial<SessionStoreConfig>) {
    this.config = {
      driver: storeConfig?.driver || config.SESSION_DRIVER,
      maxPerUser: storeConfig?.maxPerUser || config.SESSION_MAX_PER_USER,
      idleTTL: storeConfig?.idleTTL || config.SESSION_IDLE_TTL,
      absoluteTTL: storeConfig?.absoluteTTL || config.SESSION_ABSOLUTE_TTL,
      rotation: storeConfig?.rotation ?? config.SESSION_ROTATION,
      debug: storeConfig?.debug ?? config.SESSION_DEBUG,
    };

    this.store = this.createStore();

    if (this.config.debug) {
      logger.info({ config: this.config }, 'SessionManager initialized');
    }
  }

  private createStore(): SessionStore {
    if (this.config.driver === 'redis') {
      return new RedisSessionStore(redisClient);
    }
    return new MongoSessionStore();
  }

  async createSession(input: CreateSessionInput): Promise<SessionRecord> {
    const sessions = await this.store.listByUser(input.userId);

    if (sessions.length >= this.config.maxPerUser) {
      const oldestSession = sessions[sessions.length - 1];
      await this.store.revoke(oldestSession.sessionId);
      logger.debug(
        { userId: input.userId, revokedSessionId: oldestSession.sessionId },
        'Evicted oldest session due to max limit',
      );
    }

    const session = await this.store.create(input);

    if (this.config.debug) {
      logger.info(
        { sessionId: session.sessionId, userId: input.userId },
        'Session created',
      );
    }

    return session;
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    return this.store.get(sessionId);
  }

  async validateSession(
    sessionId: string,
    token: string,
  ): Promise<SessionValidationResult> {
    const session = await this.store.get(sessionId);

    if (!session) {
      return { isValid: false, reason: 'not_found' };
    }

    if (session.isRevoked) {
      return { isValid: false, session, reason: 'revoked' };
    }

    if (isSessionExpired(session.expiresAt)) {
      return { isValid: false, session, reason: 'expired' };
    }

    const tokenHash = hashToken(token);

    console.debug(
      { tokenHash, sessionTokenHash: session.tokenHash },
      'Token hash comparison',
    );

    if (session.tokenHash !== tokenHash) {
      return { isValid: false, session, reason: 'invalid' };
    }

    await this.store.touch(sessionId);

    return { isValid: true, session };
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.store.touch(sessionId);
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.store.revoke(sessionId);

    if (this.config.debug) {
      logger.info({ sessionId }, 'Session revoked');
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.store.revokeAllForUser(userId);

    if (this.config.debug) {
      logger.info({ userId }, 'All user sessions revoked');
    }
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    return this.store.listByUser(userId);
  }

  async pruneExpiredSessions(): Promise<void> {
    await this.store.pruneExpired();
  }

  async cleanup(): Promise<void> {
    await this.store.close();
  }

  getConfig(): SessionStoreConfig {
    return { ...this.config };
  }
}

let sessionManagerInstance: SessionManager | null = null;

export function initializeSessionManager(
  config?: Partial<SessionStoreConfig>,
): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager(config);
  }
  return sessionManagerInstance;
}

export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    throw new Error(
      'SessionManager not initialized. Call initializeSessionManager first.',
    );
  }
  return sessionManagerInstance;
}
