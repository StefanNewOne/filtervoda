/**
 * Outbox enqueue helper (ADR-002). A job row is written — ideally inside the same
 * transaction as the entity that triggers it — then the processor drains it. After a
 * request-path enqueue we `kick()` the processor via setImmediate (cron is the safety net).
 */
import type { Prisma } from '@prisma/client';
import { OUTBOX_MAX_ATTEMPTS } from '@filtervoda/shared';
import { prisma } from '../lib/prisma.js';

export type OutboxType =
  | 'email.newLead'
  | 'email.autoreply'
  | 'email.passwordReset'
  | 'capi.lead'
  | 'webhook.lead'
  | 'telegram.lead';

let kickFn: (() => void) | null = null;
/** Registered by the processor at startup so enqueue can trigger an immediate drain. */
export function registerKick(fn: () => void): void {
  kickFn = fn;
}

/** Trigger an immediate outbox drain (e.g. right after a lead transaction commits). */
export function kickOutbox(): void {
  if (kickFn) setImmediate(kickFn);
}

export async function enqueue(
  type: OutboxType,
  payload: Prisma.InputJsonValue,
  opts: { tx?: Prisma.TransactionClient; correlationId?: string } = {},
): Promise<void> {
  const client = opts.tx ?? prisma;
  await client.outboxJob.create({
    data: {
      type,
      payload,
      status: 'QUEUED',
      maxAttempts: OUTBOX_MAX_ATTEMPTS,
      correlationId: opts.correlationId,
    },
  });
  // Kick after the current transaction settles.
  if (!opts.tx && kickFn) setImmediate(kickFn);
}
