# AGENTS.md — filtervoda.mk system entry point

Read this first. It's the single map of **what exists, where it lives, how to run/test/deploy,
and the gotchas we hit**. Deep detail lives in the linked docs. The binding rules are in
[`CLAUDE.md`](CLAUDE.md) (project constitution) — this file never overrides it.

Last updated: 2026-09-12.

---

## 1. What this is

**filtervoda.mk** — mobile-first, lead-generation marketing site for **SPAR Company** (Skopje):
water-filtration systems with free installation across Macedonia. **Not a shop** — no cart, no
online payment. The single conversion is a **lead** (form / call / Viber). Two tracks: **B2C**
(product catalogue) and **B2B** (`За фирми` page with a savings calculator). Customer-facing
copy is **Macedonian Cyrillic**; UI strings via `mk.json` (EN/SQ prepared for Phase 2).

Traffic is ~80–90% mobile, largely from Meta (FB/IG) ads and in-app browsers → SSR, per-product
OG, fast LCP and **no horizontal overflow on mobile** are hard requirements.

---

## 2. Current live state (as of last update)

| | |
| --- | --- |
| **Preview URL** | `https://135.181.156.104.sslip.io` (valid TLS, no DNS needed) |
| **Storefront** | `/` · **Admin** `/admin/` · **API** `/api/v1/` |
| **VPS** | Hetzner `135.181.156.104` (SSH `root`), code at `/srv/filtervoda` |
| **Reverse proxy (prod)** | **Caddy** (auto-TLS), `infra/Caddyfile.production` |
| **Domain** | `filtervoda.mk` **not yet bound** — ready; see `_docs/deployment/go-live-filtervoda-mk.md` |
| **Git branches** | `main` = `develop` = `feature/FV-admin-friendly-cms` (all synced) |
| **Seed/dev logins** | `admin@filtervoda.mk / admin12345` · `editor@… / editor12345` · `client@… / client12345` — **must be changed before real launch** |

> ⚠️ The docs `system-overview.md` and `handover-checklist.md` say “Nginx (Certbot)”. That
> describes the **local** compose proxy. **Production actually runs Caddy** (see
> `docker-compose.prod.yml` + `infra/Caddyfile.production`). Trust this file + those two files.

---

## 3. Repo map

```
apps/
  web/     React Router 7 SSR storefront (Node). server.js = Express + Redis page cache.
           app/routes/*          public pages (home, catalog, product, b2b, blog, about,
                                  contact, thank-you, legal, sitemap, not-found=301 map)
           app/templates/{b1,b2,b3}/  the 3 selectable themes (single-active)
           app/templates/shared/      ProductPage, B2bPage, HomeSections (theme-agnostic)
           app/components/            LeadForm, LeadModal, StickyBar, ConsentBanner, ...
           app/lib/api.server.ts      SSR → internal API client (adds siteUrl for OG)
           public/img/products/       product photos (primary + *-alt secondary)
  admin/   React Router 7 SPA (served static behind /admin/). Custom CMS.
           app/modules.ts             sidebar modules + role gating
           app/routes/*               dashboard, leads, lead-detail, product-editor, categories,
                                      content (Страници и копи), posts, faq, b2b, testimonials,
                                      nav, templates, media, tracking, seo, redirects, settings,
                                      users, outbox, audit
           app/components/            SaveBar, RowsEditor, MediaPicker, SettingsGroup, GenericCrud, ui
           app/lib/useSaveState.ts    shared save-status hook
  api/     Express 5 + Prisma 6. src/routes/{public,leads.public,admin/*,auth,cron}.
           prisma/schema.prisma       DB source of truth
           prisma/seed.ts             products + content + images + FAQ + users (idempotent)
           prisma/set-content-defaults.ts  create-if-absent editable content keys
packages/shared/src/  schemas.ts (Zod, single source) · types.ts · constants.ts · phone.ts
e2e/       Playwright: lead-flow, b2b-and-admin, responsive (desktop + mobile projects)
_docs/     architecture (ADRs, system-overview), deployment, plans, design handoff
```

---

## 4. Stack

React 19 · TypeScript 5 (strict) · Vite 6 · React Router 7 (web SSR, admin SPA) · TailwindCSS 4
(`@theme` tokens) · Radix · TanStack Query 5 · react-hook-form + Zod 3 · Express 5 · Prisma 6 ·
PostgreSQL 16 · Redis 7 · node-cron + transactional outbox · Caddy (prod) / Nginx (local) ·
MinIO/Mailhog (local). Rationale in `_docs/architecture/adr/`.

---

## 5. Run locally

```bash
docker compose up          # whole stack behind Nginx on http://localhost
```
Services: nginx · web · admin · api · postgres · redis · minio · mailhog. Dev mode = volume
mounts + hot reload (edits apply without rebuild). Mail lands in Mailhog (`http://localhost:8125`).

```bash
# Seed / refresh data (idempotent):
docker compose exec api npm run seed --workspace apps/api
docker compose exec api sh -c "cd apps/api && npx tsx prisma/set-content-defaults.ts"
# After any content/product/settings change, purge the storefront cache:
docker compose exec redis redis-cli FLUSHALL
```
Local logins = the seed logins in §2. Admin at `http://localhost/admin/`.

---

## 6. Test

```bash
# Per workspace (from repo root or the workspace dir):
(cd packages/shared && npx vitest run)       # 16 tests
(cd apps/api && npx vitest run)              # 12 unit (integration skipped by default)
docker compose exec -e INTEGRATION=1 api sh -c "cd apps/api && npx vitest run src/services/__tests__"  # lead txn, auth
(cd apps/web && npx vitest run)              # 7
(cd apps/admin && npm run test)              # contrast
# E2E (needs the local stack up). Serialize to avoid the login/lead rate-limiter tripping:
(cd e2e && npx playwright test --workers=1)  # desktop + mobile; lead-flow, b2b, admin, responsive
# Typecheck everything:
npm run typecheck   # (or per app: cd apps/web && npm run typecheck)
```
Note: `apps/api` typecheck needs a generated Prisma client on the host — run
`(cd apps/api && npx prisma generate)` after schema changes.

---

## 7. Deploy

**One command from the trusted machine** (packs `git archive HEAD`, ships to VPS, builds,
migrates, conditional-seeds, health-checks):
```bash
bash scripts/deploy-vps.sh          # deploys current committed HEAD to the VPS
```
Requires `.env.production` (gitignored, deploy-machine only) with `VPS_IP`, `DEPLOY_SSH_USER`,
`DEPLOY_SSH_PRIVATE_KEY`, `SITE_DOMAIN`, and the app secrets.

Key behaviours to know:
- **Seed runs ONLY when the DB is empty** (`Product` count = 0) — a redeploy never overwrites
  admin edits. To apply new seed content to a non-empty DB you must run seed manually
  (`docker compose … exec api npx tsx apps/api/prisma/seed.ts`) and then FLUSH Redis.
- **Migrations** auto-run (`prisma migrate deploy`). New migrations live in `apps/api/prisma/migrations/`.
- The older `scripts/deploy.sh {staging|production}` is the git-pull-on-VPS variant referenced in
  CLAUDE.md; the **active** deployer today is `deploy-vps.sh`.

Git flow (CLAUDE.md Cat 1): `feature/FV-*` → `develop` (staging) → `main` (release). No direct
commits to `main`/`develop`. Conventional Commits; scopes in `commitlint.config.js`.

Go-live for `filtervoda.mk`: **DNS A records first**, then swap the domain block in
`.env.production` and redeploy. Full runbook: `_docs/deployment/go-live-filtervoda-mk.md`.

---

## 8. How the admin CMS works (what the client edits)

Custom lightweight CMS at `/admin/`. Roles: **ADMIN** (all) · **EDITOR** (content/media/leads) ·
**CLIENT_VIEWER** (leads + dashboard only — a test proves it touches no content route).

- **Dashboard** — live lead landing: KPI today/7/30 (+Δ), 10 most-recent leads (with Повикај),
  by status/source/type, a delivery-problems badge (DEAD outbox). Data: `GET /api/v1/admin/leads/overview`.
- **Lead-ови / lead detail** — filters, search, CSV export (UTF-8 BOM), inline status change,
  notes, timeline, anonymize (fresh re-auth). Status: NEW→CONTACTED→OFFER_SENT→WON→INSTALLED / LOST / SPAM.
- **Производи** — one scrollable editor (no tabs): Основно · Цена и беџови · Придобивки ·
  **Како функционира** (stages) · Спецификација · Галерија · Поврзани · ЧПП · **Искуства**
  (per-product testimonial selection) · SEO. One sticky “Зачувај сè” + “Прегледај на сајт”.
  `chips` (short tags) drive the compare tables; `features` are the long benefit bullets.
- **Категории** — name, slug, description, image, order.
- **Страници и копи** — the entire home page: hero (image, badge, H1/H2, CTA, chips), Зошто
  cards, stages, B2B teaser (image+bullets), testimonials/articles titles, advisor, thank-you.
  Stored as `content.*` Setting keys → `getPublicSettings().content` → the 3 templates read them
  with the shipped constants as fallback (nothing breaks when empty).
- **За фирми** — structured editor (RowsEditor, not `a|b|c` textareas): hero (+image), logos,
  problems, included, calculator params, steps, packages, industries, comparison table, FAQ/form
  copy. All `b2b.*` Setting keys.
- **Совети** (TipTap posts, + cover image) · **ЧПП** (scope GLOBAL/PRODUCT/B2B) · **Искуства**
  (B2C shows on home + product; B2B on За фирми) · **Дизајн и темплејти** (single-active theme
  swap + per-template token editing) · Медиуми · Tracking · SEO · Редирекции · Напредни поставки
  · Корисници · Проблеми со испорака (outbox retry) · Audit лог.

**Publish/edit → AuditLog row + Redis cache purge** so the storefront reflects changes in ~<1 min.

---

## 9. Core flows & non-obvious mechanics

- **Lead intake** (`POST /api/v1/leads`, `apps/api/src/routes/leads.public.ts`): Origin
  allowlist (from `PUBLIC_SITE_URL`) → honeypot → Turnstile → rate limit (5/10min, 20/24h per IP)
  → Zod (`leadSubmissionSchema`, discriminated on `type`) → **one transaction**: `Lead` +
  `LeadEvent(CREATED)` + `OutboxJob`(s) + `AuditLog`, then a `setImmediate` outbox kick. No email/
  CAPI/webhook in the request path.
- **Outbox processor** (node-cron 30s + kick): `SELECT … FOR UPDATE SKIP LOCKED`, backoff
  1m→5m→15m→1h→6h, `DEAD` after max attempts → visible in admin “Проблеми со испорака”.
- **Templates**: exactly one active (`Setting design.activeTemplate`), served to all visitors;
  swap in admin + publish purges the page cache. All 3 share content/routes — only tokens/layout differ.
- **Tracking**: nothing fires before consent (Consent Mode v2). Each key event fires twice —
  browser Pixel + server CAPI — with the **same `event_id`** (the lead id) so Meta dedupes.
- **Page cache** (`apps/web/server.js`): full-HTML Redis cache keyed by pathname only (utm/fbclid
  don't change HTML); purged by the API on publish.

---

## 10. Gotchas we already hit (don't reintroduce)

- **Legacy 301s must keep the query string** — `not-found.tsx` redirects with `url.search` so
  `?fbclid/utm_*` survive (Meta attribution). Applied at the catch-all route.
- **Product OG image must be absolute** — built from `PUBLIC_SITE_URL` in `product.tsx` meta
  (FB/IG ignore relative image URLs). Also emits `og:url` + canonical.
- **Mobile no-overflow** — `html, body { overflow-x: hidden }` guard in `app.css`, plus the b1
  sticky bar uses `grid-cols-3 + min-w-0` and the consent banner is inset. E2E `responsive.spec.ts`
  guards all key pages at 390px. Measure overflow **before** any `fullPage` screenshot (it
  transiently widens the viewport).
- **B2B lead city is optional** — company is the required identifier; a required `city` made the
  compact modal (no city field) 422 on every submit (`Барањето не помина`).
- **Generic product FAQ lives once as GLOBAL**, never per-product (an old seed created 68
  duplicate rows). `seed.ts` defensively deletes those legacy PRODUCT questions.
- **E2E flakiness** = the login/lead **rate-limiter** tripping across repeated runs. `FLUSHALL`
  Redis and use `--workers=1`. Don't “fix” it by weakening limits.
- **Seed = replace-all for product specs/stages** — safe on a fresh DB; on a populated prod it
  overwrites admin edits, hence the empty-DB guard in the deployer.

---

## 11. Content model note (products)

Per-product content was rewritten from the legacy site into `PRODUCT_CONTENT` in `seed.ts`
(benefits/stages/specs/idealFor/seoDescription). **Only real facts** — specs the old site never
stated are omitted, to be filled by the client in admin (never shown as `[потврди]` publicly).
Extraction + open questions: `_docs/plans/product-content-draft.md`.

---

## 12. Before real production launch (open items)

Config, not code (see `_docs/deployment/go-live-filtervoda-mk.md` + `handover-checklist.md`):
1. Bind `filtervoda.mk` DNS → deploy the domain env block.
2. Change the seed/dev admin passwords.
3. Real SMTP + `NOTIFY_EMAILS`, Cloudflare Turnstile keys, Meta CAPI token, GA4/GTM ids;
   verify Meta Test Events dedup + GA4 DebugView.
4. Fill the `[потврди]` product specs via admin.
5. Enable `backup.sh` cron + one restore test.

---

## 13. Where to go deeper

- [`CLAUDE.md`](CLAUDE.md) — the binding rules (git, security, testing, design protocol). **Wins on conflict.**
- `_docs/architecture/system-overview.md` — topology + retention (note the Nginx→Caddy caveat above).
- `_docs/architecture/adr/` — ADR-001 SSR · 002 outbox · 003 media · 004 staging · 005 public-lead CSRF.
- `_docs/deployment/` — `local.md`, `production.md`, `go-live-filtervoda-mk.md`, `handover-checklist.md`.
- `_docs/plans/` — `FV-000-implementation-plan.md`, `FV-admin-friendly-cms.md`, `product-content-draft.md`.
- `_docs/design/frontend-web/` — design system + handoff (tokens.css is the single design source; **never edit handoff files**).
- `PRD-filtervoda-mk-v1.1.md` — product requirements (wins on scope/stack values).
