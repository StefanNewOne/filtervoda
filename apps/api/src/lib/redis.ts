/**
 * Redis client (CLAUDE.md §12.2): page/data cache, rate-limit store, duplicate keys.
 * NOT sessions (those live in Postgres via connect-pg-simple).
 */
import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on('error', (err) => logger.error({ err }, 'redis error'));

/** Cache a JSON value with TTL (seconds). Fail-open: a Redis blip must never break a write. */
export async function cacheSet(key: string, value: unknown, ttlSec: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
  } catch (err) {
    logger.warn({ err, key }, 'cache.set.failed');
  }
}

/** Fail-open: on any Redis error, behave as a cache miss so the caller recomputes from origin. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    logger.warn({ err, key }, 'cache.get.failed');
    return null;
  }
}

/** Invalidate keys by prefix (used on publish). */
export async function cacheInvalidate(prefix: string): Promise<void> {
  const stream = redis.scanStream({ match: `${prefix}*`, count: 100 });
  const keys: string[] = [];
  for await (const batch of stream) keys.push(...(batch as string[]));
  if (keys.length) await redis.del(...keys);
}
