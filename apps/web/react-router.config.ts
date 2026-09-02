import type { Config } from '@react-router/dev/config';

/**
 * SSR framework mode (ADR-001). Static routes are prerendered at build; dynamic routes
 * (products, catalogue, posts) are SSR-on-demand + Redis-cached at the API layer.
 */
export default {
  ssr: true,
  prerender: ['/za-nas', '/kontakt', '/pravni/privatnost', '/pravni/kolacinja'],
} satisfies Config;
