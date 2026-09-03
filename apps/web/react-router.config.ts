import type { Config } from '@react-router/dev/config';

/**
 * SSR framework mode (ADR-001). All routes are SSR-on-demand + Redis-cached at the API layer.
 * Prerendering is intentionally disabled: every route runs the root loader which reads the
 * active template + settings from the API, so there is no build-time data source — the Redis
 * full-page cache provides the equivalent performance for the otherwise-static pages.
 */
export default {
  ssr: true,
} satisfies Config;
