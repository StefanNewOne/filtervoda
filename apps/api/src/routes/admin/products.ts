/**
 * Admin products: CRUD + publish/unpublish (cache purge) + signed preview token.
 * Sub-resources (specs, stages, images, faqs) are edited via their own endpoints.
 */
import { PREVIEW_TOKEN_TTL_MIN, productSchema } from '@filtervoda/shared';
import type { Prisma } from '@prisma/client';
import { createHmac } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { requireFreshReauth } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error.js';
import { writeAudit } from '../../services/audit.service.js';
import { CACHE_NS, purge } from '../../services/cache.js';

export const adminProductsRouter = Router();

const actor = (req: import('express').Request) => ({
  actorId: req.session.userId,
  actorName: req.session.role ?? 'admin',
  correlationId: req.correlationId,
});

adminProductsRouter.get('/', async (_req, res) => {
  res.json(
    await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { category: { select: { name: true, slug: true } } },
    }),
  );
});

adminProductsRouter.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      specs: { orderBy: { sortOrder: 'asc' } },
      stages: { orderBy: { order: 'asc' } },
      images: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      faqs: true,
      related: { include: { related: { select: { id: true, name: true } } }, orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!product) throw new AppError(404, 'Производот не е пронајден');
  // Flatten related into the shape the editor expects: [{ relatedId, name }].
  res.json({ ...product, related: product.related.map((r) => ({ relatedId: r.relatedId, name: r.related.name })) });
});

adminProductsRouter.post('/', async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await prisma.product.create({ data: data as Prisma.ProductUncheckedCreateInput });
  await writeAudit({ ...actor(req), action: 'product.create', entity: 'Product', entityId: product.id, after: { slug: data.slug, status: data.status } });
  res.status(201).json(product);
});

adminProductsRouter.patch('/:id', async (req, res) => {
  const data = productSchema.partial().parse(req.body);
  const before = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!before) throw new AppError(404, 'Производот не е пронајден');
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: data as Prisma.ProductUncheckedUpdateInput,
  });
  await writeAudit({ ...actor(req), action: 'product.update', entity: 'Product', entityId: product.id, before: { status: before.status }, after: { status: product.status } });
  await purge(CACHE_NS.products);
  res.json(product);
});

adminProductsRouter.post('/:id/publish', async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { status: 'PUBLISHED' } });
  await writeAudit({ ...actor(req), action: 'product.publish', entity: 'Product', entityId: product.id, after: { status: 'PUBLISHED' } });
  await purge(CACHE_NS.products);
  logger.info({ productId: product.id }, 'product.published');
  res.json(product);
});

adminProductsRouter.post('/:id/unpublish', async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { status: 'DRAFT' } });
  await writeAudit({ ...actor(req), action: 'product.unpublish', entity: 'Product', entityId: product.id, after: { status: 'DRAFT' } });
  await purge(CACHE_NS.products);
  logger.info({ productId: product.id }, 'product.unpublished');
  res.json(product);
});

adminProductsRouter.delete('/:id', requireFreshReauth, async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  await writeAudit({ ...actor(req), action: 'product.delete', entity: 'Product', entityId: req.params.id });
  await purge(CACHE_NS.products);
  res.status(204).end();
});

// ── Sub-resources (replace-all: the editor tab sends the full array) ──────────
// .nullish() (not .optional()) on nullable columns: rows loaded from the DB carry `unit: null`
// / `icon: null`, which .optional() rejects → the admin editor's save 422'd (nothing saved).
const specsSchema = z.array(z.object({ group: z.string().max(80), label: z.string().max(120), value: z.string().max(300), unit: z.string().max(40).nullish(), sortOrder: z.number().int().default(0) }));
const stagesSchema = z.array(z.object({ order: z.coerce.number().int(), name: z.string().max(160), removes: z.string().max(300), whyItMatters: z.string().max(300), icon: z.string().max(60).nullish() }));
const imagesSchema = z.array(z.object({ mediaId: z.string().cuid(), alt: z.string().max(300).nullish().transform((v) => v ?? ''), sortOrder: z.number().int().default(0), isPrimary: z.boolean().default(false) }));
const relatedSchema = z.array(z.object({ relatedId: z.string().cuid(), sortOrder: z.number().int().default(0) }));

adminProductsRouter.put('/:id/specs', async (req, res) => {
  const specs = specsSchema.parse(req.body);
  await prisma.$transaction([
    prisma.productSpec.deleteMany({ where: { productId: req.params.id } }),
    prisma.productSpec.createMany({ data: specs.map((s) => ({ ...s, productId: req.params.id })) }),
  ]);
  await purge(CACHE_NS.products);
  res.json({ ok: true, count: specs.length });
});

adminProductsRouter.put('/:id/stages', async (req, res) => {
  const stages = stagesSchema.parse(req.body);
  await prisma.$transaction([
    prisma.productStage.deleteMany({ where: { productId: req.params.id } }),
    prisma.productStage.createMany({ data: stages.map((s) => ({ ...s, productId: req.params.id })) }),
  ]);
  await purge(CACHE_NS.products);
  res.json({ ok: true, count: stages.length });
});

adminProductsRouter.put('/:id/images', async (req, res) => {
  const images = imagesSchema.parse(req.body);
  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: req.params.id } }),
    prisma.productImage.createMany({ data: images.map((i) => ({ ...i, productId: req.params.id })) }),
  ]);
  await purge(CACHE_NS.products);
  res.json({ ok: true, count: images.length });
});

adminProductsRouter.put('/:id/related', async (req, res) => {
  const related = relatedSchema.parse(req.body);
  await prisma.$transaction([
    prisma.relatedProduct.deleteMany({ where: { productId: req.params.id } }),
    prisma.relatedProduct.createMany({ data: related.map((r) => ({ ...r, productId: req.params.id })) }),
  ]);
  await purge(CACHE_NS.products);
  res.json({ ok: true, count: related.length });
});

// Signed preview token (1h) for draft review on the storefront.
adminProductsRouter.get('/:id/preview-token', async (req, res) => {
  const exp = Date.now() + PREVIEW_TOKEN_TTL_MIN * 60 * 1000;
  const payload = `product:${req.params.id}:${exp}`;
  const sig = createHmac('sha256', env.PREVIEW_SECRET).update(payload).digest('hex');
  res.json({ token: `${Buffer.from(payload).toString('base64url')}.${sig}`, expiresAt: exp });
});
