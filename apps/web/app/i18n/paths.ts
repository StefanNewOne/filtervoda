import type { Locale } from '@filtervoda/shared';
import { DEFAULT_LOCALE, PREFIXED_LOCALES, isLocale } from '@filtervoda/shared';

/**
 * Split a pathname into its locale and the MK-canonical rest.
 * `/en/proizvodi` → { locale: 'en', rest: '/proizvodi' }
 * `/proizvodi`    → { locale: 'mk', rest: '/proizvodi' }
 * `/`             → { locale: 'mk', rest: '/' }
 * Only `en`/`sq` are recognized as prefixes; anything else is part of the path.
 */
export function stripLocale(pathname: string): { locale: Locale; rest: string } {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first) && (PREFIXED_LOCALES as readonly string[]).includes(first)) {
    const rest = '/' + segments.slice(1).join('/');
    return { locale: first, rest: rest === '/' ? '/' : rest.replace(/\/$/, '') };
  }
  return { locale: DEFAULT_LOCALE, rest: pathname };
}

/**
 * Build a locale-aware href from an MK-canonical path.
 * localizedPath('/proizvodi', 'en') → '/en/proizvodi'
 * localizedPath('/proizvodi', 'mk') → '/proizvodi'  (default has no prefix)
 * Preserves any query string / hash on the input path.
 */
export function localizedPath(path: string, locale: Locale): string {
  // Split off any ?query / #hash so it's preserved untouched.
  const cut = path.search(/[?#]/);
  const pathname = cut === -1 ? path : path.slice(0, cut);
  const suffix = cut === -1 ? '' : path.slice(cut);
  // Never double-prefix — normalize to the canonical path first.
  const { rest } = stripLocale(pathname);
  if (locale === DEFAULT_LOCALE) return rest + suffix;
  const base = rest === '/' ? '' : rest;
  return `/${locale}${base}` + suffix;
}
