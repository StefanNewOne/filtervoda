/**
 * Integration tests for retention crons (CLAUDE.md testing priority #8 — idempotency).
 * Real Docker Postgres; guarded so the default unit run skips them (INTEGRATION=1).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import { cleanupOutbox } from '../maintenance.js';

const run = process.env.INTEGRATION === '1';

describe.skipIf(!run)('cleanupOutbox (integration)', () => {
  beforeEach(async () => {
    await prisma.outboxJob.deleteMany({});
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('prunes DONE past retention, keeps recent DONE and DEAD, and is idempotent', async () => {
    const oldDone = await prisma.outboxJob.create({ data: { type: 'email.newLead', payload: {}, status: 'DONE' } });
    const recentDone = await prisma.outboxJob.create({ data: { type: 'email.newLead', payload: {}, status: 'DONE' } });
    const oldDead = await prisma.outboxJob.create({ data: { type: 'capi.lead', payload: {}, status: 'DEAD' } });
    // Age the two "old" rows past the 30-day window (updatedAt is @updatedAt-managed → set via SQL).
    await prisma.$executeRaw`UPDATE "OutboxJob" SET "updatedAt" = now() - interval '40 days' WHERE id = ${oldDone.id}`;
    await prisma.$executeRaw`UPDATE "OutboxJob" SET "updatedAt" = now() - interval '40 days' WHERE id = ${oldDead.id}`;

    const first = await cleanupOutbox();
    expect(first.affected).toBe(1); // only the old DONE

    const remaining = (await prisma.outboxJob.findMany({ select: { id: true } })).map((j) => j.id);
    expect(remaining).toContain(recentDone.id); // recent DONE kept
    expect(remaining).toContain(oldDead.id); // DEAD kept for manual review even when old
    expect(remaining).not.toContain(oldDone.id);

    const second = await cleanupOutbox();
    expect(second.affected).toBe(0); // idempotent
  });
});
