/**
 * Admin lead management. List (filters + search), detail (timeline/notes), status update
 * (reason required on LOST → audited), notes, anonymize (fresh re-auth), CSV export (UTF-8 BOM
 * so Excel reads Cyrillic). CLIENT_VIEWER may read leads but not content.
 */
import { formatMkPhoneDisplay, leadUpdateSchema } from '@filtervoda/shared';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';
import { requireFreshReauth, requireRole } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error.js';
import { writeAudit } from '../../services/audit.service.js';

export const adminLeadsRouter = Router();

/** CLIENT_VIEWER is read-only: only ADMIN/EDITOR may mutate leads. */
const leadEditors = requireRole('ADMIN', 'EDITOR');

/** Shared filter predicate for list + export (so „export the current view" works). */
function leadWhere(query: Record<string, string | undefined>) {
  const { type, status, product, q, from, to } = query;
  return {
    ...(type ? { type: type as 'B2C' | 'B2B' | 'CONTACT' | 'ADVISOR' } : {}),
    ...(status ? { status: status as 'NEW' } : {}),
    ...(product ? { productId: product } : {}),
    ...(from || to ? { createdAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { phone: { contains: q } }, { company: { contains: q, mode: 'insensitive' as const } }] } : {}),
  };
}

adminLeadsRouter.get('/', async (req, res) => {
  const leads = await prisma.lead.findMany({ where: leadWhere(req.query as Record<string, string | undefined>), orderBy: { createdAt: 'desc' }, take: 200 });
  res.json(leads);
});

adminLeadsRouter.get('/export', async (req, res) => {
  const leads = await prisma.lead.findMany({ where: leadWhere(req.query as Record<string, string | undefined>), orderBy: { createdAt: 'desc' }, take: 5000 });
  const cols = ['id', 'createdAt', 'type', 'status', 'name', 'phone', 'email', 'city', 'company', 'productId', 'section'];
  const header = cols.join(',');
  const rows = leads.map((l) =>
    cols
      .map((c) => {
        const v = c === 'phone' ? formatMkPhoneDisplay(l.phone) : (l as Record<string, unknown>)[c];
        const s = v == null ? '' : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      })
      .join(','),
  );
  const csv = '﻿' + [header, ...rows].join('\r\n'); // UTF-8 BOM
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.send(csv);
});

adminLeadsRouter.get('/:id', async (req, res) => {
  const lead = await prisma.lead.findUnique({
    where: { id: req.params.id },
    include: { notes: { orderBy: { createdAt: 'desc' } }, events: { orderBy: { createdAt: 'asc' } } },
  });
  if (!lead) throw new AppError(404, 'Lead не е пронајден');
  res.json(lead);
});

adminLeadsRouter.patch('/:id', leadEditors, async (req, res) => {
  const id = String(req.params.id);
  const data = leadUpdateSchema.parse(req.body);
  const before = await prisma.lead.findUnique({ where: { id } });
  if (!before) throw new AppError(404, 'Lead не е пронајден');

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...data,
      contactedAt: data.status && data.status !== 'NEW' && !before.contactedAt ? new Date() : before.contactedAt,
    },
  });
  if (data.status && data.status !== before.status) {
    await prisma.leadEvent.create({ data: { leadId: lead.id, type: 'STATUS_CHANGED', payload: { from: before.status, to: data.status } } });
    logger.info({ leadId: lead.id, to: data.status }, 'lead.status.changed');
  }
  // Audit: non-PII only.
  await writeAudit({
    actorId: req.session.userId,
    actorName: req.session.role ?? 'admin',
    action: 'lead.status.change',
    entity: 'Lead',
    entityId: lead.id,
    before: { status: before.status, assignedToId: before.assignedToId },
    after: { status: lead.status, assignedToId: lead.assignedToId, lostReason: lead.lostReason },
    correlationId: req.correlationId,
  });
  res.json(lead);
});

adminLeadsRouter.post('/:id/notes', leadEditors, async (req, res) => {
  const { text } = z.object({ text: z.string().min(1).max(2000) }).parse(req.body);
  const note = await prisma.leadNote.create({
    data: { leadId: String(req.params.id), userId: req.session.userId as string, text },
  });
  res.status(201).json(note);
});

// GDPR anonymize — destructive → fresh re-auth required.
adminLeadsRouter.post('/:id/anonymize', leadEditors, requireFreshReauth, async (req, res) => {
  const id = String(req.params.id);
  await prisma.lead.update({
    where: { id },
    data: { name: '[анонимизирано]', phone: '[анонимизирано]', email: null, message: null, company: null, ipHash: null, anonymizedAt: new Date() },
  });
  await prisma.leadEvent.create({ data: { leadId: id, type: 'ANONYMIZED' } });
  await writeAudit({ actorId: req.session.userId, actorName: req.session.role ?? 'admin', action: 'lead.anonymize', entity: 'Lead', entityId: id, correlationId: req.correlationId });
  logger.info({ leadId: id }, 'lead.anonymized');
  res.json({ ok: true });
});
