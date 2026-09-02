# ADR-001 — Public site rendering: React Router 7 framework mode (SSR)

- **Status:** Accepted
- **Date:** 2026-09-01
- **Refs:** PRD §12.3, CLAUDE.md (Technology Stack)

## Context

The storefront lives off Google search and FB/IG shares. It must ship full server-rendered
HTML: indexable without JS, per-product OG meta, JSON-LD, fast LCP on weak mobile and inside
FB/IG in-app browsers. The approved stack is a Vite + React SPA, which cannot do this alone.

## Options

| Option | Pro | Con |
| --- | --- | --- |
| **B — React Router 7 framework mode + `@react-router/express`** (chosen) | Zero new frameworks; same mental model as the admin SPA; `loader` data-fetch; prerender static routes; SSR + Redis cache for dynamic | Fewer batteries than Next (no built-in image/ISR — solved via StorageService + Redis) |
| A — Next.js | Most mature SEO framework | Second frontend framework in the ecosystem; deviates from the approved list |
| C — SPA + build-time prerender | No render server | Fragile, stale content, weak OG for dynamic routes |

## Decision

**Option B.** React Router 7 framework mode with SSR on Node/Express via `@react-router/node`
+ `@react-router/express`. Prerender static routes (Home, За нас, Контакт, legal) at build;
SSR-on-demand + Redis page cache (TTL 10 min, invalidated on publish) for products, catalogue,
posts. Rendered HTML always contains full content, meta, OG, canonical, JSON-LD; hydration
after load. SSR reads data from `api` over the internal docker network. The redirect map
(Прилог Ѓ) is applied at the Nginx/loader layer before routing.

## Consequences

Adds two approved-adjacent dependencies (`@react-router/node`, `@react-router/express`). Image
optimization and caching become our responsibility (StorageService variants + Redis) — already
planned.
