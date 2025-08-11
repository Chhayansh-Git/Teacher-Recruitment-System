// utils/cacheService.js
import redis from '../config/redisClient.js';

/** Set JSON‑serializable value in cache */
export async function setCache(key, value, ttlSec) {
  const str = JSON.stringify(value);
  if (ttlSec) {
    await redis.set(key, str, 'EX', ttlSec);
  } else {
    await redis.set(key, str);
  }
}

/** Get parsed JSON value from cache */
export async function getCache(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}
