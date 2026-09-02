import { fmtPrice } from '../templates/types';
import { ProductPage } from '../templates/shared/ProductPage';
import { api } from '../lib/api.server';
import type { Route } from './+types/product';

export async function loader({ params }: Route.LoaderArgs) {
  const product = await api.product(params.slug);
  if (!product) throw new Response('Not found', { status: 404 });
  return { product };
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
    ...(p.ogImage ? [{ property: 'og:image', content: p.ogImage.url }] : []),
    ...(price ? [{ property: 'product:price:amount', content: String(p.priceSale ?? p.priceRegular) }] : []),
  ];
}

export default function Product({ loaderData }: Route.ComponentProps) {
  return <ProductPage product={loaderData.product} />;
}
