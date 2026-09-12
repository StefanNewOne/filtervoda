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
  return { product, testimonials, settings };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.product) return [{ title: 'Производ — filtervoda.mk' }];
  const p = data.product;
  const price = p.showPrice ? fmtPrice(p.priceSale ?? p.priceRegular) : undefined;
  return [
    { title: p.seoTitle ?? `${p.name} — filtervoda.mk` },
    { name: 'description', content: p.seoDescription ?? p.tagline ?? '' },
    { property: 'og:title', content: p.name },
    { property: 'og:description', content: p.tagline ?? '' },
    { property: 'og:type', content: 'product' },
    // OG image for FB/IG shares: dedicated ogImage, else the primary product photo.
    ...(() => {
      const og = p.ogImage?.url ?? p.image?.url ?? p.gallery?.[0]?.url;
      return og ? [{ property: 'og:image', content: og }] : [];
    })(),
    ...(price ? [{ property: 'product:price:amount', content: String(p.priceSale ?? p.priceRegular) }] : []),
  ];
}

export default function Product({ loaderData }: Route.ComponentProps) {
  return <ProductPage product={loaderData.product} testimonials={loaderData.testimonials} settings={loaderData.settings} />;
}
