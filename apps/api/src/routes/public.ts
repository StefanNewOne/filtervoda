/**
 * Public read routes for SSR (CLAUDE.md §12.7). Cached in Redis (TTL 10 min, purged on
 * publish). No auth. Rate-limited. These feed the storefront's loaders.
 *
 * i18n (FV-001 M2): every content route honors `?lang=en|sq` (default mk) and returns
 * already-localized rows (base MK + `i18n` overlay). The locale is part of the cache key so
 * each language is cached independently.
 */
import { Router } from 'express';
import { applyLocale, applyLocaleAll, localeFromQuery } from '../lib/i18n.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { CACHE_NS, withDefaultTtl } from '../services/cache.js';
import { getPublishedProduct, listFeaturedProducts, listPublishedProducts } from '../services/product.service.js';
import { getPublicSettings, getSetting } from '../services/settings.service.js';
import { prisma } from '../lib/prisma.js';

export const publicRouter = Router();
publicRouter.use(publicReadLimiter);

publicRouter.get('/public/products', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.products}list:${category ?? 'all'}:${locale}`, () =>
    listPublishedProducts(category, locale),
  );
  res.json(data);
});

// „Најбарани системи" — admin-curated ordered list (Setting content.featured.productIds).
// Cached under the settings namespace so it refreshes as soon as the admin re-orders/publishes.
publicRouter.get('/public/products/featured', async (req, res) => {
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.settings}featuredProducts:${locale}`, async () => {
    const ids = (await getSetting<string[]>('content.featured.productIds')) ?? [];
    return listFeaturedProducts(ids, locale);
  });
  res.json(data);
});

publicRouter.get('/public/products/:slug', async (req, res) => {
  const { slug } = req.params;
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.products}one:${slug}:${locale}`, () => getPublishedProduct(slug, locale));
  if (!data) {
    res.status(404).json({ error: 'Производот не е пронајден', correlationId: req.correlationId });
    return;
  }
  res.json(data);
});

publicRouter.get('/public/categories', async (req, res) => {
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.products}categories:${locale}`, async () =>
    applyLocaleAll(await prisma.productCategory.findMany({ orderBy: { sortOrder: 'asc' } }), locale),
  );
  res.json(data);
});

/** Resolve cover Media ids → a { id: url } map (posts hold coverMediaId, not a relation). */
async function coverUrls(ids: (string | null)[]): Promise<Map<string, string>> {
  const clean = ids.filter((x): x is string => Boolean(x));
  if (clean.length === 0) return new Map();
  const media = await prisma.media.findMany({ where: { id: { in: clean } }, select: { id: true, url: true } });
  return new Map(media.map((m) => [m.id, m.url]));
}

publicRouter.get('/public/posts', async (req, res) => {
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.posts}list:${locale}`, async () => {
    const rows = await prisma.post.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, title: true, excerpt: true, coverMediaId: true, publishedAt: true, i18n: true },
    });
    const posts = applyLocaleAll(rows, locale);
    const urls = await coverUrls(posts.map((p) => p.coverMediaId));
    return posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      coverUrl: p.coverMediaId ? (urls.get(p.coverMediaId) ?? null) : null,
      publishedAt: p.publishedAt,
    }));
  });
  res.json(data);
});

publicRouter.get('/public/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.posts}one:${slug}:${locale}`, async () => {
    const row = await prisma.post.findFirst({ where: { slug, status: 'PUBLISHED', deletedAt: null } });
    if (!row) return null;
    const post = applyLocale(row, locale);
    const urls = await coverUrls([post.coverMediaId]);
    return { ...post, coverUrl: post.coverMediaId ? (urls.get(post.coverMediaId) ?? null) : null };
  });
  if (!data) {
    res.status(404).json({ error: 'Статијата не е пронајдена', correlationId: req.correlationId });
    return;
  }
  res.json(data);
});

publicRouter.get('/public/faq', async (req, res) => {
  const scope = typeof req.query.scope === 'string' ? req.query.scope : 'GLOBAL';
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.faq}${scope}:${locale}`, async () =>
    applyLocaleAll(
      await prisma.faq.findMany({
        where: { scope: scope as 'GLOBAL' | 'PRODUCT' | 'B2B' },
        orderBy: { sortOrder: 'asc' },
      }),
      locale,
    ),
  );
  res.json(data);
});

publicRouter.get('/public/packages', async (req, res) => {
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.packages}active:${locale}`, async () =>
    applyLocaleAll(await prisma.b2bPackage.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }), locale),
  );
  res.json(data);
});

publicRouter.get('/public/testimonials', async (req, res) => {
  const scope = req.query.scope === 'B2B' ? 'B2B' : req.query.scope === 'B2C' ? 'B2C' : undefined;
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.settings}testimonials:${scope ?? 'all'}:${locale}`, async () =>
    applyLocaleAll(
      await prisma.testimonial.findMany({ where: { active: true, ...(scope ? { scope } : {}) }, orderBy: { id: 'desc' }, take: 12 }),
      locale,
    ),
  );
  res.json(data);
});

publicRouter.get('/public/settings', async (req, res) => {
  const locale = localeFromQuery(req.query.lang);
  const data = await withDefaultTtl(`${CACHE_NS.settings}public:${locale}`, () => getPublicSettings(locale));
  res.json(data);
});

publicRouter.get('/public/redirects', async (_req, res) => {
  const data = await withDefaultTtl(`${CACHE_NS.redirects}all`, () =>
    prisma.redirect.findMany({ select: { fromPath: true, toPath: true, statusCode: true } }),
  );
  res.json(data);
});
