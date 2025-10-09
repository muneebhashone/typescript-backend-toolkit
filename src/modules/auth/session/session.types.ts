export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  tokenHash: string;
  metadata?: SessionMetadata;
  createdAt: Date;
  lastSeen: Date;
  expiresAt: Date;
  isRevoked?: boolean;
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: SessionRecord;
  reason?: 'expired' | 'revoked' | 'not_found' | 'invalid';
}

export interface SessionStoreConfig {
  driver: 'mongo' | 'redis';
  maxPerUser: number;
  idleTTL?: number;
  absoluteTTL?: number;
  rotation: boolean;
  debug: boolean;
}

export interface CreateSessionInput {
  userId: string;
  token: string;
  metadata?: SessionMetadata;
  expiresIn?: number;
}

export interface SessionStore {
  create(input: CreateSessionInput): Promise<SessionRecord>;
  get(sessionId: string): Promise<SessionRecord | null>;
  listByUser(userId: string): Promise<SessionRecord[]>;
  touch(sessionId: string): Promise<void>;
  revoke(sessionId: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  pruneExpired(): Promise<void>;
  close(): Promise<void>;
  updateTokenHash(sessionId: string, token: string): Promise<void>;
  deleteRevoked(): Promise<number>;
  deleteExpired(): Promise<number>;
  deleteUserExpiredSessions?(userId: string): Promise<number>;
  cleanupOrphanedKeys?(): Promise<number>;
}

export interface CleanupStats {
  revokedDeleted: number;
  expiredDeleted: number;
  orphanedKeysDeleted?: number;
  totalProcessed: number;
}
