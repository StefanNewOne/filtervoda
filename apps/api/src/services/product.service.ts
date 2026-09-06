/**
 * Product read shaping — DB rows → public DTOs (@filtervoda/shared types). Only PUBLISHED,
 * non-deleted products are exposed. Media/variants resolved for the gallery and cards.
 */
import type { MediaDto, ProductCardDto, ProductDetailDto } from '@filtervoda/shared';
import type { Media, Product } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

function toMediaDto(m: Media | null | undefined, alt = ''): MediaDto | undefined {
  if (!m) return undefined;
  return {
    id: m.id,
    url: m.url,
    variants: Array.isArray(m.variants) ? (m.variants as unknown as MediaDto['variants']) : [],
    width: m.width ?? 0,
    height: m.height ?? 0,
    alt: alt || m.alt,
  };
}

function toCard(
  p: Product & { images?: { media: Media; alt: string; isPrimary: boolean }[]; category?: { slug: string } },
): ProductCardDto {
  const primary = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];
  const features = Array.isArray(p.features) ? (p.features as { text: string }[]) : [];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline ?? undefined,
    chips: features.slice(0, 3).map((f) => f.text),
    priceRegular: p.priceRegular ?? undefined,
    priceSale: p.priceSale ?? undefined,
    showPrice: p.showPrice,
    badges: p.badges,
    image: toMediaDto(primary?.media, primary?.alt),
    audience: p.audience,
    categorySlug: p.category?.slug,
  };
}

export async function listPublishedProducts(categorySlug?: string): Promise<ProductCardDto[]> {
  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: { images: { include: { media: true }, orderBy: { sortOrder: 'asc' } }, category: { select: { slug: true } } },
  });
  return products.map(toCard);
}

export async function getPublishedProduct(slug: string): Promise<ProductDetailDto | null> {
  const p = await prisma.product.findFirst({
    where: { slug, status: 'PUBLISHED', deletedAt: null },
    include: {
      category: true,
      images: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      specs: { orderBy: { sortOrder: 'asc' } },
      stages: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { sortOrder: 'asc' } },
      related: { include: { related: { include: { images: { include: { media: true } } } } } },
    },
  });
  if (!p) return null;

  // Product page shows product-specific FAQ first, then the shared GLOBAL FAQ (so generic
  // questions live once as GLOBAL instead of being duplicated onto every product).
  const globalFaqs = await prisma.faq.findMany({
    where: { tenantId: p.tenantId, scope: 'GLOBAL' },
    orderBy: { sortOrder: 'asc' },
  });

  const card = toCard(p);
  const features = Array.isArray(p.features) ? (p.features as { icon?: string; text: string }[]) : [];
  return {
    ...card,
    shortDescription: p.shortDescription ?? undefined,
    description: p.description ?? undefined,
    categorySlug: p.category.slug,
    idealFor: p.idealFor,
    features,
    includedInPrice: p.includedInPrice,
    maintenanceNote: p.maintenanceNote ?? undefined,
    warrantyYears: p.warrantyYears,
    gallery: p.images.map((i) => toMediaDto(i.media, i.alt)).filter((m): m is MediaDto => Boolean(m)),
    stages: p.stages.map((s) => ({ order: s.order, name: s.name, removes: s.removes, whyItMatters: s.whyItMatters, icon: s.icon ?? undefined })),
    specs: p.specs.map((s) => ({ group: s.group, label: s.label, value: s.value, unit: s.unit ?? undefined })),
    related: p.related.map((r) => toCard(r.related)),
    faqs: [...p.faqs, ...globalFaqs].map((f) => ({ question: f.question, answer: f.answer })),
    seoTitle: p.seoTitle ?? undefined,
    seoDescription: p.seoDescription ?? undefined,
  };
}
