/**
 * Auth routes. Login/reset are rate-limited by IP and account (CLAUDE.md §12.7).
 * Reset always returns 200 to avoid account enumeration.
 */
import { loginSchema, reauthSchema, resetRequestSchema, resetSchema } from '@filtervoda/shared';
import { Router } from 'express';
import { redis } from '../lib/redis.js';
import { requireAuth } from '../middleware/auth.js';
import { generateCsrfToken } from '../middleware/csrf.js';
import { AppError } from '../middleware/error.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  consumeResetToken,
  issueResetToken,
  verifyLogin,
  verifyPassword,
} from '../services/auth.service.js';
import { enqueue } from '../services/outbox.service.js';

export const authRouter = Router();

authRouter.post('/auth/login', authLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  // Per-account backoff key (in addition to per-IP authLimiter).
  const acctKey = `authfail:${email.toLowerCase()}`;
  const fails = Number((await redis.get(acctKey)) ?? 0);
  if (fails >= 10) throw new AppError(429, 'Премногу обиди. Обидете се подоцна.');

  try {
    const user = await verifyLogin(email, password);
    await redis.del(acctKey);
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.lastReauthAt = Date.now();
    res.json({ user, csrfToken: generateCsrfToken(req, res) });
  } catch (err) {
    await redis.set(acctKey, fails + 1, 'EX', 15 * 60);
    throw err;
  }
});

authRouter.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

authRouter.get('/auth/me', requireAuth, (req, res) => {
  res.json({ userId: req.session.userId, role: req.session.role, csrfToken: generateCsrfToken(req, res) });
});

authRouter.post('/auth/reauth', authLimiter, requireAuth, async (req, res) => {
  const { password } = reauthSchema.parse(req.body);
  // Per-session backoff so a stolen session cannot brute-force the account password.
  const key = `reauthfail:${req.session.userId}`;
  const fails = Number((await redis.get(key)) ?? 0);
  if (fails >= 5) throw new AppError(429, 'Премногу обиди. Обидете се подоцна.');
  const ok = await verifyPassword(req.session.userId as string, password);
  if (!ok) {
    await redis.set(key, fails + 1, 'EX', 15 * 60);
    throw new AppError(401, 'Погрешна лозинка');
  }
  await redis.del(key);
  req.session.lastReauthAt = Date.now();
  res.json({ ok: true });
});

authRouter.post('/auth/reset-request', authLimiter, async (req, res) => {
  const { email } = resetRequestSchema.parse(req.body);
  const token = await issueResetToken(email);
  if (token) {
    await enqueue('email.passwordReset', { email, token });
  }
  res.json({ ok: true }); // always 200 — no enumeration
});

authRouter.post('/auth/reset', authLimiter, async (req, res) => {
  const { token, password } = resetSchema.parse(req.body);
  await consumeResetToken(token, password);
  res.json({ ok: true });
});
