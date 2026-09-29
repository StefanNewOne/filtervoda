import type { Locale } from '@filtervoda/shared';
import { DEFAULT_LOCALE } from '@filtervoda/shared';
import { en } from './en';
import { mk } from './mk';
import { sq } from './sq';
import type { Dict, TKey } from './types';

export type { Dict, TKey } from './types';

const DICTS: Record<Locale, Partial<Dict>> = { mk, en, sq };

/**
 * Translate a key for a locale. Missing EN/SQ keys fall back to MK (the reference),
 * so the site never shows a raw key even before every string is translated.
 * Supports `{var}` interpolation: t(locale, 'x', { name: 'Ана' }).
 */
export function translate(
  locale: Locale,
  key: TKey,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
  const value = (dict[key] ?? (mk as Dict)[key] ?? key) as string;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}
