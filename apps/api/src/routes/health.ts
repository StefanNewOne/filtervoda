/**
 * Health check (CLAUDE.md §12.9): DB + Redis ping. Used by Docker healthcheck and uptime monitor.
 */
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const checks: Record<string, 'ok' | 'fail'> = { db: 'fail', redis: 'fail' };
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = 'ok';
  } catch {
    /* reported below */
  }
  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    /* reported below */
  }
  const healthy = Object.values(checks).every((c) => c === 'ok');
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded', checks });
});
