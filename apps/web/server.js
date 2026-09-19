// Production storefront server: React Router 7 SSR + Redis full-page HTML cache.
// Cache-hit requests skip SSR + the internal API fan-out entirely (one Redis GET).
// Keyed by pathname only (utm/fbclid don't change HTML). Purged by the API on publish
// (pagecache:* invalidation), so the single active template is always served fresh.
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import Redis from 'ioredis';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD = join(__dirname, 'build', 'server', 'index.js');
const CLIENT = join(__dirname, 'build', 'client');
const PORT = Number(process.env.PORT ?? 3000);
const TTL = Number(process.env.PAGE_CACHE_TTL_SEC ?? 300);

// pathToFileURL: dynamic import of an absolute path needs a file:// URL (cross-platform).
const build = await import(pathToFileURL(BUILD).href);

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, enableOfflineQueue: false })
  : null;
if (redis) redis.on('error', () => {}); // a Redis blip must never crash the web server

const app = express();
app.disable('x-powered-by');

// Keep non-production hosts (preview *.sslip.io / bare IP / staging) out of search indexes.
// Only the real domain is indexable; self-adjusts once DNS binds filtervoda.mk.
app.use((req, res, next) => {
  const host = String(req.headers.host ?? '').toLowerCase();
  const indexable = host === 'filtervoda.mk' || host === 'www.filtervoda.mk';
  if (!indexable) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// Hashed static assets — far-future immutable cache; other client files shorter.
app.use('/assets', express.static(join(CLIENT, 'assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(CLIENT, { maxAge: '1h' }));

const NO_CACHE = [/^\/admin/, /^\/blagodarime/];
const cacheable = (req) => req.method === 'GET' && !NO_CACHE.some((re) => re.test(req.path));

const handler = createRequestHandler({ build, mode: process.env.NODE_ENV });

app.use(async (req, res, next) => {
  if (!redis || !cacheable(req)) return handler(req, res, next);
  const key = `pagecache:${req.path}`;

  try {
    const hit = await redis.get(key);
    if (hit) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Cache', 'HIT');
      return res.send(hit);
    }
  } catch {
    /* fall through to SSR */
  }

  // Miss: render via RR, capture the HTML, store only successful full HTML documents.
  const chunks = [];
  const _write = res.write.bind(res);
  const _end = res.end.bind(res);
  res.write = (chunk, ...rest) => {
    if (chunk) chunks.push(Buffer.from(chunk));
    return _write(chunk, ...rest);
  };
  res.end = (chunk, ...rest) => {
    if (chunk) chunks.push(Buffer.from(chunk));
    try {
      const ct = String(res.getHeader('content-type') ?? '');
      if (res.statusCode === 200 && ct.includes('text/html')) {
        redis.set(key, Buffer.concat(chunks).toString('utf8'), 'EX', TTL).catch(() => {});
      }
    } catch {
      /* never fail the response because of caching */
    }
    return _end(chunk, ...rest);
  };
  res.setHeader('X-Cache', 'MISS');
  return handler(req, res, next);
});

app.listen(PORT, () => console.log(`web listening on :${PORT} (page cache ${redis ? 'on' : 'off'})`));
