import type { Redis } from 'ioredis';
import type { SessionStore, CreateSessionInput, SessionRecord } from './session.types';
import { generateSessionId, hashToken, calculateExpiresAt } from './session.utils';
import { createChildLogger } from '../../../observability/logger';

const logger = createChildLogger({ context: 'RedisSessionStore' });

const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';

export class RedisSessionStore implements SessionStore {
  constructor(private redis: Redis) {}

  private getSessionKey(sessionId: string): string {
    return `${SESSION_PREFIX}${sessionId}`;
  }

  private getUserSessionsKey(userId: string): string {
    return `${USER_SESSIONS_PREFIX}${userId}`;
  }

  async create(input: CreateSessionInput): Promise<SessionRecord> {
    const sessionId = generateSessionId();
    const tokenHash = hashToken(input.token);
    const now = new Date();
    const expiresAt = calculateExpiresAt(input.expiresIn);

    const session: SessionRecord = {
      sessionId,
      userId: input.userId,
      tokenHash,
      metadata: input.metadata,
      createdAt: now,
      lastSeen: now,
      expiresAt,
      isRevoked: false,
    };

    const sessionKey = this.getSessionKey(sessionId);
    const userSessionsKey = this.getUserSessionsKey(input.userId);
    const ttl = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

    await this.redis
      .multi()
      .set(sessionKey, JSON.stringify(session), 'EX', ttl)
      .zadd(userSessionsKey, now.getTime(), sessionId)
      .expire(userSessionsKey, ttl)
      .exec();

    logger.debug({ sessionId, userId: input.userId }, 'Session created');

    return session;
  }

  async get(sessionId: string): Promise<SessionRecord | null> {
    const sessionKey = this.getSessionKey(sessionId);
    const data = await this.redis.get(sessionKey);

    if (!data) {
      return null;
    }

    return JSON.parse(data, (key, value) => {
      if (key === 'createdAt' || key === 'lastSeen' || key === 'expiresAt') {
        return new Date(value);
      }
      return value;
    });
  }

  async listByUser(userId: string): Promise<SessionRecord[]> {
    const userSessionsKey = this.getUserSessionsKey(userId);
    const sessionIds = await this.redis.zrevrange(userSessionsKey, 0, -1);

    if (!sessionIds.length) {
      return [];
    }

    const pipeline = this.redis.pipeline();
    for (const sessionId of sessionIds) {
      pipeline.get(this.getSessionKey(sessionId));
    }

    const results = await pipeline.exec();
    const sessions: SessionRecord[] = [];

    if (!results) return sessions;

    for (const [err, data] of results) {
      if (!err && data) {
        const session = JSON.parse(data as string, (key, value) => {
          if (key === 'createdAt' || key === 'lastSeen' || key === 'expiresAt') {
            return new Date(value);
          }
          return value;
        });
        if (!session.isRevoked) {
          sessions.push(session);
        }
      }
    }

    return sessions;
  }

  async touch(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    session.lastSeen = new Date();
    const sessionKey = this.getSessionKey(sessionId);
    const ttl = await this.redis.ttl(sessionKey);

    if (ttl > 0) {
      await this.redis.set(sessionKey, JSON.stringify(session), 'EX', ttl);
    }
  }

  async updateTokenHash(sessionId: string, token: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    const tokenHash = hashToken(token);
    session.tokenHash = tokenHash;
    
    const sessionKey = this.getSessionKey(sessionId);
    const ttl = await this.redis.ttl(sessionKey);

    if (ttl > 0) {
      await this.redis.set(sessionKey, JSON.stringify(session), 'EX', ttl);
    }
    
    logger.debug({ sessionId }, 'Session token hash updated');
  }

  async revoke(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    session.isRevoked = true;
    const sessionKey = this.getSessionKey(sessionId);
    const ttl = await this.redis.ttl(sessionKey);

    if (ttl > 0) {
      await this.redis.set(sessionKey, JSON.stringify(session), 'EX', ttl);
    }

    logger.debug({ sessionId }, 'Session revoked');
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const sessions = await this.listByUser(userId);
    
    if (!sessions.length) return;

    const pipeline = this.redis.pipeline();
    
    for (const session of sessions) {
      session.isRevoked = true;
      const sessionKey = this.getSessionKey(session.sessionId);
      const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
      
      if (ttl > 0) {
        pipeline.set(sessionKey, JSON.stringify(session), 'EX', ttl);
      }
    }

    await pipeline.exec();
    
    logger.debug({ userId }, 'All sessions revoked for user');
  }

  async pruneExpired(): Promise<void> {
    // Redis automatically handles expiration via TTL, no manual pruning needed
    logger.debug('Redis handles expiration automatically via TTL');
  }

  async close(): Promise<void> {
    // Redis connection is managed globally, no specific cleanup needed
  }
}
