/**
 * „Дизајн и темплејти" — the single-active template module (developer's key requirement,
 * mirrors Potencijashop Design Versions). Exactly one template is live; applying + publishing
 * swaps it for ALL visitors and purges the storefront cache. Tokens are editable per template.
 */
import { TEMPLATE_IDS, activeTemplateSchema, templateTokensSchema } from '@filtervoda/shared';
import { Router } from 'express';
import { z } from 'zod';
import { logger } from '../../lib/logger.js';
import { writeAudit } from '../../services/audit.service.js';
import { CACHE_NS, purge } from '../../services/cache.js';
import { getSetting, setSetting } from '../../services/settings.service.js';

export const adminTemplatesRouter = Router();

adminTemplatesRouter.get('/', async (_req, res) => {
  const active = (await getSetting<string>('design.activeTemplate')) ?? 'b1';
  const tokens = (await getSetting<Record<string, Record<string, string>>>('design.templateTokens')) ?? {};
  res.json({ templates: TEMPLATE_IDS, active, tokens });
});

// Apply + publish a template → live for everyone, cache purged.
adminTemplatesRouter.post('/activate', async (req, res) => {
  const { templateId } = activeTemplateSchema.parse(req.body);
  const before = await getSetting<string>('design.activeTemplate');
  await setSetting('design.activeTemplate', templateId); // stored as a scalar JSON string
  await purge(CACHE_NS.settings, CACHE_NS.products, CACHE_NS.posts, CACHE_NS.packages);
  await writeAudit({
    actorId: req.session.userId,
    actorName: req.session.role ?? 'admin',
    action: 'template.activated',
    entity: 'Setting',
    entityId: 'design.activeTemplate',
    before: { active: before },
    after: { active: templateId },
    correlationId: req.correlationId,
  });
  logger.info({ templateId }, 'template.activated');
  res.json({ ok: true, active: templateId });
});

// Edit a template's token overrides.
adminTemplatesRouter.put('/:templateId/tokens', async (req, res) => {
  const templateId = z.enum(TEMPLATE_IDS).parse(req.params.templateId);
  const tokens = templateTokensSchema.parse(req.body);
  const all = (await getSetting<Record<string, Record<string, string | undefined>>>('design.templateTokens')) ?? {};
  all[templateId] = tokens;
  await setSetting('design.templateTokens', all);
  // Tokens (colours/fonts/radius) affect every page — purge the same set as activation.
  await purge(CACHE_NS.settings, CACHE_NS.products, CACHE_NS.posts, CACHE_NS.packages);
  await writeAudit({
    actorId: req.session.userId,
    actorName: req.session.role ?? 'admin',
    action: 'template.tokens.update',
    entity: 'Setting',
    entityId: `design.templateTokens.${templateId}`,
    after: tokens,
    correlationId: req.correlationId,
  });
  res.json({ ok: true, tokens });
});
