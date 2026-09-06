/**
 * CSRF for admin write routes (ADR-005): csrf-csrf double-submit cookie + header.
 * The public POST /leads has no session → no CSRF token; it uses Origin allowlist + Turnstile.
 */
import { doubleCsrf } from 'csrf-csrf';
import type { Request, Response } from 'express';
import { env, isProd } from '../config/env.js';

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => env.SESSION_SECRET,
  // Required in csrf-csrf v3: binds the token to the session. Without it the token hashed
  // against `undefined`, so EVERY admin mutation failed CSRF validation (422) — nothing saved.
  getSessionIdentifier: (req) => req.sessionID ?? '',
  cookieName: isProd ? '__Host-fv.csrf' : 'fv.csrf',
  cookieOptions: { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' },
  getTokenFromRequest: (req) => req.header('X-CSRF-Token'),
});

export const csrfProtection = doubleCsrfProtection;

// Always overwrite (no reuse-validation): a stale CSRF cookie from an older config would
// otherwise make generateToken THROW on /auth/login & /auth/me → 403 → can't log in.
export function generateCsrfToken(req: Request, res: Response): string {
  return generateToken(req, res, true, false);
}
