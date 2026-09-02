/**
 * System admin: users (ADMIN only), settings, outbox (retry), audit (read-only), stats,
 * cache invalidate. User writes hash passwords with bcryptjs.
 */
import { userSchema } from '@filtervoda/shared';
import type { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { requireFreshReauth, requireRole } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error.js';
import { writeAudit } from '../../services/audit.service.js';
import { CACHE_NS, purge } from '../../services/cache.js';
import { setSetting } from '../../services/settings.service.js';

// ── Users (ADMIN only) ────────────────────────────────────────────────────────
export const adminUsersRouter = Router();
adminUsersRouter.use(requireRole('ADMIN'));

adminUsersRouter.get('/', async (_req, res) => {
  res.json(await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, lastLoginAt: true, lockedUntil: true } }));
});

adminUsersRouter.post('/', async (req, res) => {
  const data = userSchema.parse(req.body);
  if (!data.password) throw new AppError(422, 'Лозинката е задолжителна');
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({ data: { email: data.email, name: data.name, role: data.role, passwordHash } });
  await writeAudit({ actorId: req.session.userId, actorName: 'ADMIN', action: 'user.create', entity: 'User', entityId: user.id, after: { email: data.email, role: data.role } });
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

adminUsersRouter.patch('/:id', requireFreshReauth, async (req, res) => {
  const id = String(req.params.id);
  const data = userSchema.partial().parse(req.body);
  // Never demote/lock out the last ADMIN.
  if (data.role && data.role !== 'ADMIN') {
    const before = await prisma.user.findUnique({ where: { id } });
    if (before?.role === 'ADMIN') {
      const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (admins <= 1) throw new AppError(400, 'Мора да постои барем еден ADMIN.');
    }
  }
  const patch: Record<string, unknown> = { name: data.name, role: data.role, email: data.email };
  if (data.password) patch.passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.update({ where: { id }, data: patch });
  await writeAudit({ actorId: req.session.userId, actorName: 'ADMIN', action: 'user.update', entity: 'User', entityId: user.id, after: { role: user.role } });
  res.json({ id: user.id, email: user.email, role: user.role });
});

adminUsersRouter.delete('/:id', requireFreshReauth, async (req, res) => {
  const id = String(req.params.id);
  if (id === req.session.userId) throw new AppError(400, 'Не можете да се избришете себеси');
  await prisma.user.delete({ where: { id } });
  await writeAudit({ actorId: req.session.userId, actorName: 'ADMIN', action: 'user.delete', entity: 'User', entityId: id });
  res.status(204).end();
});

// ── Settings ──────────────────────────────────────────────────────────────────
export const adminSettingsRouter = Router();

adminSettingsRouter.get('/', async (_req, res) => {
  res.json(await prisma.setting.findMany());
});

adminSettingsRouter.put('/:key', async (req, res) => {
  const key = String(req.params.key);
  const { value } = z.object({ value: z.unknown() }).parse(req.body);
  await setSetting(key, value as Prisma.InputJsonValue);
  await purge(CACHE_NS.settings);
  await writeAudit({ actorId: req.session.userId, actorName: req.session.role ?? 'admin', action: 'settings.update', entity: 'Setting', entityId: key });
  logger.info({ key }, 'settings.updated');
  res.json({ ok: true });
});

// ── Outbox (delivery problems) ────────────────────────────────────────────────
export const adminOutboxRouter = Router();

adminOutboxRouter.get('/', async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  res.json(
    await prisma.outboxJob.findMany({
      where: status ? { status: status as 'DEAD' } : {},
      orderBy: { updatedAt: 'desc' },
      take: 200,
    }),
  );
});

adminOutboxRouter.post('/:id/retry', async (req, res) => {
  const job = await prisma.outboxJob.update({
    where: { id: req.params.id },
    data: { status: 'QUEUED', attempts: 0, nextRunAt: new Date(), lastError: null, lockedAt: null },
  });
  await writeAudit({ actorId: req.session.userId, actorName: req.session.role ?? 'admin', action: 'outbox.retry', entity: 'OutboxJob', entityId: job.id });
  res.json({ ok: true });
});

// ── Audit (read-only) ─────────────────────────────────────────────────────────
export const adminAuditRouter = Router();
adminAuditRouter.get('/', async (req, res) => {
  const entity = typeof req.query.entity === 'string' ? req.query.entity : undefined;
  res.json(
    await prisma.auditLog.findMany({ where: entity ? { entity } : {}, orderBy: { createdAt: 'desc' }, take: 300 }),
  );
});

// ── Stats (dashboard) ─────────────────────────────────────────────────────────
export const adminStatsRouter = Router();
adminStatsRouter.get('/leads', async (req, res) => {
  const range = Number(req.query.days ?? 30);
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
  const [total, byType, byStatus] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.groupBy({ by: ['type'], where: { createdAt: { gte: since } }, _count: true }),
    prisma.lead.groupBy({ by: ['status'], where: { createdAt: { gte: since } }, _count: true }),
  ]);
  res.json({ total, byType, byStatus });
});

// ── Cache invalidate (manual) ─────────────────────────────────────────────────
export const adminCacheRouter = Router();
adminCacheRouter.post('/invalidate', async (_req, res) => {
  await purge(...Object.values(CACHE_NS));
  logger.info('cache.invalidated');
  res.json({ ok: true });
});
