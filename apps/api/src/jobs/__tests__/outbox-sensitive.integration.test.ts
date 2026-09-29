/**
 * Integration test: sensitive outbox jobs (password-reset) must not persist their secret.
 * The row is deleted on success instead of being kept as DONE. INTEGRATION=1 + Docker Postgres.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import { processOutbox } from '../outbox.processor.js';

const run = process.env.INTEGRATION === '1';

describe.skipIf(!run)('outbox sensitive-job handling (integration)', () => {
  beforeEach(async () => {
    await prisma.outboxJob.deleteMany({});
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deletes a password-reset job on success (no token left at rest)', async () => {
    const job = await prisma.outboxJob.create({
      data: { type: 'email.passwordReset', payload: { email: 'x@filtervoda.mk', token: 'secret-token' }, status: 'QUEUED' },
    });
    // No SMTP configured in tests → mailer no-ops success → handler resolves → sensitive delete.
    await processOutbox();
    const row = await prisma.outboxJob.findUnique({ where: { id: job.id } });
    expect(row).toBeNull();
    const anyDone = await prisma.outboxJob.count({ where: { status: 'DONE', type: 'email.passwordReset' } });
    expect(anyDone).toBe(0);
  });
});
