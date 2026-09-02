/**
 * Server-side API client for SSR loaders. Talks to the API over the internal docker network
 * (INTERNAL_API_URL) — no public hop. Never import this into client code.
 */
import type {
  B2bPackageDto,
  ProductCardDto,
  ProductDetailDto,
  PublicSettings,
} from '@filtervoda/shared';

const BASE = process.env.INTERNAL_API_URL ?? 'http://api:3001';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Response('API error', { status: res.status });
  return (await res.json()) as T;
}

async function getOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}/api/v1${path}`, { headers: { Accept: 'application/json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Response('API error', { status: res.status });
  return (await res.json()) as T;
}

export const api = {
  settings: () => get<PublicSettings>('/public/settings'),
  products: (category?: string) =>
    get<ProductCardDto[]>(`/public/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  product: (slug: string) => getOrNull<ProductDetailDto>(`/public/products/${slug}`),
  categories: () => get<{ id: number; slug: string; name: string }[]>('/public/categories'),
  posts: () => get<{ slug: string; title: string; excerpt?: string; publishedAt?: string }[]>('/public/posts'),
  post: (slug: string) => getOrNull<{ slug: string; title: string; content?: { html?: string } | null }>(`/public/posts/${slug}`),
  faq: (scope: 'GLOBAL' | 'PRODUCT' | 'B2B') => get<{ question: string; answer: string }[]>(`/public/faq?scope=${scope}`),
  packages: () => get<B2bPackageDto[]>('/public/packages'),
  testimonials: (scope?: 'B2C' | 'B2B') =>
    get<{ id: string; name: string; company?: string; city?: string; text: string; rating: number }[]>(
      `/public/testimonials${scope ? `?scope=${scope}` : ''}`,
    ),
  redirects: () => get<{ fromPath: string; toPath: string; statusCode: number }[]>('/public/redirects'),
};
