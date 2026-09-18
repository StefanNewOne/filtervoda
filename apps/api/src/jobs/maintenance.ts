/**
 * Maintenance crons: anonymize old lead PII (retention), clean expired sessions.
 * Idempotent (CLAUDE.md testing priority #8).
 */
import { IP_HASH_RETENTION_DAYS, LEAD_RETENTION_MONTHS, OUTBOX_DONE_RETENTION_DAYS } from '@filtervoda/shared';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { writeAudit } from '../services/audit.service.js';

const ANON = '[анонимизирано]';

/** Replace PII on leads older than the retention window; stats stay. */
export async function anonymizeLeads(dryRun = false): Promise<{ affected: number }> {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - LEAD_RETENTION_MONTHS);

  const stale = await prisma.lead.findMany({
    where: { createdAt: { lt: cutoff }, anonymizedAt: null },
    select: { id: true },
  });
  if (dryRun) return { affected: stale.length };

  for (const { id } of stale) {
    await prisma.lead.update({
      where: { id },
      data: {
        name: ANON,
        phone: ANON,
        email: null,
        message: null,
        company: null,
        ipHash: null,
        anonymizedAt: new Date(),
      },
    });
    await prisma.leadEvent.create({ data: { leadId: id, type: 'ANONYMIZED' } });
    await writeAudit({ actorName: 'cron', action: 'lead.anonymized', entity: 'Lead', entityId: id });
  }
  if (stale.length) logger.info({ affected: stale.length }, 'cron.anonymize.run');
  return { affected: stale.length };
}

/** Also drop ipHash on leads older than IP retention (30 days) even if not fully anonymized. */
export async function dropOldIpHashes(): Promise<{ affected: number }> {
  const cutoff = new Date(Date.now() - IP_HASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.lead.updateMany({
    where: { createdAt: { lt: cutoff }, ipHash: { not: null } },
    data: { ipHash: null },
  });
  return { affected: count };
}

export async function cleanupSessions(): Promise<{ affected: number }> {
  const deleted = await prisma.$executeRaw`DELETE FROM "session" WHERE expire < now()`;
  return { affected: Number(deleted) };
}

/**
 * Prune succeeded outbox rows past the retention window (declared policy: DONE 30 days). DEAD
 * rows are kept until manually closed. Removes stale payloads (attribution / hashed PII /
 * transient tokens) so the table doesn't grow unbounded. Idempotent.
 */
export async function cleanupOutbox(): Promise<{ affected: number }> {
  const cutoff = new Date(Date.now() - OUTBOX_DONE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.outboxJob.deleteMany({
    where: { status: 'DONE', updatedAt: { lt: cutoff } },
  });
  if (count) logger.info({ affected: count }, 'cron.outbox.cleanup.run');
  return { affected: count };
}
