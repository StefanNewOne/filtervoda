/**
 * Admin posts (Совети). CRUD + publish/unpublish. Rich content is stored as { html } in
 * Post.content (authored by trusted EDITOR/ADMIN via TipTap). Publish sets publishedAt +
 * purges the posts cache and writes an audit row.
 */
import { postSchema } from '@filtervoda/shared';
import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { sanitizeHtml } from '../../lib/sanitize.js';
import { requireFreshReauth } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error.js';
import { writeAudit } from '../../services/audit.service.js';
import { CACHE_NS, purge } from '../../services/cache.js';

export const adminPostsRouter = Router();
const actor = (req: import('express').Request) => ({ actorId: req.session.userId, actorName: req.session.role ?? 'admin', correlationId: req.correlationId });

function toData(body: unknown): Prisma.PostUncheckedCreateInput {
  const p = postSchema.parse(body);
  const { contentHtml, ...rest } = p;
  const clean = contentHtml ? sanitizeHtml(contentHtml) : undefined;
  return { ...rest, content: clean ? { html: clean } : undefined } as Prisma.PostUncheckedCreateInput;
}

adminPostsRouter.get('/', async (_req, res) => {
  res.json(await prisma.post.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }));
});

adminPostsRouter.get('/:id', async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new AppError(404, 'Статијата не е пронајдена');
  res.json(post);
});

adminPostsRouter.post('/', async (req, res) => {
  const post = await prisma.post.create({ data: toData(req.body) });
  await writeAudit({ ...actor(req), action: 'post.create', entity: 'Post', entityId: post.id, after: { slug: post.slug } });
  res.status(201).json(post);
});

adminPostsRouter.patch('/:id', async (req, res) => {
  const post = await prisma.post.update({ where: { id: req.params.id }, data: toData(req.body) });
  await purge(CACHE_NS.posts);
  await writeAudit({ ...actor(req), action: 'post.update', entity: 'Post', entityId: post.id });
  res.json(post);
});

adminPostsRouter.post('/:id/publish', async (req, res) => {
  const post = await prisma.post.update({ where: { id: req.params.id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
  await purge(CACHE_NS.posts);
  await writeAudit({ ...actor(req), action: 'post.publish', entity: 'Post', entityId: post.id });
  logger.info({ postId: post.id }, 'post.published');
  res.json(post);
});

adminPostsRouter.post('/:id/unpublish', async (req, res) => {
  const post = await prisma.post.update({ where: { id: req.params.id }, data: { status: 'DRAFT' } });
  await purge(CACHE_NS.posts);
  res.json(post);
});

adminPostsRouter.delete('/:id', requireFreshReauth, async (req, res) => {
  const id = String(req.params.id);
  await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  await purge(CACHE_NS.posts);
  await writeAudit({ ...actor(req), action: 'post.delete', entity: 'Post', entityId: id });
  res.status(204).end();
});
