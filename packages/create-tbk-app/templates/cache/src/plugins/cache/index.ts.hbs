import type { ToolkitPlugin, PluginFactory } from '../types';
import config from '@/config/env';
import logger from '@/plugins/observability/logger';
import { CacheService } from './cache.service';
import { initializeCacheMiddleware } from './cache.middleware';

/**
 * Cache plugin options
 */
export interface CachePluginOptions {
  /**
   * Enable/disable caching
   * @default true
   */
  enabled?: boolean;

  /**
   * Cache provider ('redis' or 'memory')
   * Defaults to config.CACHE_PROVIDER
   */
  provider?: 'redis' | 'memory';

  /**
   * Global cache key prefix
   * Defaults to config.CACHE_PREFIX
   */
  prefix?: string;

  /**
   * Default TTL in seconds
   * Defaults to config.CACHE_DEFAULT_TTL
   */
  ttl?: number;

  /**
   * Enable compression for large values
   * Defaults to config.CACHE_COMPRESSION_ENABLED
   */
  compression?: boolean;

  /**
   * Minimum bytes to trigger compression
   * Defaults to config.CACHE_COMPRESSION_THRESHOLD
   */
  compressionThreshold?: number;

  /**
   * Enable metrics collection
   * @default true
   */
  enableMetrics?: boolean;
}

/**
 * Global cache service instance
 */
let globalCacheService: CacheService | null = null;

/**
 * Get the global cache service instance
 * @throws Error if cache service is not initialized
 */
export function getCacheService(): CacheService {
  if (!globalCacheService) {
    throw new Error(
      'Cache service not initialized. Ensure cache plugin is registered.',
    );
  }
  return globalCacheService;
}

/**
 * Cache plugin for TypeScript Backend Toolkit
 *
 * Provides comprehensive caching capabilities with:
 * - Multiple providers (Redis, Memory)
 * - Tag-based invalidation
 * - Compression support
 * - Stale-while-revalidate
 * - MagicRouter middleware integration
 * - Metrics tracking
 *
 * @example
 * ```ts
 * import { cachePlugin } from './plugins/cache';
 *
 * app.use(cachePlugin({
 *   enabled: true,
 *   prefix: 'myapp:',
 *   ttl: 3600,
 *   compression: true
 * }));
 * ```
 */
export const cachePlugin: PluginFactory<CachePluginOptions> = (
  options = {},
): ToolkitPlugin<CachePluginOptions> => {
  const {
    enabled = config.CACHE_ENABLED !== false,
    provider = config.CACHE_PROVIDER,
    prefix = config.CACHE_PREFIX,
    ttl = config.CACHE_DEFAULT_TTL,
    compression = config.CACHE_COMPRESSION_ENABLED,
    compressionThreshold = config.CACHE_COMPRESSION_THRESHOLD,
    enableMetrics = true,
  } = options;

  return {
    name: 'cache',
    priority: 50,
    options,

    register({ app }) {
      if (!enabled) {
        logger.info('Cache plugin is disabled');
        return;
      }

      logger.info(
        {
          provider,
          prefix,
          ttl,
          compression,
          compressionThreshold,
        },
        'Initializing cache plugin',
      );

      // Create cache service instance
      const cacheService = new CacheService({
        prefix,
        defaultTtl: ttl,
        compressionEnabled: compression,
        compressionThreshold,
        enableMetrics,
      });

      // Set global instance
      globalCacheService = cacheService;

      // Initialize middleware with service
      initializeCacheMiddleware(cacheService);

      // Make cache service available on app
      app.set('cache', cacheService);

      logger.info(
        {
          provider,
          prefix,
        },
        'Cache plugin initialized successfully',
      );
    },
  };
};

// Re-export types and middleware
export type {
  CacheMiddlewareOptions,
  InvalidateOptions,
  CacheKeyGenerator,
  CacheTagResolver,
  CachePatternResolver,
  CacheKeyResolver,
  CacheCondition,
  VaryByField,
  CacheWrapOptions,
  CacheServiceOptions,
  CacheStats,
  CacheWarmEntry,
  BatchSetEntry,
} from './types';

export { CacheService } from './cache.service';
export {
  cacheResponse,
  invalidateCache,
  cacheWithETag,
} from './cache.middleware';

export default cachePlugin;
