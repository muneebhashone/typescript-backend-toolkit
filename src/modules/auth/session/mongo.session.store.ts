import type { SessionStore, CreateSessionInput, SessionRecord } from './session.types';
import { SessionModel } from './session.model';
import { hashToken, calculateExpiresAt } from './session.utils';
import { createChildLogger } from '../../../observability/logger';

const logger = createChildLogger({ context: 'MongoSessionStore' });

export class MongoSessionStore implements SessionStore {
  async create(input: CreateSessionInput): Promise<SessionRecord> {
    const tokenHash = hashToken(input.token);
    const expiresAt = calculateExpiresAt(input.expiresIn);

    const session = await SessionModel.create({
      userId: input.userId,
      tokenHash,
      metadata: input.metadata,
      lastSeen: new Date(),
      expiresAt,
      isRevoked: false,
    });

    logger.debug({ sessionId: session._id, userId: input.userId }, 'Session created');

    return {
      sessionId: session._id.toString(),
      userId: session.userId,
      tokenHash: session.tokenHash,
      metadata: session.metadata,
      createdAt: session.createdAt!,
      lastSeen: session.lastSeen,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
    };
  }

  async get(sessionId: string): Promise<SessionRecord | null> {
    const session = await SessionModel.findById(sessionId);
    
    if (!session) {
      return null;
    }

    return {
      sessionId: session._id.toString(),
      userId: session.userId,
      tokenHash: session.tokenHash,
      metadata: session.metadata,
      createdAt: session.createdAt!,
      lastSeen: session.lastSeen,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
    };
  }

  async listByUser(userId: string): Promise<SessionRecord[]> {
    const sessions = await SessionModel.find({ userId, isRevoked: false })
      .sort({ createdAt: -1 })
      .lean();

    return sessions.map(session => ({
      sessionId: session._id.toString(),
      userId: session.userId,
      tokenHash: session.tokenHash,
      metadata: session.metadata,
      createdAt: session.createdAt!,
      lastSeen: session.lastSeen,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
    }));
  }

  async touch(sessionId: string): Promise<void> {
    await SessionModel.findByIdAndUpdate(sessionId, {
      lastSeen: new Date(),
    });
  }

  async revoke(sessionId: string): Promise<void> {
    await SessionModel.findByIdAndUpdate(sessionId, {
      isRevoked: true,
    });
    
    logger.debug({ sessionId }, 'Session revoked');
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await SessionModel.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    
    logger.debug({ userId }, 'All sessions revoked for user');
  }

  async pruneExpired(): Promise<void> {
    const result = await SessionModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    
    if (result.deletedCount && result.deletedCount > 0) {
      logger.debug({ count: result.deletedCount }, 'Expired sessions pruned');
    }
  }

  async close(): Promise<void> {
    // MongoDB connection is managed globally, no specific cleanup needed
  }
}
