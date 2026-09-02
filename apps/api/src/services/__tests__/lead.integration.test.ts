/**
 * Integration tests (CLAUDE.md testing priority #1/#2) — real Docker Postgres, no DB mocks.
 * Run in the integration suite: INTEGRATION=1 with DATABASE_URL pointing at the test database.
 * Guarded so the default unit run skips them.
 */
import type { LeadSubmission } from '@filtervoda/shared';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../lib/prisma.js';
import { processOutbox } from '../../jobs/outbox.processor.js';
import { createLead } from '../lead.service.js';

const run = process.env.INTEGRATION === '1';

const baseSubmission: LeadSubmission = {
  type: 'B2C',
  name: 'Интеграција Тест',
  phone: '+38976676819',
  consent: true,
  context: { pageUrl: 'https://filtervoda.mk/proizvodi/x' },
};

describe.skipIf(!run)('createLead (integration)', () => {
  beforeEach(async () => {
    await prisma.leadEvent.deleteMany({});
    await prisma.outboxJob.deleteMany({});
    await prisma.leadNote.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.auditLog.deleteMany({});
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('writes Lead + LeadEvent + OutboxJob + AuditLog in one transaction', async () => {
    const lead = await createLead(baseSubmission, { correlationId: 'c1' });

    const [events, jobs, audits] = await Promise.all([
      prisma.leadEvent.findMany({ where: { leadId: lead.id } }),
      prisma.outboxJob.findMany({}),
      prisma.auditLog.findMany({ where: { entityId: lead.id } }),
    ]);
    expect(events.some((e) => e.type === 'CREATED')).toBe(true);
    expect(jobs.length).toBeGreaterThanOrEqual(2); // newLead + capi (+ webhook/telegram)
    expect(audits).toHaveLength(1);
    // Audit snapshot carries no PII.
    expect(JSON.stringify(audits[0]?.after)).not.toContain('Интеграција');
  });

  it('flags a duplicate when the same phone repeats within 24h', async () => {
    await createLead(baseSubmission, { correlationId: 'c1' });
    const second = await createLead(baseSubmission, { correlationId: 'c2' });
    expect(second.isDuplicate).toBe(true);
  });

  it('outbox processor drains queued jobs (no-op handlers succeed when unconfigured)', async () => {
    await createLead(baseSubmission, { correlationId: 'c1' });
    const { processed } = await processOutbox();
    expect(processed).toBeGreaterThan(0);
    const remaining = await prisma.outboxJob.count({ where: { status: { in: ['QUEUED', 'FAILED'] } } });
    expect(remaining).toBe(0);
  });
});
