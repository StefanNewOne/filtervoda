import { fmtPrice } from '../templates/types';
import { ProductPage } from '../templates/shared/ProductPage';
import { stripLocale } from '../i18n/paths';
import { api } from '../lib/api.server';
import { localeMeta } from '../lib/meta';
import type { Route } from './+types/product';

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = stripLocale(new URL(request.url).pathname).locale;
  const product = await api.product(params.slug, locale);
  if (!product) throw new Response('Not found', { status: 404 });
  const [testimonials, settings] = await Promise.all([
    api.testimonials('B2C', locale).catch(() => []),
    api.settings(locale),
  ]);
  // Public origin for absolute OG/canonical URLs (FB/IG require absolute image URLs).
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return { product, testimonials, settings, siteUrl };
}

export function meta({ data, location }: Route.MetaArgs) {
  const locale = stripLocale(location.pathname).locale;
  if (!data?.product) return [{ title: 'filtervoda.mk' }];
  const p = data.product;
  const site = data.siteUrl ?? '';
  const price = p.showPrice ? fmtPrice(p.priceSale ?? p.priceRegular) : undefined;
  // Absolutize a path against the public origin (FB/IG ignore relative OG image URLs).
  const abs = (u?: string) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${site}${u}`);
  return [
    ...localeMeta({
      locale,
      siteUrl: site,
      path: `/proizvodi/${p.slug}`,
      title: p.seoTitle ?? `${p.name} — filtervoda.mk`,
      description: p.seoDescription ?? p.tagline ?? '',
      ogType: 'product',
      image: abs(p.ogImage?.url ?? p.image?.url ?? p.gallery?.[0]?.url),
    }),
    ...(price ? [{ property: 'product:price:amount', content: String(p.priceSale ?? p.priceRegular) }] : []),
  ];
}

export default function Product({ loaderData }: Route.ComponentProps) {
  return <ProductPage product={loaderData.product} testimonials={loaderData.testimonials} settings={loaderData.settings} siteUrl={loaderData.siteUrl} />;
}
