/**
 * Named constants — single source (CLAUDE.md Category 7: no magic numbers).
 * Import these everywhere; never inline the literals.
 */

// ── Retention / lifecycle ────────────────────────────────────────────────────
export const LEAD_RETENTION_MONTHS = 24;
export const IP_HASH_RETENTION_DAYS = 30;
export const OUTBOX_MAX_ATTEMPTS = 5;
export const SESSION_DAYS = 30;
export const REAUTH_WINDOW_MIN = 10;
export const PREVIEW_TOKEN_TTL_MIN = 60;
export const PASSWORD_RESET_TTL_MIN = 30;

// ── Money / locale ───────────────────────────────────────────────────────────
export const CURRENCY = 'MKD' as const;
export const LOCALE = 'mk-MK' as const;
export const TIMEZONE = 'Europe/Skopje' as const;

// ── B2B savings calculator defaults ──────────────────────────────────────────
export const DEFAULT_LITERS_PER_PERSON_DAY = 1.5;
export const DEFAULT_WORKING_DAYS = 22;
export const GALLON_LITERS = 19;
export const BOTTLE_LITERS = 0.5;

// ── Outbox backoff (ms) after each failed attempt ────────────────────────────
export const OUTBOX_BACKOFF_MS = [
  60_000, // 1 min
  300_000, // 5 min
  900_000, // 15 min
  3_600_000, // 1 h
  21_600_000, // 6 h
] as const;

// ── Rate limits ──────────────────────────────────────────────────────────────
export const RATE_LIMIT = {
  leadPer10Min: 5,
  leadPer24h: 20,
  authPer15Min: 5,
  adminPerMin: 300,
  publicReadPerMin: 120,
} as const;

// ── Redis page-cache TTL ─────────────────────────────────────────────────────
export const PAGE_CACHE_TTL_SEC = 600; // 10 min; invalidated on publish

// ── Enums as const tuples (kept in sync with Prisma) ─────────────────────────
export const LEAD_TYPES = ['B2C', 'B2B', 'CONTACT', 'ADVISOR'] as const;
export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'OFFER_SENT',
  'WON',
  'INSTALLED',
  'LOST',
  'SPAM',
] as const;
export const PRODUCT_AUDIENCES = ['B2C', 'B2B', 'BOTH'] as const;
export const PUBLISH_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
export const USER_ROLES = ['ADMIN', 'EDITOR', 'CLIENT_VIEWER'] as const;
export const FAQ_SCOPES = ['GLOBAL', 'PRODUCT', 'B2B'] as const;
export const TEMPLATE_IDS = ['b1', 'b2', 'b3'] as const;

// Human-readable Macedonian lead status labels (UI).
export const LEAD_STATUS_LABELS_MK: Record<(typeof LEAD_STATUSES)[number], string> = {
  NEW: 'Нов',
  CONTACTED: 'Контактиран',
  OFFER_SENT: 'Понуда испратена',
  WON: 'Договорено',
  INSTALLED: 'Монтирано',
  LOST: 'Изгубено',
  SPAM: 'Спам',
};

export const TEMPLATE_LABELS_MK: Record<(typeof TEMPLATE_IDS)[number], string> = {
  b1: 'Б-1 Кристално чисто',
  b2: 'Б-2 Жива вода',
  b3: 'Б-3 Паметна вода',
};
