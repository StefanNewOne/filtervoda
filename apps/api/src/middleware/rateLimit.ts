/**
 * Rate limiting on every endpoint (CLAUDE.md Engineering Posture #6, PRD §12.7) with a
 * Redis store so limits hold across instances. Values from shared constants.
 */
import { RATE_LIMIT } from '@filtervoda/shared';
import type { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { env } from '../config/env.js';
import { redis } from '../lib/redis.js';

/** Trusted internal SSR calls carry a shared secret header and are exempt from public limits. */
function isInternal(req: Request): boolean {
  return Boolean(env.INTERNAL_API_SECRET) && req.get('x-internal-secret') === env.INTERNAL_API_SECRET;
}

function store(prefix: string) {
  return new RedisStore({
    // ioredis: forward the command to the client.
    sendCommand: (...args: string[]) => redis.call(...(args as [string, ...string[]])) as Promise<never>,
    prefix: `rl:${prefix}:`,
  });
}

const message = { error: 'Премногу барања. Обидете се повторно подоцна.' };

export const leadLimiter10Min = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: RATE_LIMIT.leadPer10Min,
  standardHeaders: true,
  legacyHeaders: false,
  store: store('lead10m'),
  message,
});

export const leadLimiter24h = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: RATE_LIMIT.leadPer24h,
  standardHeaders: true,
  legacyHeaders: false,
  store: store('lead24h'),
  message,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: RATE_LIMIT.authPer15Min,
  standardHeaders: true,
  legacyHeaders: false,
  store: store('auth'),
  message,
});

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: RATE_LIMIT.adminPerMin,
  standardHeaders: true,
  legacyHeaders: false,
  store: store('admin'),
  message,
});

export const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: RATE_LIMIT.publicReadPerMin,
  standardHeaders: true,
  legacyHeaders: false,
  store: store('read'),
  message,
  skip: isInternal, // server-side SSR fan-out shares one container IP — don't throttle it
});
