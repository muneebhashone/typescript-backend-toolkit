import { promisify } from 'node:util';
import { gzip, gunzip } from 'node:zlib';
import { cacheProvider } from '@/lib/cache';
import logger from '@/observability/logger';
import { metricsCollector } from '@/observability/metrics';
import { CacheError } from '@/lib/errors';
import type {
  CacheWrapOptions,
  CacheServiceOptions,
  BatchSetEntry,
  CacheStats,
  CacheWarmEntry,
} from './types';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * High-level cache service with advanced features
 * Wraps the cache provider with convenience methods and additional functionality
 */
export class CacheService {
  private prefix: string;
  private defaultTtl: number;
  private compressionEnabled: boolean;
  private compressionThreshold: number;
  private enableMetrics: boolean;
  private stats: { hits: number; misses: number };
  private tagKeyPrefix = '__tag__:';

  constructor(options: CacheServiceOptions = {}) {
    this.prefix = options.prefix || '';
    this.defaultTtl = options.defaultTtl || 3600;
    this.compressionEnabled = options.compressionEnabled || false;
    this.compressionThreshold = options.compressionThreshold || 1024; // 1KB
    this.enableMetrics = options.enableMetrics !== false;
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get prefixed key
   */
  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}${key}` : key;
  }

  /**
   * Get tag key for tag-based invalidation
   */
  private getTagKey(tag: string): string {
    return this.getKey(`${this.tagKeyPrefix}${tag}`);
  }

  /**
   * Compress data if it exceeds the threshold
   */
  private async maybeCompress(data: string): Promise<{ data: string; compressed: boolean }> {
    if (!this.compressionEnabled || data.length < this.compressionThreshold) {
      return { data, compressed: false };
    }

    try {
      const compressed = await gzipAsync(Buffer.from(data, 'utf-8'));
      return { data: compressed.toString('base64'), compressed: true };
    } catch (err) {
      logger.warn({ err }, 'Failed to compress cache data, storing uncompressed');
      return { data, compressed: false };
    }
  }

  /**
   * Decompress data if it was compressed
   */
  private async maybeDecompress(data: string, compressed: boolean): Promise<string> {
    if (!compressed) {
      return data;
    }

    try {
      const decompressed = await gunzipAsync(Buffer.from(data, 'base64'));
      return decompressed.toString('utf-8');
    } catch (err) {
      logger.error({ err }, 'Failed to decompress cache data');
      throw new CacheError('Failed to decompress cache data', err);
    }
  }

  /**
   * Record cache hit for metrics
   */
  private recordHit(key: string): void {
    this.stats.hits++;
    if (this.enableMetrics) {
      metricsCollector.incrementCacheHits(key);
    }
  }

  /**
   * Record cache miss for metrics
   */
  private recordMiss(key: string): void {
    this.stats.misses++;
    if (this.enableMetrics) {
      metricsCollector.incrementCacheMisses(key);
    }
  }

  /**
   * Get a value from cache with automatic JSON deserialization
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const prefixedKey = this.getKey(key);

    try {
      const raw = await cacheProvider.get(prefixedKey);

      if (raw === null) {
        this.recordMiss(key);
        return null;
      }

      this.recordHit(key);

      // Check if data is compressed (starts with metadata marker)
      const isCompressed = raw.startsWith('__COMPRESSED__:');
      const data = isCompressed ? raw.substring(15) : raw;

      const decompressed = await this.maybeDecompress(data, isCompressed);
      return JSON.parse(decompressed) as T;
    } catch (err) {
      logger.error({ key, err }, 'Failed to get cache value');
      this.recordMiss(key);
      return null;
    }
  }

  /**
   * Set a value in cache with automatic JSON serialization
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const prefixedKey = this.getKey(key);
    const effectiveTtl = ttl || this.defaultTtl;

    try {
      const serialized = JSON.stringify(value);
      const { data, compressed } = await this.maybeCompress(serialized);

      // Add compression marker if compressed
      const finalData = compressed ? `__COMPRESSED__:${data}` : data;

      await cacheProvider.set(prefixedKey, finalData, effectiveTtl);
    } catch (err) {
      logger.error({ key, ttl: effectiveTtl, err }, 'Failed to set cache value');
      throw new CacheError('Failed to set cache value', err);
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    const prefixedKey = this.getKey(key);

    try {
      await cacheProvider.del(prefixedKey);
    } catch (err) {
      logger.error({ key, err }, 'Failed to delete cache value');
      throw new CacheError('Failed to delete cache value', err);
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const prefixedKey = this.getKey(key);

    try {
      return await cacheProvider.exists(prefixedKey);
    } catch (err) {
      logger.error({ key, err }, 'Failed to check cache key existence');
      return false;
    }
  }

  /**
   * Get multiple values from cache
   */
  async getMany<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    if (keys.length === 0) return new Map();

    const prefixedKeys = keys.map((k) => this.getKey(k));
    const result = new Map<string, T>();

    try {
      const values = await cacheProvider.mget(prefixedKeys);

      for (let i = 0; i < keys.length; i++) {
        const raw = values[i];
        if (raw !== null) {
          try {
            const isCompressed = raw.startsWith('__COMPRESSED__:');
            const data = isCompressed ? raw.substring(15) : raw;
            const decompressed = await this.maybeDecompress(data, isCompressed);
            result.set(keys[i], JSON.parse(decompressed) as T);
            this.recordHit(keys[i]);
          } catch (err) {
            logger.warn({ key: keys[i], err }, 'Failed to parse cached value');
            this.recordMiss(keys[i]);
          }
        } else {
          this.recordMiss(keys[i]);
        }
      }

      return result;
    } catch (err) {
      logger.error({ keys, err }, 'Failed to get multiple cache values');
      return result;
    }
  }

  /**
   * Set multiple values in cache
   */
  async setMany<T = unknown>(entries: Map<string, T>, ttl?: number): Promise<void> {
    if (entries.size === 0) return;

    const effectiveTtl = ttl || this.defaultTtl;
    const batchEntries: Array<{ key: string; value: string; ttl: number }> = [];

    try {
      for (const [key, value] of entries.entries()) {
        const serialized = JSON.stringify(value);
        const { data, compressed } = await this.maybeCompress(serialized);
        const finalData = compressed ? `__COMPRESSED__:${data}` : data;

        batchEntries.push({
          key: this.getKey(key),
          value: finalData,
          ttl: effectiveTtl,
        });
      }

      await cacheProvider.mset(batchEntries);
    } catch (err) {
      logger.error({ entries: entries.size, ttl: effectiveTtl, err }, 'Failed to set multiple cache values');
      throw new CacheError('Failed to set multiple cache values', err);
    }
  }

  /**
   * Delete multiple values from cache
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const prefixedKeys = keys.map((k) => this.getKey(k));

    try {
      await cacheProvider.mdel(prefixedKeys);
    } catch (err) {
      logger.error({ keys, err }, 'Failed to delete multiple cache values');
      throw new CacheError('Failed to delete multiple cache values', err);
    }
  }

  /**
   * Cache-aside pattern: get from cache or execute function and cache result
   */
  async wrap<T = unknown>(
    key: string,
    fn: () => Promise<T>,
    options: CacheWrapOptions = {}
  ): Promise<T> {
    const { ttl, tags, staleTime, compress, forceRefresh } = options;

    // Check if we should force refresh
    if (forceRefresh) {
      const value = await fn();
      await this.setWithTags(key, value, tags || [], ttl);
      return value;
    }

    // Try to get from cache
    const cached = await this.get<T>(key);

    if (cached !== null) {
      // Handle stale-while-revalidate
      if (staleTime) {
        const ttlRemaining = await cacheProvider.ttl(this.getKey(key));
        const effectiveTtl = ttl || this.defaultTtl;
        const isStale = ttlRemaining > 0 && ttlRemaining < (effectiveTtl - staleTime);

        if (isStale) {
          // Revalidate in background
          fn()
            .then((value) => this.setWithTags(key, value, tags || [], ttl))
            .catch((err) => logger.error({ key, err }, 'Failed to revalidate stale cache'));
        }
      }

      return cached;
    }

    // Cache miss - execute function and cache result
    const value = await fn();
    await this.setWithTags(key, value, tags || [], ttl);
    return value;
  }

  /**
   * Set a value with tags for invalidation
   */
  async setWithTags<T = unknown>(
    key: string,
    value: T,
    tags: string[],
    ttl?: number
  ): Promise<void> {
    // Set the actual value
    await this.set(key, value, ttl);

    // Store the key in each tag's set
    if (tags.length > 0) {
      const effectiveTtl = ttl || this.defaultTtl;

      for (const tag of tags) {
        const tagKey = this.getTagKey(tag);

        try {
          // Get current tag keys
          const currentKeys = await cacheProvider.get(tagKey);
          const keySet = currentKeys ? new Set(JSON.parse(currentKeys)) : new Set<string>();

          // Add this key to the set
          keySet.add(key);

          // Save back with same TTL as the data (add some buffer)
          await cacheProvider.set(
            tagKey,
            JSON.stringify([...keySet]),
            effectiveTtl + 300 // Add 5 minutes buffer
          );
        } catch (err) {
          logger.warn({ tag, key, err }, 'Failed to update tag mapping');
        }
      }
    }
  }

  /**
   * Invalidate cache entries by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    if (tags.length === 0) return;

    const keysToDelete = new Set<string>();

    for (const tag of tags) {
      const tagKey = this.getTagKey(tag);

      try {
        const raw = await cacheProvider.get(tagKey);
        if (raw) {
          const keys = JSON.parse(raw) as string[];
          for (const key of keys) {
            keysToDelete.add(key);
          }

          // Delete the tag key itself
          await cacheProvider.del(tagKey);
        }
      } catch (err) {
        logger.warn({ tag, err }, 'Failed to invalidate by tag');
      }
    }

    if (keysToDelete.size > 0) {
      await this.deleteMany([...keysToDelete]);
      logger.info({ tags, keys: keysToDelete.size }, 'Invalidated cache by tags');
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const prefixedPattern = this.getKey(pattern);
      const keys = await cacheProvider.keys(prefixedPattern);

      if (keys.length > 0) {
        // Remove prefix from keys for deletion
        const unprefixedKeys = keys.map((k) =>
          this.prefix && k.startsWith(this.prefix) ? k.substring(this.prefix.length) : k
        );

        await this.deleteMany(unprefixedKeys);
        logger.info({ pattern, keys: keys.length }, 'Invalidated cache by pattern');
      }
    } catch (err) {
      logger.error({ pattern, err }, 'Failed to invalidate by pattern');
      throw new CacheError('Failed to invalidate by pattern', err);
    }
  }

  /**
   * Increment a counter
   */
  async increment(key: string, by = 1): Promise<number> {
    const prefixedKey = this.getKey(key);

    try {
      if (by === 1) {
        return await cacheProvider.incr(prefixedKey);
      }

      // For custom increment values
      const current = await this.get<number>(key) || 0;
      const newValue = current + by;
      await this.set(key, newValue);
      return newValue;
    } catch (err) {
      logger.error({ key, by, err }, 'Failed to increment cache value');
      throw new CacheError('Failed to increment cache value', err);
    }
  }

  /**
   * Decrement a counter
   */
  async decrement(key: string, by = 1): Promise<number> {
    const prefixedKey = this.getKey(key);

    try {
      if (by === 1) {
        return await cacheProvider.decr(prefixedKey);
      }

      // For custom decrement values
      const current = await this.get<number>(key) || 0;
      const newValue = current - by;
      await this.set(key, newValue);
      return newValue;
    } catch (err) {
      logger.error({ key, by, err }, 'Failed to decrement cache value');
      throw new CacheError('Failed to decrement cache value', err);
    }
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, ttl: number): Promise<void> {
    const prefixedKey = this.getKey(key);

    try {
      await cacheProvider.expire(prefixedKey, ttl);
    } catch (err) {
      logger.error({ key, ttl, err }, 'Failed to set expiration');
      throw new CacheError('Failed to set expiration', err);
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    const prefixedKey = this.getKey(key);

    try {
      return await cacheProvider.ttl(prefixedKey);
    } catch (err) {
      logger.error({ key, err }, 'Failed to get TTL');
      throw new CacheError('Failed to get TTL', err);
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const prefixedPattern = this.getKey(pattern);
      const keys = await cacheProvider.keys(prefixedPattern);

      // Remove prefix from returned keys
      return keys.map((k) =>
        this.prefix && k.startsWith(this.prefix) ? k.substring(this.prefix.length) : k
      );
    } catch (err) {
      logger.error({ pattern, err }, 'Failed to get keys');
      throw new CacheError('Failed to get keys', err);
    }
  }

  /**
   * Clear all cache or by pattern
   */
  async clear(pattern?: string): Promise<void> {
    try {
      const prefixedPattern = pattern ? this.getKey(pattern) : undefined;
      await cacheProvider.clear(prefixedPattern);
      logger.info({ pattern }, 'Cleared cache');
    } catch (err) {
      logger.error({ pattern, err }, 'Failed to clear cache');
      throw new CacheError('Failed to clear cache', err);
    }
  }

  /**
   * Warm cache with multiple entries
   */
  async warm<T = unknown>(entries: CacheWarmEntry<T>[]): Promise<void> {
    logger.info({ entries: entries.length }, 'Warming cache');

    for (const entry of entries) {
      try {
        if (entry.tags && entry.tags.length > 0) {
          await this.setWithTags(entry.key, entry.value, entry.tags, entry.ttl);
        } else {
          await this.set(entry.key, entry.value, entry.ttl);
        }
      } catch (err) {
        logger.warn({ key: entry.key, err }, 'Failed to warm cache entry');
      }
    }

    logger.info({ entries: entries.length }, 'Cache warming completed');
  }

  /**
   * Create a new cache service with a different prefix
   */
  withPrefix(prefix: string): CacheService {
    return new CacheService({
      prefix: this.prefix + prefix,
      defaultTtl: this.defaultTtl,
      compressionEnabled: this.compressionEnabled,
      compressionThreshold: this.compressionThreshold,
      enableMetrics: this.enableMetrics,
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
  }
}
