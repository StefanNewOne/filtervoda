import type { Locale } from '@filtervoda/shared';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { Link, useLocation, type LinkProps } from 'react-router';
import { translate } from './index';
import { localizedPath, stripLocale } from './paths';
import type { TKey } from './types';

const LocaleContext = createContext<Locale | null>(null);

/**
 * Provides the active locale (derived from the URL) to the subtree.
 * Kept URL-driven so SSR and client agree and the canonical URL is the source of truth.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const locale = useMemo(() => stripLocale(pathname).locale, [pathname]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  return ctx ?? 'mk';
}

/** Translation hook: `const t = useT(); t('nav.home')`. */
export function useT(): (key: TKey, vars?: Record<string, string | number>) => string {
  const locale = useLocale();
  return useCallback((key, vars) => translate(locale, key, vars), [locale]);
}

/** Build a locale-aware href from an MK-canonical path for the current locale. */
export function useLocalizedPath(): (path: string) => string {
  const locale = useLocale();
  return useCallback((path) => localizedPath(path, locale), [locale]);
}

/**
 * The current page's path in a target locale — for the language switcher.
 * Preserves the sub-path + query so switching keeps you on the same page (and utm/fbclid).
 */
export function useSwitchLocalePath(): (target: Locale) => string {
  const { pathname, search } = useLocation();
  return useCallback(
    (target) => localizedPath(stripLocale(pathname).rest + search, target),
    [pathname, search],
  );
}

/** Drop-in <Link> that prefixes string `to` with the active locale automatically. */
export function LocaleLink({ to, ...rest }: LinkProps) {
  const loc = useLocalizedPath();
  const target = typeof to === 'string' ? loc(to) : to;
  return <Link to={target} {...rest} />;
}
