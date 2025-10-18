import type { RedisOptions } from 'ioredis';
import Redis from 'ioredis';
import config from '../config/env';
import logger from '../observability/logger';
import { CacheError } from './errors';

/**
 * Batch set entry for cache providers
 */
export type CacheBatchSetEntry = {
  key: string;
  value: string;
  ttl?: number;
};

/**
 * Abstract cache provider interface
 * All cache providers must implement this interface
 */
export interface CacheProvider {
  // Basic operations
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;

  // Bulk operations
  mget(keys: string[]): Promise<(string | null)[]>;
  mset(entries: CacheBatchSetEntry[]): Promise<void>;
  mdel(keys: string[]): Promise<void>;

  // Advanced operations
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, ttl: number): Promise<void>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  clear(pattern?: string): Promise<void>;

  // Health check
  healthCheck(): Promise<boolean>;
}

/**
 * Redis cache provider implementation
 * Production-ready cache provider using ioredis
 */
export class RedisProvider implements CacheProvider {
  private client: Redis;

  constructor() {
    const redisOptions: RedisOptions = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false,
    };

    this.client = new Redis(config.REDIS_URL || '', redisOptions);

    // Connection event listeners
    this.client.on('connect', () => {
      logger.info({ provider: 'redis' }, 'Cache client connected to Redis');
    });

    this.client.on('ready', () => {
      logger.info({ provider: 'redis' }, 'Cache client ready');
    });

    this.client.on('error', (err) => {
      logger.error({ provider: 'redis', err }, 'Cache client error');
    });

    this.client.on('close', () => {
      logger.warn({ provider: 'redis' }, 'Cache client connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info({ provider: 'redis' }, 'Cache client reconnecting to Redis');
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      logger.error({ provider: 'redis', key, err }, 'Failed to get cache key');
      throw new CacheError('Failed to get cache key', err);
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      logger.error({ provider: 'redis', key, ttl, err }, 'Failed to set cache key');
      throw new CacheError('Failed to set cache key', err);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.error({ provider: 'redis', key, err }, 'Failed to delete cache key');
      throw new CacheError('Failed to delete cache key', err);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (err) {
      logger.error({ provider: 'redis', key, err }, 'Failed to check cache key existence');
      throw new CacheError('Failed to check cache key existence', err);
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      if (keys.length === 0) return [];
      return await this.client.mget(...keys);
    } catch (err) {
      logger.error({ provider: 'redis', keys, err }, 'Failed to get multiple cache keys');
      throw new CacheError('Failed to get multiple cache keys', err);
    }
  }

  async mset(entries: CacheBatchSetEntry[]): Promise<void> {
    try {
      if (entries.length === 0) return;

      // Use pipeline for better performance
      const pipeline = this.client.pipeline();

      for (const entry of entries) {
        if (entry.ttl) {
          pipeline.setex(entry.key, entry.ttl, entry.value);
        } else {
          pipeline.set(entry.key, entry.value);
        }
      }

      await pipeline.exec();
    } catch (err) {
      logger.error({ provider: 'redis', entries: entries.length, err }, 'Failed to set multiple cache keys');
      throw new CacheError('Failed to set multiple cache keys', err);
    }
  }

  async mdel(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;
      await this.client.del(...keys);
    } catch (err) {
      logger.error({ provider: 'redis', keys, err }, 'Failed to delete multiple cache keys');
      throw new CacheError('Failed to delete multiple cache keys', err);
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (err) {
      logger.error({ provider: 'redis', key, err }, 'Failed to increment cache key');
      throw new CacheError('Failed to increment cache key', err);
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (err) {
      logger.error({ provider: 'redis', key, err }, 'Failed to decrement cache key');
      throw new CacheError('Failed to decrement cache key', err);
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (err) {
      logger.error({ provider: 'redis', key, ttl, err }, 'Failed to set cache key expiration');
      throw new CacheError('Failed to set cache key expiration', err);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (err) {
      logger.error({ provider: 'redis', key, err }, 'Failed to get cache key TTL');
      throw new CacheError('Failed to get cache key TTL', err);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (err) {
      logger.error({ provider: 'redis', pattern, err }, 'Failed to get cache keys by pattern');
      throw new CacheError('Failed to get cache keys by pattern', err);
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = await this.keys(pattern);
        if (keys.length > 0) {
          await this.mdel(keys);
        }
      } else {
        await this.client.flushdb();
      }
    } catch (err) {
      logger.error({ provider: 'redis', pattern, err }, 'Failed to clear cache');
      throw new CacheError('Failed to clear cache', err);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (err) {
      logger.error({ provider: 'redis', err }, 'Cache health check failed');
      return false;
    }
  }

  /**
   * Get raw Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }
}

/**
 * In-memory cache provider implementation
 * Uses LRU eviction and TTL cleanup for development/testing
 */
export class MemoryProvider implements CacheProvider {
  private cache: Map<string, { value: string; expiresAt: number | null }>;
  private accessOrder: Map<string, number>; // For LRU tracking
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null;
  private accessCounter: number;

  constructor(maxSize = 1000, cleanupIntervalMs = 60000) {
    this.cache = new Map();
    this.accessOrder = new Map();
    this.maxSize = maxSize;
    this.cleanupInterval = null;
    this.accessCounter = 0;

    // Start periodic cleanup of expired entries
    this.startCleanup(cleanupIntervalMs);

    logger.info({ provider: 'memory', maxSize, cleanupIntervalMs }, 'Memory cache provider initialized');
  }

  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug({ provider: 'memory', cleaned }, 'Cleaned up expired cache entries');
    }
  }

  private evictLRU(): void {
    if (this.cache.size === 0) return;

    // Find the least recently used key
    let lruKey: string | null = null;
    let lruAccess = Number.POSITIVE_INFINITY;

    for (const [key, access] of this.accessOrder.entries()) {
      if (access < lruAccess) {
        lruAccess = access;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.accessOrder.delete(lruKey);
      logger.debug({ provider: 'memory', key: lruKey }, 'Evicted LRU cache entry');
    }
  }

  private updateAccess(key: string): void {
    this.accessOrder.set(key, ++this.accessCounter);
  }

  private isExpired(entry: { value: string; expiresAt: number | null }): boolean {
    return entry.expiresAt !== null && entry.expiresAt <= Date.now();
  }

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    this.updateAccess(key);
    return entry.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    // Check if we need to evict
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, { value, expiresAt });
    this.updateAccess(key);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return false;
    }

    return true;
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return Promise.all(keys.map((key) => this.get(key)));
  }

  async mset(entries: CacheBatchSetEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl);
    }
  }

  async mdel(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.del(key);
    }
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const value = current ? Number.parseInt(current, 10) : 0;
    const newValue = value + 1;
    await this.set(key, String(newValue));
    return newValue;
  }

  async decr(key: string): Promise<number> {
    const current = await this.get(key);
    const value = current ? Number.parseInt(current, 10) : 0;
    const newValue = value - 1;
    await this.set(key, String(newValue));
    return newValue;
  }

  async expire(key: string, ttl: number): Promise<void> {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttl * 1000;
    }
  }

  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key);

    if (!entry) {
      return -2; // Key does not exist
    }

    if (entry.expiresAt === null) {
      return -1; // Key has no expiration
    }

    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2; // Return -2 if expired
  }

  async keys(pattern: string): Promise<string[]> {
    // Simple pattern matching (* wildcard)
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    const matchingKeys: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        const entry = this.cache.get(key);
        if (entry && !this.isExpired(entry)) {
          matchingKeys.push(key);
        }
      }
    }

    return matchingKeys;
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = await this.keys(pattern);
      await this.mdel(keys);
    } else {
      this.cache.clear();
      this.accessOrder.clear();
    }
  }

  async healthCheck(): Promise<boolean> {
    return true; // Memory provider is always healthy
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Cleanup and stop periodic cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    this.accessOrder.clear();
  }
}

/**
 * Factory function to create the appropriate cache provider
 * Supports Redis (production) and Memory (development/testing)
 */
const createCacheProvider = (): CacheProvider => {
  const provider = config.CACHE_PROVIDER || 'redis';

  logger.info({ provider }, `Initializing ${provider.toUpperCase()} cache provider`);

  switch (provider) {
    case 'redis':
      return new RedisProvider();

    case 'memory':
      return new MemoryProvider();

    default:
      throw new CacheError(`Unsupported cache provider: ${provider}`);
  }
};

/**
 * Auto-initialized cache provider singleton
 */
export const cacheProvider = createCacheProvider();

/**
 * Legacy export for backward compatibility
 * @deprecated Use cacheProvider instead
 */
export const cacheClient = cacheProvider instanceof RedisProvider
  ? cacheProvider.getClient()
  : null;

/**
 * Health check function for cache connection
 * Returns a function compatible with HealthCheck interface
 */
export const checkCacheHealth = () => {
  return async (): Promise<boolean> => {
    try {
      return await cacheProvider.healthCheck();
    } catch (err) {
      logger.error({ err }, 'Cache health check failed');
      return false;
    }
  };
};
