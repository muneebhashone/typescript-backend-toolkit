import type {
  SessionStore,
  SessionStoreConfig,
  CreateSessionInput,
  SessionRecord,
  SessionValidationResult,
  CleanupStats,
} from './session.types';
import { MongoSessionStore } from './mongo.session.store';
import { RedisSessionStore } from './redis.session.store';
import { hashToken, isSessionExpired } from './session.utils';
import { createChildLogger } from '@/plugins/logger';
import { cacheProvider, RedisProvider } from '@/lib/cache';
import config from '@/config/env';

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
      if (!(cacheProvider instanceof RedisProvider)) {
        throw new Error(
          'Redis session driver requires Redis cache provider. Set CACHE_PROVIDER=redis',
        );
      }
      return new RedisSessionStore(cacheProvider.getClient());
    }
    return new MongoSessionStore();
  }

  async createSession(input: CreateSessionInput): Promise<SessionRecord> {
    // Note: This check-then-revoke pattern has a race condition where concurrent
    // createSession calls can bypass the maxPerUser limit. For production use,
    // consider implementing atomic store-level eviction (e.g., using Redis Lua
    // scripts or MongoDB transactions with proper locking). This implementation
    // provides best-effort enforcement.

    const sessions = await this.store.listByUser(input.userId);

    // Evict oldest sessions if at or over limit
    while (sessions.length >= this.config.maxPerUser) {
      const oldestSession = sessions.pop();
      if (oldestSession) {
        await this.store.revoke(oldestSession.sessionId);
        if (this.config.debug) {
          logger.debug(
            { userId: input.userId, revokedSessionId: oldestSession.sessionId },
            'Evicted oldest session due to max limit',
          );
        }
      }
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

    if (session.tokenHash !== tokenHash) {
      return { isValid: false, session, reason: 'invalid' };
    }

    await this.store.touch(sessionId);

    return { isValid: true, session };
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.store.touch(sessionId);
  }

  async updateSessionToken(sessionId: string, token: string): Promise<void> {
    await this.store.updateTokenHash(sessionId, token);

    if (this.config.debug) {
      logger.info({ sessionId }, 'Session token updated');
    }
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

  async cleanupSessions(
    type: 'full' | 'revoked' | 'expired',
  ): Promise<CleanupStats> {
    const stats: CleanupStats = {
      revokedDeleted: 0,
      expiredDeleted: 0,
      orphanedKeysDeleted: 0,
      totalProcessed: 0,
    };

    if (type === 'full' || type === 'revoked') {
      stats.revokedDeleted = await this.store.deleteRevoked();
    }

    if (type === 'full' || type === 'expired') {
      stats.expiredDeleted = await this.store.deleteExpired();
    }

    if (type === 'full' && this.config.driver === 'redis') {
      stats.orphanedKeysDeleted =
        (await this.store.cleanupOrphanedKeys?.()) || 0;
    }

    stats.totalProcessed =
      stats.revokedDeleted +
      stats.expiredDeleted +
      (stats.orphanedKeysDeleted || 0);

    if (this.config.debug) {
      logger.info({ stats }, 'Session cleanup stats');
    }

    return stats;
  }

  async cleanupUserSessions(userId: string): Promise<number> {
    return this.store.deleteUserExpiredSessions?.(userId) || 0;
  }

  async cleanup(): Promise<void> {
    await this.store.close();
  }

  getConfig(): SessionStoreConfig {
    return { ...this.config };
  }
}

let sessionManagerInstance: SessionManager | null = null;
let initPromise: Promise<SessionManager> | null = null;

export async function initializeSessionManager(
  config?: Partial<SessionStoreConfig>,
): Promise<SessionManager> {
  // If already initialized, return the existing instance
  if (sessionManagerInstance) {
    return sessionManagerInstance;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // Start initialization
  initPromise = Promise.resolve()
    .then(() => {
      if (!sessionManagerInstance) {
        sessionManagerInstance = new SessionManager(config);
      }
      return sessionManagerInstance;
    })
    .finally(() => {
      initPromise = null;
    });

  return initPromise;
}

export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    throw new Error(
      'SessionManager not initialized. Call initializeSessionManager first.',
    );
  }
  return sessionManagerInstance;
}
