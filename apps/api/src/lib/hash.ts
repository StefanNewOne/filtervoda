/**
 * Hashing helpers. ipHash uses HMAC with IP_HASH_SECRET (never store a raw IP).
 * CAPI PII is SHA-256 of normalized lowercase-trimmed values (Meta requirement).
 */
import { createHash, createHmac } from 'node:crypto';
import { env } from '../config/env.js';

export function ipHash(ip: string): string {
  return createHmac('sha256', env.IP_HASH_SECRET).update(ip).digest('hex');
}

/** SHA-256 of a normalized value for Meta CAPI user_data. Returns undefined for empty input. */
export function capiHash(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash('sha256').update(normalized).digest('hex');
}

/** Hash a phone for CAPI: digits only (E.164 without '+'). */
export function capiHashPhone(e164?: string | null): string | undefined {
  if (!e164) return undefined;
  return capiHash(e164.replace(/[^\d]/g, ''));
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
