/**
 * Outbox processor (ADR-002 / CLAUDE.md testing priority #2). Claims jobs with
 * FOR UPDATE SKIP LOCKED (idempotent, safe across restarts / two instances), dispatches by
 * type, applies backoff on failure, marks DEAD after maxAttempts. node-cron runs it every 30s;
 * enqueue() also kicks it immediately.
 */
import { OUTBOX_BACKOFF_MS } from '@filtervoda/shared';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import {
  handleEmailAutoreply,
  handleEmailNewLead,
  handleEmailPasswordReset,
} from './handlers/emails.js';
import { handleCapiLead, handleTelegramLead, handleWebhookLead } from './handlers/integrations.js';

type Handler = (payload: Record<string, unknown>) => Promise<void>;

const HANDLERS: Record<string, Handler> = {
  'email.newLead': (p) => handleEmailNewLead(p as { leadId: string }),
  'email.autoreply': (p) => handleEmailAutoreply(p as { leadId: string }),
  'email.passwordReset': (p) => handleEmailPasswordReset(p as { email: string; token: string }),
  'capi.lead': (p) => handleCapiLead(p as { leadId: string }),
  'webhook.lead': (p) => handleWebhookLead(p as { leadId: string }),
  'telegram.lead': (p) => handleTelegramLead(p as { leadId: string }),
};

const BATCH = 10;
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;
let running = false;

interface ClaimedJob {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
}

/** Claim up to BATCH due jobs, locking them so a concurrent processor skips them. */
async function claim(): Promise<ClaimedJob[]> {
  const staleBefore = new Date(Date.now() - LOCK_TIMEOUT_MS);
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<ClaimedJob[]>`
      SELECT id, type, payload, attempts, "maxAttempts"
      FROM "OutboxJob"
      WHERE status IN ('QUEUED','FAILED')
        AND "nextRunAt" <= now()
        AND ("lockedAt" IS NULL OR "lockedAt" < ${staleBefore})
      ORDER BY "nextRunAt" ASC
      LIMIT ${BATCH}
      FOR UPDATE SKIP LOCKED`;
    if (rows.length) {
      await tx.outboxJob.updateMany({
        where: { id: { in: rows.map((r) => r.id) } },
        data: { status: 'PROCESSING', lockedAt: new Date() },
      });
    }
    return rows;
  });
}

async function runOne(job: ClaimedJob): Promise<void> {
  const handler = HANDLERS[job.type];
  if (!handler) {
    await prisma.outboxJob.update({
      where: { id: job.id },
      data: { status: 'DEAD', lastError: `no handler for ${job.type}`, lockedAt: null },
    });
    logger.error({ jobId: job.id, type: job.type }, 'outbox.job.dead');
    return;
  }

  try {
    await handler(job.payload);
    await prisma.outboxJob.update({ where: { id: job.id }, data: { status: 'DONE', lockedAt: null } });
  } catch (err) {
    const attempts = job.attempts + 1;
    const dead = attempts >= job.maxAttempts;
    const backoff = OUTBOX_BACKOFF_MS[Math.min(attempts - 1, OUTBOX_BACKOFF_MS.length - 1)] ?? 60_000;
    await prisma.outboxJob.update({
      where: { id: job.id },
      data: {
        status: dead ? 'DEAD' : 'FAILED',
        attempts,
        lockedAt: null,
        nextRunAt: dead ? undefined : new Date(Date.now() + backoff),
        lastError: (err as Error)?.message?.slice(0, 500),
      },
    });
    if (dead) logger.error({ jobId: job.id, type: job.type }, 'outbox.job.dead');
    else logger.warn({ jobId: job.id, type: job.type, attempts }, 'outbox.job.failed');
  }
}

/** Drain due jobs. Guarded so overlapping ticks don't double-run. */
export async function processOutbox(): Promise<{ processed: number }> {
  if (running) return { processed: 0 };
  running = true;
  let processed = 0;
  try {
    for (;;) {
      const jobs = await claim();
      if (!jobs.length) break;
      for (const job of jobs) {
        await runOne(job);
        processed += 1;
      }
    }
  } finally {
    running = false;
  }
  if (processed) logger.info({ processed }, 'cron.outbox.run');
  return { processed };
}

/** Dry-run for the cron ?test=1 trigger: report what would be processed, without running. */
export async function previewOutbox(): Promise<{ due: number }> {
  const due = await prisma.outboxJob.count({
    where: { status: { in: ['QUEUED', 'FAILED'] }, nextRunAt: { lte: new Date() } },
  });
  return { due };
}
