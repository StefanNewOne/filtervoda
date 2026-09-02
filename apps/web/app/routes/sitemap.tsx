import { api } from '../lib/api.server';

/** Dynamic sitemap.xml (PRD §11.2). Resource route — returns XML, no component. */
export async function loader() {
  const base = process.env.PUBLIC_SITE_URL ?? 'https://filtervoda.mk';
  const [products, posts] = await Promise.all([api.products().catch(() => []), api.posts().catch(() => [])]);

  const staticUrls = ['/', '/proizvodi', '/za-biznis', '/soveti', '/za-nas', '/kontakt', '/pravni/privatnost', '/pravni/kolacinja'];
  const urls = [
    ...staticUrls.map((u) => `${base}${u}`),
    ...products.map((p) => `${base}/proizvodi/${p.slug}`),
    ...posts.map((p) => `${base}/soveti/${p.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
}
