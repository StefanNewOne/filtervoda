# FV-000 — Implementation Plan (master) · filtervoda.mk

Status: **DRAFT — awaiting developer approval**
Owner: Claude Code
Refs: `CLAUDE.md`, PRD v1.1, Design Brief, `filtervoda-handoff/`
Date: 2026-09-01

This is the master plan. Each numbered milestone gets its own detailed `_docs/plans/FV-<N>-*.md`
before its implementation starts (Written Plan Rule).

---

## Guiding constraints (from CLAUDE.md / PRD)

- Single conversion = **lead** (no cart, no payment). B2C + B2B tracks.
- Stack: React 19 + Vite 6 + React Router 7 (web SSR / admin SPA) · Express 5 + Prisma 6 ·
  PostgreSQL 16 · Redis 7 · transactional outbox + node-cron · Nginx + Certbot · MinIO/Cloudinary.
- Design **identical to the handoff folder**; tokens are the source of truth.
- **3 templates, single active**, switchable from admin „Дизајн и темплејти".
- Multi-tenant (`tenantId`), audit every mutation, PII hashing, rate limit everywhere.

---

## Milestone 0 — Foundations & Prep (ADRs, scaffold, tokens)

**0.1 ADRs** — write `_docs/architecture/adr/ADR-001..005` (SSR = RR7 framework mode; jobs =
outbox+node-cron; media = Cloudinary; staging = subdomain; CSRF policy). Plus
`system-overview.md` (with retention table) and `old-site-reference.md`.

**0.2 Monorepo scaffold** — npm workspaces `apps/{web,admin,api}`, `packages/shared`, `e2e/`.
Root config: TypeScript (strict), ESLint, Prettier, Husky + commitlint + lint-staged +
commitizen + gitleaks, `commitlint.config.js` (scopes from CLAUDE.md), `.env.example`,
`.gitignore`.

**0.3 Docker Compose (local)** — nginx, web, admin, api, postgres:16, redis:7, minio, mailhog;
`nginx/local.conf`; healthchecks. `docker compose up` boots the whole stack behind Nginx.

**0.4 Design system extraction** — distil `filtervoda-handoff/` into
`_docs/design/frontend-web/`: `FilterVoda_Design_Prompt.md`, `handoff/tokens.css` (Tailwind 4
`@theme`, the 3 templates' token sets from `themeDefs`), `components.md`, `screens/*.spec.md`,
`emails/*`, `og-image.spec.md`. Self-hosted woff2 fonts (Unbounded, Manrope, Oswald, Onest,
JetBrains Mono) with Cyrillic subset.

**Exit:** stack boots; ADRs approved; tokens.css + Design Prompt reviewed.

---

## Milestone 1 — Shared package & data model

**1.1 `packages/shared`** — `types.ts`, `schemas.ts` (Zod, single source), `constants.ts`
(named constants), `phone.ts` (MK → E.164 + tests).

**1.2 Prisma schema** — all entities from PRD §12.6 (Tenant, Product, ProductCategory,
ProductSpec, ProductStage, ProductImage, RelatedProduct, Faq, B2bPackage, Testimonial,
ClientLogo, Post, PostCategory, Lead, LeadNote, LeadEvent, OutboxJob, AuditLog, User, Session,
PasswordResetToken, Setting, Redirect, Media). `tenantId` everywhere; retention comments;
up+down migrations. Prisma client extension for the tenant predicate (+ guard test).

**1.3 Seed** — `scripts/seed.ts`: tenant SPAR, 17 products (Прилог А), 5 categories, demo
leads, users (ADMIN/EDITOR/CLIENT_VIEWER), settings incl. `design.activeTemplate=b1` and the 3
templates' default tokens, redirect map (Прилог Ѓ).

**Exit:** `prisma migrate dev` + seed run clean; tenant-predicate test passes.

---

## Milestone 2 — API core (Express 5)

**2.1 App skeleton** — Express 5, Pino + correlationId middleware, Zod env validation at
startup, helmet, express-rate-limit + Redis store, error handler (generic client errors),
health endpoint, OpenAPI/Swagger at `/api/docs`.

**2.2 Auth** — express-session + connect-pg-simple, bcryptjs, login/logout/me/reauth,
password reset, IP+account rate limit with backoff, role middleware, CSRF (`csrf-csrf`) for
admin writes. Tests first (Category 6 priority #3).

**2.3 Public read routes** (Redis-cached) — products, product by slug, posts, faq, packages,
public settings, redirects, preview token.

**2.4 Lead endpoint** — `POST /api/v1/leads`: Zod validation, phone normalize, honeypot,
Turnstile verify, Origin allowlist, rate limit, duplicate flag, **transaction** Lead +
LeadEvent + OutboxJob(s) + AuditLog. Tests first (priority #1).

**2.5 Outbox processor + cron** — node-cron `*/30s` + setImmediate kick, `FOR UPDATE SKIP
LOCKED`, backoff, DEAD; jobs: email (nodemailer), Meta CAPI (hashed PII, event_id dedup),
webhook, Telegram. Cron HTTP triggers with `CRON_SECRET` + `?test=1`. Tests first (priority #2).

**2.6 Admin CRUD routes** — products/specs/stages/images, categories, faqs, packages,
testimonials, logos, posts, media, redirects, settings, users; leads list/detail/patch/notes/
anonymize/export; outbox list/retry; audit; stats; cache invalidate. AuditLog on every
mutation; AuthZ in every controller.

**Exit:** API green; coverage ≥ 70%; Swagger complete.

---

## Milestone 3 — Storefront (apps/web, SSR)

Build screen-by-screen from `screens/*.spec.md`, each with default/loading/empty/error/success
states, exactly per handoff:

**3.1 Shell** — RR7 framework mode + `@react-router/express`, Tailwind 4 tokens, **template
provider** (reads `design.activeTemplate` + token overrides, applies the theme), header,
footer, mobile sticky bar, global lead modal (Zustand), consent banner (Consent Mode v2),
GTM/Pixel loader after consent.

**3.2 Pages** — Home · Catalogue (category tabs + comparison table) · **Product** (gallery,
chips, price/badges, ideal-for, benefits, 6-stage stepper, spec table, included, maintenance,
comparison, FAQ, inline form; JSON-LD + OG) · **За фирми** (hero → problem → solution →
**calculator** → steps → packages → devices → industries → comparison → FAQ → B2B form) ·
Совети list + post · За нас · Контакт · Благодариме · legal · 404.

**3.3 SEO/perf** — per-page meta, canonical, OG, sitemap/robots, JSON-LD; AVIF/WebP
`<picture>`, preload hero, font preload; redirect map at Nginx/loader level; Redis page cache
with publish invalidation.

**Exit:** Lighthouse mobile ≥ 90, LCP < 2.5s; product HTML has title/OG/JSON-LD/price without
JS; in-app-browser check.

---

## Milestone 4 — Admin (apps/admin, SPA)

Build module-by-module from the admin handoff, accent colour per module:

**4.1 Shell** — RR7 SPA, auth guard, layout/sidebar, TanStack Query, re-auth dialog, toasts,
tables (sort/filter/pagination), Radix primitives.

**4.2 Modules** — Dashboard (recharts) · Lead-ови (list + detail with timeline/notes/status/
call/Viber/anonymize + CSV/XLSX export) · Производи (list + tabbed editor) · Категории ·
Страници и копи · Совети (TipTap) · ЧПП · За фирми · Искуства · Навигација и футер ·
**Дизајн и темплејти** (3-template single-active + token editor + AA contrast + export +
publish/purge) · Медиуми (upload, alt, replace, variants) · Tracking · SEO · Редирекции (CSV
import) · Поставки (feature flags) · Корисници · Проблеми со испорака (outbox retry) · Audit.

**Exit:** create product → publish → public updated; template swap changes the site;
CLIENT_VIEWER sees only leads; coverage ≥ 60%.

---

## Milestone 5 — E2E, hardening, deploy

**5.1 Playwright** — B2C lead → thank-you · B2B calculator → form · admin create/publish ·
CLIENT_VIEWER isolation · template swap · redirects data-driven.

**5.2 Tracking QA** — Meta Test Events dedup, GA4 DebugView, consent gating.

**5.3 Deploy** — `docker-compose.prod.yml`, `nginx/{staging,production}.conf`, `scripts/
deploy.sh` (backup → reset → build → migrate → health → rollback), `backup.sh`,
`redirect-check.sh`; `_docs/deployment/{local,staging,production}.md` with HTTPS/Certbot +
runbook. Staging verified before production.

**Exit:** all Acceptance Criteria in CLAUDE.md met on staging.

---

## Suggested execution order

0 → 1 → 2 (auth, lead, outbox first) → 3 → 4 → 5. Frontend milestones can start the shell once
tokens (0.4) land, in parallel with API CRUD (2.6). Each milestone = its own Jira epic + PRs.

## Open decisions blocking start

ADR approvals (M0.1), Turnstile keys, media driver, hosting, final palette/logo, prices/specs.
None block scaffolding (M0.2–0.4) or the data model (M1); the lead form needs Turnstile keys
only for live verification (dev bypass flag until then).
