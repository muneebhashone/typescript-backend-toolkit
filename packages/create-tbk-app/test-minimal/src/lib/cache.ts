// Cache is disabled - providing stub exports
export const checkCacheHealth = async (): Promise<boolean> => false;
export const cacheProvider = null;
export class RedisProvider {}
