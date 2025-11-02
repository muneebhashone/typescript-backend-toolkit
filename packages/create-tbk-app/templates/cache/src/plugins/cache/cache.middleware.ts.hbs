import type { NextFunction } from 'express';
import crypto from 'node:crypto';
import type {
  RequestAny,
  ResponseAny,
  MagicMiddleware,
} from '@/plugins/magic/router';
import logger from '@/plugins/logger';
import type {
  CacheMiddlewareOptions,
  InvalidateOptions,
  CacheKeyGenerator,
  CacheTagResolver,
  CachePatternResolver,
  CacheKeyResolver,
} from './types';
import { CacheService } from './cache.service';
import type { JwtPayload } from '@/utils/jwt.utils';

/**
 * Global cache service instance
 * Will be initialized by the plugin
 */
let cacheService: CacheService | null = null;

/**
 * Initialize cache middleware with cache service
 */
export function initializeCacheMiddleware(service: CacheService): void {
  cacheService = service;
}

/**
 * Generate cache key from request and options
 */
async function generateCacheKey(
  req: RequestAny,
  options: CacheMiddlewareOptions,
): Promise<string> {
  // Custom key generator (has full request access)
  if (typeof options.key === 'function') {
    return await (options.key as CacheKeyGenerator)(req);
  }

  // Static key
  if (typeof options.key === 'string') {
    return options.key;
  }

  // Auto-generate from request
  const parts: string[] = [];

  // Always include the path
  parts.push(req.path);

  // Add varyBy fields
  const varyBy = options.varyBy || [];

  if (varyBy.includes('method')) {
    parts.push(req.method);
  }

  if (varyBy.includes('userId')) {
    const userId = (req.user as JwtPayload)?.sub || 'anonymous';
    parts.push(`user:${userId}`);
  }

  if (varyBy.includes('url')) {
    parts.push(req.originalUrl || req.url);
  }

  if (varyBy.includes('query')) {
    const queryStr = JSON.stringify(req.query);
    parts.push(`q:${crypto.createHash('md5').update(queryStr).digest('hex')}`);
  }

  if (varyBy.includes('params')) {
    const paramsStr = JSON.stringify(req.params);
    parts.push(`p:${crypto.createHash('md5').update(paramsStr).digest('hex')}`);
  }

  if (varyBy.includes('headers') && options.varyByHeaders) {
    const headerValues = options.varyByHeaders
      .map((h) => `${h}:${req.headers[h.toLowerCase()] || ''}`)
      .join(',');
    parts.push(
      `h:${crypto.createHash('md5').update(headerValues).digest('hex')}`,
    );
  }

  // Handle private option (shorthand for varyBy userId)
  if (options.private && !varyBy.includes('userId')) {
    const userId = (req.user as JwtPayload)?.sub || 'anonymous';
    parts.push(`user:${userId}`);
  }

  return parts.join(':');
}

/**
 * Resolve tags from options and request
 */
async function resolveTags(
  req: RequestAny,
  tags?: string[] | CacheTagResolver,
): Promise<string[]> {
  if (!tags) return [];

  if (typeof tags === 'function') {
    return await (tags as CacheTagResolver)(req);
  }

  return tags;
}

/**
 * Resolve patterns from options and request
 */
async function resolvePatterns(
  req: RequestAny,
  patterns?: string[] | CachePatternResolver,
): Promise<string[]> {
  if (!patterns) return [];

  if (typeof patterns === 'function') {
    return await (patterns as CachePatternResolver)(req);
  }

  return patterns;
}

/**
 * Resolve keys from options and request
 */
async function resolveKeys(
  req: RequestAny,
  keys?: string[] | CacheKeyResolver,
): Promise<string[]> {
  if (!keys) return [];

  if (typeof keys === 'function') {
    return await (keys as CacheKeyResolver)(req);
  }

  return keys;
}

/**
 * Response caching middleware for MagicRouter
 * Caches GET request responses with configurable options
 *
 * @example
 * router.get('/users/:id',
 *   { requestType: { params: userIdSchema } },
 *   cacheResponse({
 *     ttl: 300,
 *     key: (req) => `user:${req.params.id}`,
 *     tags: (req) => [`user:${req.params.id}`, 'users']
 *   }),
 *   getUser
 * );
 */
export const cacheResponse = (
  options: CacheMiddlewareOptions = {},
): MagicMiddleware => {
  return async (
    req: RequestAny,
    res: ResponseAny,
    next: NextFunction,
  ): Promise<void> => {
    // Check if cache service is initialized
    if (!cacheService) {
      logger.warn('Cache middleware used but cache service not initialized');
      next();
      return;
    }

    // Skip if disabled
    if (options.skip) {
      next();
      return;
    }

    // Only cache GET requests by default
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Check condition (if provided)
    if (options.condition) {
      try {
        const shouldCache = await options.condition(req);
        if (!shouldCache) {
          next();
          return;
        }
      } catch (err) {
        logger.warn({ err }, 'Cache condition check failed');
        next();
        return;
      }
    }

    try {
      // Generate cache key dynamically from request
      const cacheKey = await generateCacheKey(req, options);
      const ttl = options.ttl;

      logger.debug(
        { cacheKey, method: req.method, path: req.path },
        'Checking cache',
      );

      // Try to get from cache
      const cached = await cacheService.get(cacheKey);

      if (cached !== null) {
        // Handle stale-while-revalidate
        if (options.staleWhileRevalidate && options.staleTime) {
          const ttlRemaining = await cacheService.ttl(cacheKey);
          const effectiveTtl = ttl || 3600;
          const isStale =
            ttlRemaining > 0 && ttlRemaining < effectiveTtl - options.staleTime;

          if (isStale) {
            logger.debug(
              { cacheKey },
              'Serving stale cache, revalidating in background',
            );
            // Continue to serve from cache, but mark for revalidation
            res.setHeader('X-Cache-Status', 'STALE');
          } else {
            res.setHeader('X-Cache-Status', 'HIT');
          }
        } else {
          res.setHeader('X-Cache-Status', 'HIT');
        }

        // Set cache headers
        if (ttl) {
          res.setHeader('Cache-Control', `max-age=${ttl}`);
        }

        // Set age header
        const ttlRemaining = await cacheService.ttl(cacheKey);
        if (ttlRemaining > 0) {
          const age = (ttl || 3600) - ttlRemaining;
          res.setHeader('Age', age.toString());
        }

        logger.debug(
          { cacheKey, method: req.method, path: req.path },
          'Cache hit',
        );

        res.json(cached);
        return;
      }

      // Cache miss - intercept res.json to cache the response
      res.setHeader('X-Cache-Status', 'MISS');

      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      let responseSent = false;

      // Override res.json
      res.json = function (data: unknown) {
        if (responseSent) return originalJson(data);
        responseSent = true;

        // Cache in background (don't block response)
        if (cacheService) {
          (async () => {
            try {
              const tags = await resolveTags(req, options.tags);

              if (tags.length > 0) {
                await cacheService!.setWithTags(cacheKey, data, tags, ttl);
              } else {
                await cacheService!.set(cacheKey, data, ttl);
              }

              logger.debug({ cacheKey, tags, ttl }, 'Response cached');
            } catch (err) {
              logger.warn({ cacheKey, err }, 'Failed to cache response');
            }
          })();
        }

        // Set cache headers
        if (ttl) {
          res.setHeader('Cache-Control', `max-age=${ttl}`);
        }

        return originalJson(data);
      };

      // Override res.send for non-JSON responses
      res.send = function (data: unknown) {
        if (responseSent) return originalSend(data);
        responseSent = true;

        // Only cache if it's likely JSON
        if (
          cacheService &&
          (typeof data === 'object' || typeof data === 'string')
        ) {
          (async () => {
            try {
              const tags = await resolveTags(req, options.tags);
              const cacheData =
                typeof data === 'string' ? JSON.parse(data) : data;

              if (tags.length > 0) {
                await cacheService!.setWithTags(cacheKey, cacheData, tags, ttl);
              } else {
                await cacheService!.set(cacheKey, cacheData, ttl);
              }

              logger.debug({ cacheKey, tags, ttl }, 'Response cached');
            } catch (err) {
              logger.debug(
                { cacheKey, err },
                'Skipped caching non-JSON response',
              );
            }
          })();
        }

        // Set cache headers
        if (ttl) {
          res.setHeader('Cache-Control', `max-age=${ttl}`);
        }

        return originalSend(data);
      };

      next();
    } catch (err) {
      logger.error({ err, path: req.path }, 'Cache middleware error');
      next();
    }
  };
};

/**
 * Cache invalidation middleware for MagicRouter
 * Invalidates cache based on tags, patterns, or specific keys
 *
 * @example
 * router.put('/users/:id',
 *   { requestType: { params: userIdSchema } },
 *   invalidateCache({
 *     tags: (req) => [`user:${req.params.id}`, 'users'],
 *     patterns: ['dashboard:*'],
 *     timing: 'after'
 *   }),
 *   updateUser
 * );
 */
export const invalidateCache = (
  options: InvalidateOptions = {},
): MagicMiddleware => {
  return async (
    req: RequestAny,
    res: ResponseAny,
    next: NextFunction,
  ): Promise<void> => {
    // Check if cache service is initialized
    if (!cacheService) {
      logger.warn(
        'Cache invalidation middleware used but cache service not initialized',
      );
      next();
      return;
    }

    const timing = options.timing || 'after';

    // Check condition (if provided)
    if (options.condition) {
      try {
        const shouldInvalidate = await options.condition(req);
        if (!shouldInvalidate) {
          next();
          return;
        }
      } catch (err) {
        logger.warn({ err }, 'Cache invalidation condition check failed');
        next();
        return;
      }
    }

    const performInvalidation = async () => {
      try {
        // Resolve tags dynamically from request
        if (options.tags && cacheService) {
          const tags = await resolveTags(req, options.tags);
          if (tags.length > 0) {
            await cacheService.invalidateByTags(tags);
            logger.debug(
              { tags, method: req.method, path: req.path },
              'Invalidated cache by tags',
            );
          }
        }

        // Resolve patterns dynamically from request
        if (options.patterns && cacheService) {
          const patterns = await resolvePatterns(req, options.patterns);
          for (const pattern of patterns) {
            await cacheService.invalidateByPattern(pattern);
            logger.debug(
              { pattern, method: req.method, path: req.path },
              'Invalidated cache by pattern',
            );
          }
        }

        // Resolve specific keys dynamically from request
        if (options.keys && cacheService) {
          const keys = await resolveKeys(req, options.keys);
          if (keys.length > 0) {
            await cacheService.deleteMany(keys);
            logger.debug(
              { keys, method: req.method, path: req.path },
              'Invalidated cache keys',
            );
          }
        }
      } catch (err) {
        logger.error(
          { err, method: req.method, path: req.path },
          'Cache invalidation failed',
        );
        // Don't throw - invalidation failure shouldn't break the request
      }
    };

    if (timing === 'before') {
      await performInvalidation();
      next();
      return;
    }

    // Invalidate after response (only on success)
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        performInvalidation().catch((err) =>
          logger.error({ err }, 'Post-response cache invalidation failed'),
        );
      }
    });

    next();
  };
};

/**
 * Convenience middleware to cache based on ETags
 * Automatically generates ETags and handles conditional requests
 */
export const cacheWithETag = (
  options: Omit<CacheMiddlewareOptions, 'key'> = {},
): MagicMiddleware => {
  return async (
    req: RequestAny,
    res: ResponseAny,
    next: NextFunction,
  ): Promise<void> => {
    if (!cacheService) {
      next();
      return;
    }

    // Only for GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = await generateCacheKey(req, {
      ...options,
      varyBy: ['url', 'query'],
    });
    const etagKey = `etag:${cacheKey}`;

    // Check if client sent If-None-Match header
    const clientETag = req.headers['if-none-match'];

    if (clientETag) {
      const storedETag = await cacheService.get<string>(etagKey);

      if (storedETag && storedETag === clientETag) {
        // ETag matches - return 304 Not Modified
        res.setHeader('ETag', storedETag);
        res.setHeader('X-Cache-Status', 'NOT_MODIFIED');
        res.status(304).end();
        return;
      }
    }

    // Intercept response to generate ETag
    const originalJson = res.json.bind(res);

    res.json = function (data: unknown) {
      const etag = `"${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')}"`;

      // Store ETag
      cacheService
        ?.set(etagKey, etag, options.ttl)
        .catch((err) => logger.warn({ err }, 'Failed to store ETag'));

      res.setHeader('ETag', etag);
      res.setHeader('X-Cache-Status', 'MISS');

      return originalJson(data);
    };

    next();
  };
};
