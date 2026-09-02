import type { Config } from '@react-router/dev/config';

/** Admin is a client-only SPA (PRD §9.3) served behind /admin/. No SSR, no SEO. */
export default {
  ssr: false,
  basename: '/admin/',
} satisfies Config;
