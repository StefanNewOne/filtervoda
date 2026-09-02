/**
 * Public lead endpoint (ADR-005). Protection: Origin/Referer allowlist + Turnstile + honeypot
 * + rate limit + Zod validation. No session, no CSRF token. Returns the lead id on success.
 */
import { leadSubmissionSchema } from '@filtervoda/shared';
import { Router } from 'express';
import { env } from '../config/env.js';
import { ipHash } from '../lib/hash.js';
import { AppError } from '../middleware/error.js';
import { leadLimiter10Min, leadLimiter24h } from '../middleware/rateLimit.js';
import { registerKick } from '../services/outbox.service.js';
import { createLead } from '../services/lead.service.js';
import { verifyTurnstile } from '../services/turnstile.service.js';

export const publicLeadsRouter = Router();

function originAllowed(req: import('express').Request): boolean {
  const raw = req.header('Origin') ?? req.header('Referer');
  if (!raw) return false;
  try {
    return new URL(raw).origin === new URL(env.PUBLIC_SITE_URL).origin;
  } catch {
    return false;
  }
}

publicLeadsRouter.post('/leads', leadLimiter10Min, leadLimiter24h, async (req, res) => {
  if (!originAllowed(req)) throw new AppError(403, 'Барањето не е дозволено');

  const input = leadSubmissionSchema.parse(req.body);

  // Honeypot: a filled hidden field means a bot — pretend success, drop silently.
  if (input.context.hp) {
    res.status(202).json({ ok: true });
    return;
  }

  const clientIp = req.ip ?? '0.0.0.0';
  const okTurnstile = await verifyTurnstile(input.context.turnstileToken, clientIp);
  if (!okTurnstile) throw new AppError(400, 'Верификацијата не успеа. Обидете се повторно.');

  const lead = await createLead(input, {
    ipHash: ipHash(clientIp),
    userAgent: req.header('User-Agent') ?? undefined,
    correlationId: req.correlationId,
  });

  res.status(201).json({ ok: true, leadId: lead.id });
});

// The processor registers its kick at startup; re-export for wiring in server.ts.
export { registerKick };
