/**
 * CSRF for admin write routes (ADR-005): csrf-csrf double-submit cookie + header.
 * The public POST /leads has no session → no CSRF token; it uses Origin allowlist + Turnstile.
 */
import { doubleCsrf } from 'csrf-csrf';
import { env, isProd } from '../config/env.js';

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => env.SESSION_SECRET,
  cookieName: isProd ? '__Host-fv.csrf' : 'fv.csrf',
  cookieOptions: { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' },
  getTokenFromRequest: (req) => req.header('X-CSRF-Token'),
});

export const csrfProtection = doubleCsrfProtection;
export { generateToken as generateCsrfToken };
