/**
 * Audited CRUD factory for simple admin entities. Every mutation writes an AuditLog row
 * (CLAUDE.md Engineering Posture #3). AuthZ is applied by the mounting router; controllers
 * still assume nothing about middleware (defense in depth).
 */
import type { Request, Response } from 'express';
import { Router } from 'express';
import type { AnyZodObject } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { writeAudit } from '../../services/audit.service.js';
import { purge } from '../../services/cache.js';

interface CrudOptions {
  entity: string; // audit entity name, e.g. 'Faq'
  model: keyof typeof prisma; // prisma delegate name, e.g. 'faq'
  schema: AnyZodObject;
  idType?: 'string' | 'number';
  orderBy?: object;
  /** Data cache namespaces to purge on every mutation; the full-page cache is always cleared too. */
  cacheNs?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function delegate(model: keyof typeof prisma): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

function parseId(raw: string | string[] | undefined, idType: 'string' | 'number') {
  const s = String(raw);
  return idType === 'number' ? Number(s) : s;
}

export function crudRouter(opts: CrudOptions): Router {
  const router = Router();
  const idType = opts.idType ?? 'string';
  const actor = (req: Request) => ({ actorId: req.session.userId, actorName: req.session.role ?? 'admin', correlationId: req.correlationId });
  const purgeCache = () => purge(...(opts.cacheNs ?? [])); // always clears the storefront full-page cache

  router.get('/', async (_req: Request, res: Response) => {
    res.json(await delegate(opts.model).findMany({ orderBy: opts.orderBy ?? { id: 'asc' } }));
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const row = await delegate(opts.model).findUnique({ where: { id: parseId(req.params.id, idType) } });
    if (!row) {
      res.status(404).json({ error: 'Не е пронајдено', correlationId: req.correlationId });
      return;
    }
    res.json(row);
  });

  router.post('/', async (req: Request, res: Response) => {
    const data = opts.schema.parse(req.body);
    const row = await delegate(opts.model).create({ data });
    await writeAudit({ ...actor(req), action: `${opts.entity.toLowerCase()}.create`, entity: opts.entity, entityId: String(row.id), after: data });
    await purgeCache();
    res.status(201).json(row);
  });

  router.patch('/:id', async (req: Request, res: Response) => {
    const id = parseId(req.params.id, idType);
    const data = opts.schema.partial().parse(req.body);
    const before = await delegate(opts.model).findUnique({ where: { id } });
    const row = await delegate(opts.model).update({ where: { id }, data });
    await writeAudit({ ...actor(req), action: `${opts.entity.toLowerCase()}.update`, entity: opts.entity, entityId: String(id), before, after: data });
    await purgeCache();
    res.json(row);
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const id = parseId(req.params.id, idType);
    await delegate(opts.model).delete({ where: { id } });
    await writeAudit({ ...actor(req), action: `${opts.entity.toLowerCase()}.delete`, entity: opts.entity, entityId: String(id) });
    await purgeCache();
    res.status(204).end();
  });

  return router;
}
