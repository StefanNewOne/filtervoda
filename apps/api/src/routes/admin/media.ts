/**
 * Admin media library. Upload (multer memory → sharp variants → StorageService), list, update
 * alt, soft-delete. Max 4 MB, images only, re-encoded server-side (no user SVG). Audited.
 */
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import { writeAudit } from '../../services/audit.service.js';
import { storeImage } from '../../services/storage.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype);
    if (!ok) {
      cb(new Error('Дозволени се само JPG/PNG/WebP слики'));
      return;
    }
    cb(null, true);
  },
});

export const adminMediaRouter = Router();

adminMediaRouter.get('/', async (_req, res) => {
  res.json(await prisma.media.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 200 }));
});

adminMediaRouter.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) throw new AppError(422, 'Нема прикачена слика');
  const alt = typeof req.body.alt === 'string' ? req.body.alt : '';
  const stored = await storeImage(req.file.buffer, req.file.originalname);
  const media = await prisma.media.create({
    data: {
      driver: stored.driver,
      key: stored.key,
      url: stored.url,
      variants: stored.variants,
      width: stored.width,
      height: stored.height,
      size: stored.size,
      mime: stored.mime,
      alt,
    },
  });
  await writeAudit({
    actorId: req.session.userId,
    actorName: req.session.role ?? 'admin',
    action: 'media.upload',
    entity: 'Media',
    entityId: media.id,
    correlationId: req.correlationId,
  });
  logger.info({ mediaId: media.id }, 'media.uploaded');
  res.status(201).json(media);
});

adminMediaRouter.patch('/:id', async (req, res) => {
  const { alt } = z.object({ alt: z.string().max(300) }).parse(req.body);
  const media = await prisma.media.update({ where: { id: req.params.id }, data: { alt } });
  res.json(media);
});

adminMediaRouter.delete('/:id', async (req, res) => {
  await prisma.media.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  await writeAudit({ actorId: req.session.userId, actorName: req.session.role ?? 'admin', action: 'media.delete', entity: 'Media', entityId: String(req.params.id) });
  res.status(204).end();
});
