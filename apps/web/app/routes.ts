import {
  type RouteConfig,
  type RouteConfigEntry,
  index,
  route,
  prefix,
} from '@react-router/dev/routes';

/**
 * The full public page tree, in MK-canonical route segments (kept identical across
 * locales for launch — see _docs/plans/FV-001-i18n-en-sq.md §3.1). `idPrefix` keeps
 * route ids unique when the same modules are mounted under /en and /sq (e.g. `en-home`).
 */
function pages(idPrefix: string): RouteConfigEntry[] {
  const id = (name: string) => ({ id: `${idPrefix}${name}` });
  return [
    index('routes/home.tsx', id('home')),
    route('proizvodi', 'routes/catalog.tsx', id('catalog')),
    route('proizvodi/:slug', 'routes/product.tsx', id('product')),
    route('za-biznis', 'routes/b2b.tsx', id('b2b')),
    route('soveti', 'routes/blog.tsx', id('blog')),
    route('soveti/:slug', 'routes/post.tsx', id('post')),
    route('za-nas', 'routes/about.tsx', id('about')),
    route('kontakt', 'routes/contact.tsx', id('contact')),
    route('blagodarime', 'routes/thank-you.tsx', id('thank-you')),
    route('pravni/:slug', 'routes/legal.tsx', id('legal')),
  ];
}

export default [
  // Macedonian (default) — served at the root, URLs unchanged (preserves SEO + 301 map).
  ...pages('mk-'),
  // English + Albanian — same tree under a locale prefix.
  ...prefix('en', pages('en-')),
  ...prefix('sq', pages('sq-')),
  // Locale-independent, root-only routes.
  route('sitemap.xml', 'routes/sitemap.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
