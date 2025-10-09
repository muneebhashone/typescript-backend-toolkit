import type { RedisOptions } from 'ioredis';
import Redis from 'ioredis';
import config from '../config/env';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  host: 'redis',
};

const redisClient = new Redis(config.REDIS_URL || '', redisOptions);

export default redisClient;
