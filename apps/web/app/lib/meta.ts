/**
 * Locale-aware SEO meta (FV-001 M3). Builds <title>, description, per-locale canonical, hreflang
 * alternates (mk/en/sq + x-default) and Open Graph tags for the storefront's SSR routes. Keeps
 * MK at the root and en/sq under their prefixes (mirrors routing + the 301 map).
 */
import { DEFAULT_LOCALE, LOCALES, LOCALE_BCP47, type Locale } from '@filtervoda/shared';
import { translate } from '../i18n';
import { localizedPath } from '../i18n/paths';
import type { TKey } from '../i18n/types';

const OG_LOCALE: Record<Locale, string> = { mk: 'mk_MK', en: 'en_US', sq: 'sq_AL' };

/** Shorthand: translate a dictionary key for a locale (server-side, in meta()). */
export function tm(locale: Locale, key: TKey, vars?: Record<string, string | number>): string {
  return translate(locale, key, vars);
}

export interface LocaleMetaInput {
  locale: Locale;
  siteUrl?: string;
  /** MK-canonical path, e.g. '/proizvodi' or '/proizvodi/slug' ('/' for home). */
  path: string;
  title: string;
  description?: string;
  ogType?: string;
  image?: string; // absolute URL
  robots?: string; // e.g. 'noindex'
}

export function localeMeta(opts: LocaleMetaInput) {
  const { locale, siteUrl = '', path, title, description, ogType = 'website', image, robots } = opts;
  const abs = (p: string) => (siteUrl ? `${siteUrl}${p}` : undefined);
  const canonical = abs(localizedPath(path, locale));

  const tags: Record<string, unknown>[] = [{ title }];
  if (description) tags.push({ name: 'description', content: description });
  if (robots) tags.push({ name: 'robots', content: robots });
  if (canonical) tags.push({ tagName: 'link', rel: 'canonical', href: canonical });

  // hreflang alternates (only when we know the absolute origin) — noindex pages skip these.
  if (siteUrl && !robots) {
    for (const l of LOCALES) {
      tags.push({ tagName: 'link', rel: 'alternate', hrefLang: LOCALE_BCP47[l], href: abs(localizedPath(path, l)) });
    }
    tags.push({ tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: abs(localizedPath(path, DEFAULT_LOCALE)) });
  }

  tags.push({ property: 'og:title', content: title });
  if (description) tags.push({ property: 'og:description', content: description });
  tags.push({ property: 'og:type', content: ogType });
  if (canonical) tags.push({ property: 'og:url', content: canonical });
  tags.push({ property: 'og:locale', content: OG_LOCALE[locale] });
  if (image) tags.push({ property: 'og:image', content: image });
  return tags;
}
