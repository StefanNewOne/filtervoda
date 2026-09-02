/**
 * Cron HTTP triggers (CLAUDE.md §12.7). Guarded by CRON_SECRET. `?test=1` is a dry-run that
 * reports what would happen without writing.
 */
import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.js';
import { anonymizeLeads, cleanupSessions } from '../jobs/maintenance.js';
import { previewOutbox, processOutbox } from '../jobs/outbox.processor.js';

export const cronRouter = Router();

/** Timing-safe secret check; accepts an `X-Cron-Secret` header (preferred, stays out of logs)
 * or the legacy `?secret=` query param. */
function guard(req: import('express').Request): boolean {
  const provided = req.header('X-Cron-Secret') ?? (typeof req.query.secret === 'string' ? req.query.secret : '');
  const expected = env.CRON_SECRET;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
const isDryRun = (req: import('express').Request) => req.query.test === '1';

cronRouter.get('/cron/process-outbox', async (req, res) => {
  if (!guard(req)) throw new AppError(404, 'Не е пронајдено');
  res.json(isDryRun(req) ? await previewOutbox() : await processOutbox());
});

cronRouter.get('/cron/anonymize-leads', async (req, res) => {
  if (!guard(req)) throw new AppError(404, 'Не е пронајдено');
  res.json(await anonymizeLeads(isDryRun(req)));
});

cronRouter.get('/cron/cleanup-sessions', async (req, res) => {
  if (!guard(req)) throw new AppError(404, 'Не е пронајдено');
  res.json(isDryRun(req) ? { note: 'dry-run' } : await cleanupSessions());
});
