import { fmtPrice } from '../templates/types';
import { ProductPage } from '../templates/shared/ProductPage';
import { api } from '../lib/api.server';
import type { Route } from './+types/product';

export async function loader({ params }: Route.LoaderArgs) {
  const product = await api.product(params.slug);
  if (!product) throw new Response('Not found', { status: 404 });
  const [testimonials, settings] = await Promise.all([
    api.testimonials('B2C').catch(() => []),
    api.settings(),
  ]);
  // Public origin for absolute OG/canonical URLs (FB/IG require absolute image URLs).
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return { product, testimonials, settings, siteUrl };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.product) return [{ title: 'Производ — filtervoda.mk' }];
  const p = data.product;
  const site = data.siteUrl ?? '';
  const price = p.showPrice ? fmtPrice(p.priceSale ?? p.priceRegular) : undefined;
  // Absolutize a path against the public origin (FB/IG ignore relative OG image URLs).
  const abs = (u?: string) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${site}${u}`);
  const ogImg = abs(p.ogImage?.url ?? p.image?.url ?? p.gallery?.[0]?.url);
  const canonical = site ? `${site}/proizvodi/${p.slug}` : undefined;
  return [
    { title: p.seoTitle ?? `${p.name} — filtervoda.mk` },
    { name: 'description', content: p.seoDescription ?? p.tagline ?? '' },
    ...(canonical ? [{ tagName: 'link', rel: 'canonical', href: canonical }] : []),
    { property: 'og:title', content: p.name },
    { property: 'og:description', content: p.tagline ?? '' },
    { property: 'og:type', content: 'product' },
    ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
    ...(ogImg ? [{ property: 'og:image', content: ogImg }] : []),
    ...(price ? [{ property: 'product:price:amount', content: String(p.priceSale ?? p.priceRegular) }] : []),
  ];
}

export default function Product({ loaderData }: Route.ComponentProps) {
  return <ProductPage product={loaderData.product} testimonials={loaderData.testimonials} settings={loaderData.settings} />;
}
