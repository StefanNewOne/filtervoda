/**
 * Lead intake (CLAUDE.md testing priority #1). Everything happens in ONE transaction:
 * Lead + LeadEvent(CREATED) + OutboxJob(s) + AuditLog. No external call in the request path.
 * Duplicate flag: same phone seen within 24h. Audit stores only non-PII (type, status).
 */
import type { LeadSubmission } from '@filtervoda/shared';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { writeAudit } from './audit.service.js';
import { kickOutbox } from './outbox.service.js';

const CONSENT_VERSION = '2026-09-01';

export interface LeadRequestMeta {
  ipHash?: string;
  userAgent?: string;
  correlationId: string;
}

export async function createLead(input: LeadSubmission, meta: LeadRequestMeta) {
  const ctx = input.context;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const lead = await prisma.$transaction(async (tx) => {
    // Duplicate detection inside the transaction (consistent snapshot): same phone in the last 24h.
    const dupe = await tx.lead.findFirst({
      where: { phone: input.phone, createdAt: { gt: since } },
      select: { id: true },
    });
    const created = await tx.lead.create({
      data: {
        type: input.type,
        name: input.name,
        phone: input.phone,
        email: input.email,
        message: input.message,
        productId: input.productId,
        city: 'city' in input ? input.city : undefined,
        company: 'company' in input ? input.company : undefined,
        industry: 'industry' in input ? input.industry : undefined,
        employeesRange: 'employeesRange' in input ? input.employeesRange : undefined,
        currentSolution: 'currentSolution' in input ? input.currentSolution : undefined,
        calcInput: 'calcInput' in input && input.calcInput ? input.calcInput : undefined,
        pageUrl: ctx.pageUrl,
        section: ctx.section,
        utmFirst: ctx.utm ?? undefined,
        utmLast: ctx.utm ?? undefined,
        referrer: ctx.referrer,
        fbclid: ctx.fbclid,
        gclid: ctx.gclid,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        userAgent: meta.userAgent,
        ipHash: meta.ipHash,
        consentVersion: CONSENT_VERSION,
        isDuplicate: Boolean(dupe),
      },
    });

    await tx.leadEvent.create({
      data: { leadId: created.id, type: 'CREATED', correlationId: meta.correlationId },
    });

    // Outbox jobs — same transaction (transactional outbox).
    const jobs: { type: string; payload: object }[] = [
      { type: 'email.newLead', payload: { leadId: created.id } },
      { type: 'capi.lead', payload: { leadId: created.id } },
    ];
    if (input.email) jobs.push({ type: 'email.autoreply', payload: { leadId: created.id } });
    // Optional integrations enqueue unconditionally; handlers no-op if unconfigured.
    jobs.push({ type: 'webhook.lead', payload: { leadId: created.id } });
    jobs.push({ type: 'telegram.lead', payload: { leadId: created.id } });

    await tx.outboxJob.createMany({
      data: jobs.map((j) => ({ type: j.type, payload: j.payload, correlationId: meta.correlationId })),
    });

    // Audit — non-PII snapshot only.
    await writeAudit({
      actorName: 'public',
      action: 'lead.created',
      entity: 'Lead',
      entityId: created.id,
      after: { type: created.type, status: created.status, isDuplicate: created.isDuplicate },
      ipHash: meta.ipHash,
      correlationId: meta.correlationId,
      tx,
    });

    return created;
  });

  logger.info({ leadId: lead.id, type: lead.type, isDuplicate: lead.isDuplicate }, 'lead.created');
  if (lead.isDuplicate) logger.info({ leadId: lead.id }, 'lead.duplicateFlagged');
  kickOutbox(); // drain now (<5s) instead of waiting for the 30s cron
  return lead;
}
