import type { RedisOptions } from 'ioredis';
import Redis from 'ioredis';
import config from '../config/env';
import logger from '../observability/logger';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create Redis client
export const cacheClient = new Redis(config.REDIS_URL || '', redisOptions);

// Connection event listeners
cacheClient.on('connect', () => {
  logger.info('Cache client connected to Redis');
});

cacheClient.on('ready', () => {
  logger.info('Cache client ready');
});

cacheClient.on('error', (err) => {
  logger.error({ err }, 'Cache client error');
});

cacheClient.on('close', () => {
  logger.warn('Cache client connection closed');
});

cacheClient.on('reconnecting', () => {
  logger.info('Cache client reconnecting to Redis');
});

/**
 * Health check function for cache connection
 * Returns a function compatible with HealthCheck interface
 */
export const checkCacheHealth = () => {
  return async (): Promise<boolean> => {
    try {
      const result = await cacheClient.ping();
      return result === 'PONG';
    } catch (err) {
      logger.error({ err }, 'Cache health check failed');
      return false;
    }
  };
};
