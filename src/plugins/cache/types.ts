import type { NextFunction } from 'express';
import type { RequestAny, ResponseAny, MagicMiddleware } from '@/openapi/magic-router';

/**
 * Cache key generator function type
 * Receives full request object for dynamic key generation
 */
export type CacheKeyGenerator = (req: RequestAny) => string | Promise<string>;

/**
 * Cache tag resolver function type
 * Receives full request object for dynamic tag generation
 */
export type CacheTagResolver = (req: RequestAny) => string[] | Promise<string[]>;

/**
 * Cache pattern resolver function type
 * Receives full request object for dynamic pattern generation
 */
export type CachePatternResolver = (req: RequestAny) => string[] | Promise<string[]>;

/**
 * Cache key resolver function type
 * Receives full request object for dynamic key generation
 */
export type CacheKeyResolver = (req: RequestAny) => string[] | Promise<string[]>;

/**
 * Cache condition function type
 * Determines whether to cache based on request
 */
export type CacheCondition = (req: RequestAny) => boolean | Promise<boolean>;

/**
 * Fields that can be used to vary cache keys
 */
export type VaryByField = 'userId' | 'url' | 'query' | 'params' | 'headers' | 'method';

/**
 * Options for response caching middleware
 */
export type CacheMiddlewareOptions = {
  /**
   * Time to live in seconds
   * @default 3600
   */
  ttl?: number;

  /**
   * Cache key - can be static string or dynamic function with request access
   * If not provided, auto-generated from URL and varyBy fields
   */
  key?: string | CacheKeyGenerator;

  /**
   * Vary cache by specific request fields
   * Auto-generates cache keys based on these fields
   */
  varyBy?: VaryByField[];

  /**
   * Specific headers to vary by (e.g., ['accept-language'])
   */
  varyByHeaders?: string[];

  /**
   * Tags for cache invalidation
   * Can be static array or dynamic function with request access
   */
  tags?: string[] | CacheTagResolver;

  /**
   * Conditional caching based on request
   * Return false to skip caching
   */
  condition?: CacheCondition;

  /**
   * Enable stale-while-revalidate pattern
   * Serves stale data while fetching fresh data in background
   * @default false
   */
  staleWhileRevalidate?: boolean;

  /**
   * Time in seconds before cache is considered stale (for stale-while-revalidate)
   * @default ttl / 2
   */
  staleTime?: number;

  /**
   * Compress cached data if larger than threshold
   * @default false
   */
  compress?: boolean;

  /**
   * Include user context in cache key
   * Shorthand for varyBy: ['userId']
   * @default false
   */
  private?: boolean;

  /**
   * Skip cache if true (useful for debugging)
   * @default false
   */
  skip?: boolean;
};

/**
 * Timing for cache invalidation
 */
export type InvalidationTiming = 'before' | 'after';

/**
 * Options for cache invalidation middleware
 */
export type InvalidateOptions = {
  /**
   * Tags to invalidate
   * Can be static array or dynamic function with request access
   */
  tags?: string[] | CacheTagResolver;

  /**
   * Patterns to invalidate (e.g., 'users:*')
   * Can be static array or dynamic function with request access
   */
  patterns?: string[] | CachePatternResolver;

  /**
   * Specific keys to invalidate
   * Can be static array or dynamic function with request access
   */
  keys?: string[] | CacheKeyResolver;

  /**
   * When to perform invalidation
   * - 'before': Invalidate before handler executes
   * - 'after': Invalidate after successful response (status 2xx)
   * @default 'after'
   */
  timing?: InvalidationTiming;

  /**
   * Only invalidate if condition is met
   */
  condition?: CacheCondition;
};

/**
 * Cache entry with metadata
 */
export type CacheEntry<T = unknown> = {
  value: T;
  createdAt: number;
  expiresAt: number;
  tags?: string[];
  compressed?: boolean;
};

/**
 * Cache statistics
 */
export type CacheStats = {
  hits: number;
  misses: number;
  hitRate: number;
  size?: number;
  keys?: number;
};

/**
 * Cache warming entry
 */
export type CacheWarmEntry<T = unknown> = {
  key: string;
  value: T;
  ttl?: number;
  tags?: string[];
};

/**
 * Options for cache.wrap() method
 */
export type CacheWrapOptions = {
  ttl?: number;
  tags?: string[];
  staleTime?: number;
  compress?: boolean;
  forceRefresh?: boolean;
};

/**
 * Options for cache service initialization
 */
export type CacheServiceOptions = {
  prefix?: string;
  defaultTtl?: number;
  compressionEnabled?: boolean;
  compressionThreshold?: number;
  enableMetrics?: boolean;
};

/**
 * Batch set entry
 */
export type BatchSetEntry<T = unknown> = {
  key: string;
  value: T;
  ttl?: number;
  tags?: string[];
};
