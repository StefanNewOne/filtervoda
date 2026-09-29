/**
 * Server-side content localization (FV-001 M2). Each translatable row carries a nullable
 * `i18n` JSON of the shape `{ en?: {field: value…}, sq?: {field: value…} }`. The base columns
 * stay Macedonian; `applyLocale` overlays the requested locale's fields and drops `i18n` from
 * the payload. Missing locale/field → the MK base value (fallback), so nothing ever renders a
 * raw key or an empty string just because a translation is absent.
 */
import { DEFAULT_LOCALE, isLocale, type Locale } from '@filtervoda/shared';

export type { Locale };

/** Read + validate the requested locale from a public read query (`?lang=en`). */
export function localeFromQuery(lang: unknown): Locale {
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

type WithI18n = { i18n?: unknown } & Record<string, unknown>;

/**
 * Return a copy of `row` with translatable fields overlaid from `row.i18n[locale]` and the
 * `i18n` column removed. A locale value only overrides when it is a non-empty string/array/object
 * — an empty translation falls back to the base (MK) value.
 */
export function applyLocale<T extends WithI18n>(row: T, locale: Locale): Omit<T, 'i18n'> {
  const { i18n, ...rest } = row;
  if (locale === DEFAULT_LOCALE || !i18n || typeof i18n !== 'object') return rest;
  const overrides = (i18n as Record<string, unknown>)[locale];
  if (!overrides || typeof overrides !== 'object') return rest;
  const out: Record<string, unknown> = { ...rest };
  for (const [key, value] of Object.entries(overrides as Record<string, unknown>)) {
    if (value == null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as Omit<T, 'i18n'>;
}

/** Localize each row in a list. */
export function applyLocaleAll<T extends WithI18n>(rows: T[], locale: Locale): Omit<T, 'i18n'>[] {
  return rows.map((r) => applyLocale(r, locale));
}
