/**
 * Cloudflare Turnstile server-side verification (ADR-005). Dev bypass via TURNSTILE_DEV_BYPASS
 * until keys exist. Never trust the client — the token is verified here.
 */
import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  if (env.TURNSTILE_DEV_BYPASS) return true;
  if (!env.TURNSTILE_SECRET_KEY) {
    logger.warn('Turnstile secret missing and dev bypass off — rejecting');
    return false;
  }
  if (!token) return false;
  try {
    const { data } = await axios.post(
      VERIFY_URL,
      new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, ...(ip ? { remoteip: ip } : {}) }),
      { timeout: 5000 },
    );
    return Boolean(data?.success);
  } catch (err) {
    logger.warn({ err }, 'Turnstile verify failed');
    return false;
  }
}
