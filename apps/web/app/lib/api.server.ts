/**
 * Server-side API client for SSR loaders. Talks to the API over the internal docker network
 * (INTERNAL_API_URL) — no public hop. Never import this into client code.
 *
 * i18n (FV-001 M2): content methods take a `locale` and forward it as `?lang=` so the API
 * returns already-localized rows. `mk` (default) is sent without a lang param.
 */
import type {
  B2bPackageDto,
  Locale,
  ProductCardDto,
  ProductDetailDto,
  PublicSettings,
} from '@filtervoda/shared';
import { DEFAULT_LOCALE } from '@filtervoda/shared';

const BASE = process.env.INTERNAL_API_URL ?? 'http://api:3001';
const TIMEOUT_MS = 4000;

/** Headers for trusted internal SSR calls: identify as internal to bypass the read rate limiter. */
function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (process.env.INTERNAL_API_SECRET) h['X-Internal-Secret'] = process.env.INTERNAL_API_SECRET;
  return h;
}

/** Append `lang` to a path (skips the default MK). Handles paths that already have a query. */
function withLang(path: string, locale?: Locale): string {
  if (!locale || locale === DEFAULT_LOCALE) return path;
  return `${path}${path.includes('?') ? '&' : '?'}lang=${locale}`;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, { headers: headers(), signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Response('API error', { status: res.status });
  return (await res.json()) as T;
}

async function getOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}/api/v1${path}`, { headers: headers(), signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Response('API error', { status: res.status });
  return (await res.json()) as T;
}

export const api = {
  settings: (locale?: Locale) => get<PublicSettings>(withLang('/public/settings', locale)),
  products: (category?: string, locale?: Locale) =>
    get<ProductCardDto[]>(withLang(`/public/products${category ? `?category=${encodeURIComponent(category)}` : ''}`, locale)),
  featuredProducts: (locale?: Locale) => get<ProductCardDto[]>(withLang('/public/products/featured', locale)),
  product: (slug: string, locale?: Locale) => getOrNull<ProductDetailDto>(withLang(`/public/products/${slug}`, locale)),
  categories: (locale?: Locale) => get<{ id: number; slug: string; name: string }[]>(withLang('/public/categories', locale)),
  posts: (locale?: Locale) =>
    get<{ slug: string; title: string; excerpt?: string; coverUrl?: string | null; publishedAt?: string }[]>(withLang('/public/posts', locale)),
  post: (slug: string, locale?: Locale) =>
    getOrNull<{ slug: string; title: string; content?: { html?: string } | null; coverUrl?: string | null }>(withLang(`/public/posts/${slug}`, locale)),
  faq: (scope: 'GLOBAL' | 'PRODUCT' | 'B2B', locale?: Locale) =>
    get<{ question: string; answer: string }[]>(withLang(`/public/faq?scope=${scope}`, locale)),
  packages: (locale?: Locale) => get<B2bPackageDto[]>(withLang('/public/packages', locale)),
  testimonials: (scope?: 'B2C' | 'B2B', locale?: Locale) =>
    get<{ id: string; name: string; company?: string; city?: string; text: string; rating: number; productId?: string | null }[]>(
      withLang(`/public/testimonials${scope ? `?scope=${scope}` : ''}`, locale),
    ),
  redirects: () => get<{ fromPath: string; toPath: string; statusCode: number }[]>('/public/redirects'),
};
