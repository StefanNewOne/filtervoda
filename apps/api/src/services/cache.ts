/**
 * Page/data cache helper over Redis. Keys are namespaced so publish can invalidate a whole
 * area at once (CLAUDE.md §12.3: TTL 10 min, purge on publish).
 */
import { PAGE_CACHE_TTL_SEC } from '@filtervoda/shared';
import { cacheGet, cacheInvalidate, cacheSet } from '../lib/redis.js';

export const CACHE_NS = {
  products: 'cache:products:',
  posts: 'cache:posts:',
  faq: 'cache:faq:',
  packages: 'cache:packages:',
  settings: 'cache:settings:',
  redirects: 'cache:redirects:',
} as const;

/** Full-page HTML cache written by the web SSR server; cleared on any publish. */
const PAGE_CACHE_NS = 'pagecache:';

/** Return cached value or compute, cache, and return it. */
export async function cached<T>(key: string, ttl: number, compute: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await compute();
  await cacheSet(key, value, ttl);
  return value;
}

export const withDefaultTtl = <T>(key: string, compute: () => Promise<T>) =>
  cached(key, PAGE_CACHE_TTL_SEC, compute);

/** Purge one or more namespaces (call on publish / setting change). Always also clears the
 * storefront full-page cache so rendered HTML never serves stale content after a publish. */
export async function purge(...namespaces: string[]): Promise<void> {
  await Promise.all([...namespaces, PAGE_CACHE_NS].map((ns) => cacheInvalidate(ns)));
}
