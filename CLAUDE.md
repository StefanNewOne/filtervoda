# CLAUDE.md — filtervoda.mk (SPAR Company)

This file is the living constitution of this repository. Claude Code reads it automatically
on every session. All rules defined here are non-negotiable unless the developer explicitly
overrides one for a specific task. It is adapted from the GoDigital Agency OS constitution
(`CLAUDE-godigital.md`) and mirrors the sister project `CLAUDE-potencijashop.md` — the same
engineering standard, infrastructure, and conventions, retargeted to this project and
reconciled with **PRD v1.1** (which wins on any conflict about project scope, stack values,
and data model).

---

## What This Repository Is

**filtervoda.mk** is a **mobile-first, lead-generation marketing website** for **SPAR
Company** (Skopje) — sale and **free installation** of water-filtration systems across all of
Macedonia: under-sink reverse-osmosis + remineralization systems (SPAR Crystal Digital 600HF,
Crystal Smart, Crystal Pro, Aqua Smart, Aqua Glass, Aqua Pro, Aqua Minerals), hot/cold water
dispensers, whole-home filtration (Big Blue), anti-limescale, accessories and meters (pH, TDS).

It is **not** an online shop. There is **no cart and no online payment**. The **single
conversion is a lead** — a contact request, a phone call, or a Viber message. Two tracks:

1. **B2C** — product catalogue with full specifications written for an ordinary Macedonian
   reader, optimized for visitors arriving from **Meta ads (Facebook/Instagram)** on mobile,
   often inside in-app browsers (~80–90% mobile traffic).
2. **B2B** — a `За фирми` landing page that convinces business owners to **rent a dispenser
   from SPAR** instead of buying and carrying water bottles, anchored by a **savings
   calculator**.

Two applications ship from one monorepo:

1. **Storefront** — public site (`filtervoda.mk`). Home, Catalogue, Product, За фирми (B2B),
   Совети (blog), За нас, Контакт, Благодариме (thank-you), legal pages, 404, cookie banner,
   global lead modal, mobile sticky bar.
2. **Admin panel (CMS)** — protected app at `/admin`. Modules: dashboard, leads, products,
   categories, pages & copy, посты (Совети), FAQ, За фирми (B2B), testimonials, navigation &
   footer, **design & templates**, media, tracking & integrations, SEO, redirects, settings,
   users, delivery problems (outbox), audit log. The SPAR team runs everything without a
   developer.

Everything customer-facing is in **Macedonian Cyrillic** at launch. All UI strings live in a
dictionary (`mk.json`); routing is prepared for **`/sq` and `/en` in Phase 2**. Currency is
**MKD**, formatted `36.000 ден.`; dates `dd.mm.yyyy`; timezone `Europe/Skopje`.

### Source documents (read before building)

| Document                | Location                                                      | Authority                                                    |
| ----------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| **PRD v1.1**            | `PRD-filtervoda-mk-v1.1.md`                                   | **Current product requirements — wins on conflict**          |
| Design Brief            | `Design-Brief-filtervoda-Claude-Design (1).md`               | Design system scope, tokens, copy bank, screen inventory     |
| Design handoff (proto)  | `filtervoda-handoff/**/*.dc.html`                            | Storefront + admin visual reference (3 templates + admin)    |
| Sister constitution     | `CLAUDE-potencijashop.md`                                     | Rule template this file is modelled on                       |
| Product inventory       | PRD Прилог А (17 products)                                    | Seed data source of truth                                    |
| Events plan             | PRD Прилог Д                                                  | GTM → GA4 + Meta Pixel/CAPI event map                        |
| Redirect map            | PRD Прилог Ѓ                                                  | 301 map skeleton for legacy WordPress URLs                   |

The `.dc.html` prototypes are **design references, not production code**. Their `support.js`
runtime is a prototyping tool — **do not port it**. Recreate the designs pixel-accurately in
the target stack. The `help-layer.js` explanation layer is prototype-only — **do not build
it**. **The design must be reproduced identically to the handoff folder** (developer's
explicit requirement) — never improvise layout, spacing, or colour beyond what tokens allow.

### Deployment target

New/dedicated **Hetzner VPS** `[D-10]` — **Nginx + Let's Encrypt (Certbot, auto-renew, HSTS)**
reverse proxy, Docker Compose, SSH deploy from a trusted machine. Legacy WordPress URLs are
redirected `301` via the redirect map (Прилог Ѓ), applied at the web-server layer before
routing, preserving query params (fbclid, utm_*).

### Repository

`<set on first push — e.g. github.com/GoDigital/filtervoda>`

---

## Model Strategy

Default **Claude Sonnet 4.6** (`claude-sonnet-4-6`) for all tasks — architecture,
implementation, quick edits. Escalate to **Opus** only when the developer explicitly asks for
the hardest architectural or tracking-correctness work. **Haiku 4.5**
(`claude-haiku-4-5-20251001`) only for 1–5 line changes the developer labels trivial. Never
switch models silently. If the team adopts a newer model, update the ID in this one place. The
developer makes the final call.

### Written Plan Rule

For any multi-file feature or architectural decision, write a plan in `_docs/plans/` before
implementation. Implementation does not start until the developer explicitly approves it.

---

## Technology Stack

Reconciled with PRD §12.2 (PRD wins on stack values). See `_docs/architecture/adr/`.

| Layer                    | Technology                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**             | npm workspaces: `apps/web`, `apps/admin`, `apps/api`, `packages/shared`, `e2e/`                                                                                        |
| **Storefront (public)**  | **React 19 + TypeScript 5 (strict) + Vite 6 + React Router 7 — framework mode with SSR** (`@react-router/node` + `@react-router/express`); prerender for static routes, SSR + Redis cache for dynamic |
| **Admin SPA**            | **React 19 + Vite 6 + React Router 7 (SPA mode)** served behind `/admin/`; recharts 2 (lead stats), TipTap (rich text), cmdk (command palette, COULD)                  |
| **Shared FE libs**       | TailwindCSS 4 (`@theme` tokens) · `@radix-ui/*` · lucide-react · react-hook-form 7 + Zod 3 · TanStack Query 5 · Zustand 5 (UI state: lead modal, consent) · framer-motion 11 (moderate) · date-fns 3 |
| **Backend API**          | **Node.js LTS + Express 5 + TypeScript + Prisma 6 ORM** · Zod 3 · Pino 9 · express-session + connect-pg-simple · bcryptjs 3 · node-cron 3 · nodemailer 6 · axios 1     |
| **Database**             | **PostgreSQL 16** (`postgres:16-alpine`) — Prisma schema is the source of truth; also holds sessions, outbox, audit                                                    |
| **Cache / rate limit**   | **Redis 7** (`redis:7-alpine`) — page/data cache, rate-limit store, duplicate keys. **Not** for sessions (sessions live in Postgres via connect-pg-simple).            |
| **Background jobs**      | **Transactional outbox + node-cron** (no BullMQ) — outbox row written in the same transaction as the lead; `node-cron` processor `*/30s` + `setImmediate` kick        |
| **Media / images**       | `StorageService` abstraction: MinIO (S3 API) local; prod `[D-6]` Cloudinary (recommended) or MinIO/Hetzner Object Storage + sharp + Bunny CDN. Auto AVIF/WebP variants. |
| **Mail**                 | nodemailer — Mailhog local / SMTP `[D-7]` prod (SPF/DKIM/DMARC on domain)                                                                                              |
| **Proxy / TLS**          | **Nginx** (`nginx:alpine` local; Nginx + Certbot/Let's Encrypt on VPS)                                                                                                 |
| **Anti-spam**            | **Cloudflare Turnstile** `[D-2]` (server-side token verification) + honeypot + rate limit                                                                              |
| **API docs**             | OpenAPI 3.1 generated from Zod (`zod-to-openapi`), Swagger UI at `/api/docs`                                                                                            |
| **Tests**                | Vitest (+ React Testing Library), Playwright                                                                                                                           |

Monorepo layout (npm workspaces):

```
apps/
  web/         ← React Router 7 (SSR framework mode), Vite — public site
  admin/       ← React Router 7 (SPA), Vite — admin, served behind /admin/
  api/         ← Express 5 + Prisma + node-cron + outbox processor
    prisma/    ← schema.prisma, migrations/ (up + down SQL)
    src/{routes,services,middleware,jobs,lib}/  ← __tests__/ beside the code
packages/
  shared/src/  ← types.ts · schemas.ts (Zod, single source) · constants.ts · phone.ts
e2e/           ← Playwright
_docs/         ← architecture, adr, plans, deployment, design handoff
```

**New dependencies beyond the approved list** — each needs justification in the PR and
developer approval before install (Category 4 & 11): `@react-router/node`,
`@react-router/express` (ADR-001) · `express-rate-limit` + `rate-limit-redis` · `helmet` ·
`csrf-csrf` (double-submit; replaces deprecated `csurf`) · `cloudinary` **or**
`@aws-sdk/client-s3` + `sharp` (ADR-003) · `@tiptap/*` · `otplib` (TOTP 2FA, COULD) ·
`@sentry/node` (SHOULD). Macedonian phone → E.164 normalization is a **hand-written** function
in `packages/shared/phone.ts` with tests (no new dependency; `libphonenumber-js` only if
foreign numbers appear).

**Rationale:** the site lives off Google and FB/IG shares, so full server-rendered HTML
(indexing without JS, per-product OG, JSON-LD, fast LCP on weak mobile / in-app browsers) is a
hard requirement — React Router 7 framework mode gives SSR with **zero new frameworks** on the
approved Vite/React stack (ADR-001). Transactional outbox + node-cron gives robust,
idempotent server-side notifications (email, Meta CAPI, webhook, Telegram/Viber) without
adding BullMQ (ADR-002). This mirrors PRD §12 while keeping every rule below.

---

## Documentation Structure

```
_docs/
├── architecture/
│   ├── system-overview.md          ← high-level architecture + retention table
│   ├── adr/                        ← ADR-001…005 (SSR, outbox, media, staging, CSRF)
│   └── old-site-reference.md       ← read-only analysis of the WordPress site + Known Legacy Bugs
├── plans/                          ← one plan per multi-file feature (written first) · hi-counter.txt
├── deployment/
│   ├── local.md                    ← Docker Compose local setup
│   ├── staging.md                  ← staging.filtervoda.mk + HTTPS + basic auth + noindex
│   └── production.md               ← production deploy + HTTPS/Certbot + backup/restore runbook + secret rotation
└── design/frontend-web/
    ├── FilterVoda_Design_Prompt.md ← full design system (source of truth)
    └── handoff/
        ├── README.md               ← how to use the folder; read order; contrast pairs
        ├── tokens.css              ← CSS variables (Tailwind 4 @theme) — the single design source
        ├── components.md           ← component → Radix / Tailwind / lucide mapping, props, states, a11y
        ├── screens/                ← per-screen specs (public + admin)
        ├── emails/                 ← lead-notification, autoreply, password-reset specs
        └── og-image.spec.md
```

Rules: plans are written **before** implementation and kept current; deployment docs always
include HTTPS setup; `_docs/architecture/` is the source of truth for design and architecture;
`old-site-reference.md` is read-only; **Claude Code never edits `_docs/design/` handoff files**.

---

## Engineering Posture

Built to production-grade standards. This is a **public, revenue-driving, PII-handling** site
in an **ad-driven category** — there is no "harden later" path. All 11 points inherited 1:1
from the Agency OS constitution:

1. **Defense in depth.** Every endpoint validates AuthN + AuthZ at the controller, even when
   middleware already did.
2. **Short-lived, scoped sessions.** Admin sessions 30 days sliding; destructive actions
   require **fresh re-auth** (password re-entry, valid 10 min).
3. **Audit every mutation.** Actor, target entity, before/after snapshot (**no PII**), source
   IP hash, correlation ID, timestamp. `AuditLog` is append-only (app DB role: INSERT/SELECT
   only).
4. **Treat all customer data as PII.** No PII in logs, URLs, query strings, error messages, or
   client-side analytics payloads. Phone/name/email/city are **SHA-256-hashed** before Meta
   CAPI. Every customer table declares a retention policy.
5. **Generic client-facing errors.** No stack traces to the client. `404` vs `403` must not
   enable enumeration. Detailed errors stay server-side, keyed by `correlationId`.
6. **Rate limit every public endpoint** — the **lead form** especially: IP + honeypot +
   Turnstile + MK phone validation. Login/reset get IP + account limits with exponential
   backoff.
7. **Scoped service credentials.** No long-lived tokens in code. All secrets in env vars,
   Zod-validated at startup; rotation documented.
8. **Observability per feature.** Structured JSON logs (Pino), business-event metrics,
   correlation IDs — written with the feature.
9. **Rollback path per feature.** Feature flags (`Setting.feature.*`), expand/contract
   migrations, or an explicit rollback procedure in the PR.
10. **Multi-tenant ready.** `tenantId` on every primary table (default 1); every query carries
    a tenant predicate (a failing test guards this).
11. **No internal shortcuts.** A demo-only control (unbounded session, audit skipped) is never
    silently taken. Raise it with the safer alternative.

---

## Category 1 — Git & Versioning

### Branch Strategy

```
main    → production (Release PR only)
develop → staging (feature PRs only)
feature/FV-<N>-<name>   → feature work
bugfix/FV-<N>-<name>    → bug fixes
hotfix/FV-HI-<N>-<name> → emergency production fixes (fast-track; _docs/hi-counter.txt)
```

No direct commits to `main` or `develop`. Ever.

### Commit Standard — Conventional Commits

```
<type>(<scope>): <short description>

[body — why, not what. wrap at 72]

Refs FV-<N>
```

Types & bumps: `feat`→MINOR, `fix`/`perf`→PATCH, `feat!`/`BREAKING CHANGE`→MAJOR;
`docs|style|refactor|test|build|ci|chore|revert`→none. Imperative mood, lowercase, no trailing
period, be specific.

**Scopes (in `commitlint.config.js`):**

```
api web admin shared db infra docs
auth products catalog leads b2b calculator blog media seo
redirects tracking email cron settings templates
```

### Commit Toolchain

Husky (`.husky/`), commitlint (`commit-msg`), lint-staged (`pre-commit`), commitizen
(`npm run commit`), gitleaks (`pre-commit`). `--no-verify` only for genuine emergencies.

### Two PR Gates

- **Gate 1 — Feature → Develop:** local checks pass (`pre-push`: lint → typecheck → build)
  plus `npm test` with the Docker stack up. Developer reviews and merges.
- **Gate 2 — Release → Main:** PR from `develop` into `main` after staging is verified; then
  `bash scripts/deploy.sh production`.

Versioning is manual: bump `package.json`, summarize `feat`/`fix` in `CHANGELOG.md`, tag
`vX.Y.Z` on `main`. Jira `[TBD: FV]` is the source of truth for work items.

---

## Category 2 — Environments & Docker

Three tiers, never mixed:

```
local (Docker, HTTP) → staging (staging.filtervoda.mk, HTTPS + basic auth + noindex) → production (filtervoda.mk)
```

Env files: `.env.example` (committed, documents ALL vars, no real values), `.env.local`
(gitignored), `.env.staging` / `.env.production` (deploy machine / VPS only, never committed).
Every new variable goes into `.env.example` with a placeholder and comment in the same PR.

`docker compose up` starts the whole local stack behind Nginx on localhost:

| Role                     | Service                              |
| ------------------------ | ------------------------------------ |
| Reverse proxy            | Nginx (`nginx:alpine`)               |
| Storefront               | React Router 7 SSR (`apps/web`)      |
| Admin                    | React/Vite SPA (`apps/admin`)        |
| Backend API              | Express 5 (`apps/api`)               |
| Database + sessions + outbox + audit | PostgreSQL 16 (`postgres:16-alpine`) |
| Cache + rate limit       | Redis 7 (`redis:7-alpine`)           |
| Object storage           | MinIO (local / self-hosted)          |
| Mail capture             | Mailhog                              |

**Auth:** session-based (express-session + connect-pg-simple → sessions in **Postgres**),
bcryptjs (cost 12), 30-day sliding, cookie `httpOnly` + `secure` + `SameSite=Lax`. No external
IdP. **TOTP 2FA for `ADMIN` is COULD** (new dependency, approval). Local: plain HTTP.
Staging/Production: HTTPS via Nginx + Certbot.

---

## Category 3 — Secrets & Security

No hardcoded secrets. All loaded from `.env.*`, **validated at startup with Zod** — the app
refuses to start if a required secret is missing. Known integrations:

```
NODE_ENV · PUBLIC_SITE_URL · ADMIN_URL · DATABASE_URL · REDIS_URL
SESSION_SECRET · CRON_SECRET · IP_HASH_SECRET · PREVIEW_SECRET
SMTP_HOST · SMTP_PORT · SMTP_USER · SMTP_PASS · MAIL_FROM · NOTIFY_EMAILS
META_PIXEL_ID (1957593378149639 — existing) · META_CAPI_TOKEN · META_TEST_EVENT_CODE
GA4_ID · GTM_ID · TURNSTILE_SITE_KEY · TURNSTILE_SECRET_KEY
STORAGE_DRIVER (cloudinary|s3) · CLOUDINARY_* · S3_* · CDN_BASE_URL
WEBHOOK_URL · TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID · SENTRY_DSN
VPS_IP · DEPLOY_SSH_USER · DEPLOY_SSH_PRIVATE_KEY  (deploy machine only)
```

`gitleaks` runs as a `pre-commit` hook and blocks any commit with a detected secret. No
secrets in prompts, tickets, or logs — reference names, never values. HTTPS always on
staging/production, documented in `_docs/deployment/`. `helmet` security headers (CSP allowing
GTM/Pixel/CDN domains, `X-Frame-Options`, `Referrer-Policy`). Postgres, Redis, MinIO are
unreachable from the internet (docker network). No user SVG upload; images re-encoded on
upload.

---

## Category 4 — Developer Communication

Pause and ask the developer before: architectural decisions between two valid approaches;
scope expansion; destructive operations (drop tables, delete files, force-push, reset
environments); ambiguous requirements; **new dependencies**; deployment-environment changes;
Jira writes. Do **not** ask about details that follow from an approved plan, established
conventions here, or routine lifecycle updates.

---

## Category 5 — CI/CD Pipeline

**Local-first, no GitHub Actions** (GD-HI-163). Quality gate is a Husky `pre-push` hook
(`lint → typecheck → build`) plus `npm test` with the Docker stack up; deploy runs from a
trusted machine via `scripts/deploy.sh`. The VPS pulls source from Git. Dependabot stays
active on GitHub.

```
bash scripts/deploy.sh staging      # deploys origin/develop
bash scripts/deploy.sh production    # deploys origin/main
```

Deploy script: backup DB → capture pre-deploy HEAD → `git reset --hard origin/<ref>` →
`docker compose -f docker-compose.prod.yml up -d --build` → reload Nginx →
`prisma migrate deploy` → in-container health check → rollback (git + DB restore) on failure.
Staging must be verified before production.

---

## Category 6 — Testing Standards

Every feature ships with tests in the same PR. Coverage: **≥ 70%** backend, **≥ 60%** frontend.
No mocks for the DB layer — real Docker Postgres in integration tests. Tautological tests are
rejected.

| Type                          | Scope                                   | Tool                               |
| ----------------------------- | --------------------------------------- | ---------------------------------- |
| Unit + Integration (backend)  | Isolated logic + real Postgres (Docker) | **Vitest**                         |
| Unit + Integration (frontend) | Components + hooks                      | **Vitest** + React Testing Library |
| E2E                           | Full user flows, mobile 390×844 + desktop | **Playwright**                   |

### Coverage priority (build order)

1. Lead submission: validation, phone normalization, honeypot, Turnstile, rate limit,
   duplicate flag, transaction Lead + Outbox + Audit.
2. Outbox processor: retry/backoff, `SELECT … FOR UPDATE SKIP LOCKED`, `DEAD`, idempotency on
   double run, CAPI `event_id` dedup + hashing.
3. Auth: login, sliding session, rate limit by IP and account, re-auth for destructive ops,
   role isolation (`CLIENT_VIEWER` touches no content route).
4. Products: CRUD, publish/unpublish, cache invalidation, preview token, `tenantId` predicate.
5. Redirects: the whole legacy map (Прилог Ѓ) returns 301 → 200 (data-driven test).
6. Calculator: formula, edges (zero saving), carry-over into the form.
7. SSR: product-page HTML contains title, OG, JSON-LD, and price without JS.
8. Cron idempotency: anonymize-leads, cleanup-sessions.
9. E2E: B2C lead from ad landing → thank-you · B2B calculator → form · admin create product →
   publish → public page updated · `CLIENT_VIEWER` sees only leads · **active-template swap**
   changes the public site.

---

## Category 7 — Code Quality & Linting

Prettier (all JS/TS/JSON/CSS, via lint-staged). ESLint with `@typescript-eslint/recommended`
— errors block merge. TypeScript `strict: true` everywhere; **no `any`**, no `@ts-ignore`
without a reason comment. Shared types only in `packages/shared/src/types.ts`; shared Zod
schemas only in `schemas.ts` (backend validates, frontend infers) — single source of truth.
Named constants only in `constants.ts` — **no magic numbers**:

```
LEAD_RETENTION_MONTHS = 24 · IP_HASH_RETENTION_DAYS = 30 · OUTBOX_MAX_ATTEMPTS = 5
SESSION_DAYS = 30 · REAUTH_WINDOW_MIN = 10 · CURRENCY = 'MKD'
DEFAULT_LITERS_PER_PERSON_DAY = 1.5 · DEFAULT_WORKING_DAYS = 22
```

Dead code removed before merge. TODO format: `// TODO(scope): description — FV-<N>`.

**Macedonian vs English in code:** all identifiers, function names, comments, and commit
messages in **English**. All user-facing strings (UI labels, emails, notifications) in
**Macedonian Cyrillic** (via the `mk.json` dictionary; EN/SQ prepared for Phase 2). Never mix
languages in identifiers.

---

## Category 8 — Database Migrations (Prisma)

Immutable (never edit a committed migration — create a new one). Reversible (up + down SQL
reviewed before commit). Auto-run on deploy via `prisma migrate deploy`, never manually against
shared environments without explicit confirmation. Expand/contract for backward-compatible
changes. Live in the repo, in the same PR as the code. A failed migration on staging blocks
the production Release PR.

Schema: `apps/api/prisma/schema.prisma`. Migrations: `apps/api/prisma/migrations/`.

Project rules: `cuid()` IDs for publicly visible or sensitive entities (`Product`, `Post`,
`Lead`, `Media`, `User`, `OutboxJob`, `AuditLog`); `SERIAL` for lookup tables
(`ProductCategory`, `PostCategory`, `Faq`, `Redirect`); never float timestamps.
`createdAt`/`updatedAt` everywhere; `deletedAt` soft delete for content; audit and outbox have
no soft delete. `tenantId Int @default(1)` on all primary tables. Every customer-data table
declares a **retention policy** (see `system-overview.md`):

| Table                              | Retention                                                             |
| ---------------------------------- | -------------------------------------------------------------------- |
| `Lead` (name, phone, email, message, company) | 24 months `[TBD client]` → cron `anonymize-leads` replaces PII with `[анонимизирано]`; stats stay |
| `Lead.ipHash`                      | 30 days                                                              |
| `OutboxJob` (status `DONE`)        | 30 days; `DEAD` kept until manually closed                          |
| `AuditLog`                         | forever; snapshot fields contain **no PII**                         |
| `Session`                          | until expiry (30-day sliding); cron `cleanup-sessions`              |
| Rate-limit keys (Redis)            | TTL 10 min / 24 h                                                   |

---

## Category 9 — Logging & Error Handling

**Pino** structured JSON logging. No `console.log` in production code. Levels: `error`, `warn`,
`info` (business events), `debug` (dev only). **Never log PII** (phone, name, email, address)
— use `leadId` only. `correlationId` (UUID) middleware on every request, propagated into
outbox jobs; `X-Correlation-Id` on every response. Every error log includes: `message`,
`stack`, `userId?`, `endpoint`, `correlationId`, `timestamp` (ISO 8601). Client-facing errors
are generic.

Project business events (always `info`):

```
lead.created  lead.duplicateFlagged  lead.spamRejected  lead.status.changed  lead.anonymized
lead.email.sent  lead.capi.sent  lead.webhook.sent
outbox.job.failed (warn)  outbox.job.dead (error)
product.published  product.unpublished  post.published  media.uploaded
settings.updated  redirect.created  cache.invalidated  template.activated
auth.login  auth.logout  auth.loginFailed  auth.rateLimited  auth.reauth
cron.outbox.run  cron.anonymize.run  cron.digest.run
```

---

## Category 10 — API Documentation

Every endpoint in **OpenAPI 3.1**, generated from the Zod schemas in
`packages/shared/src/schemas.ts` via `zod-to-openapi`. Swagger UI at `/api/docs` (local: open;
staging/production: behind admin session or disabled). Kept current in the same PR. Route
prefix `/api/v1/`.

---

## Category 11 — Dependency Management

Justify every new dependency in the PR (see the "new dependencies" table above). Apply
security patches promptly. Prefer well-maintained packages. Resolve peer-dependency warnings
before merge. Dependabot active on GitHub.

**Approved core (do not replace without a plan):**

Backend: `express@5`, `prisma@6`, `zod@3`, `pino@9`, `express-session` + `connect-pg-simple`,
`bcryptjs@3`, `node-cron@3`, `nodemailer@6`, `axios@1`.

Frontend/admin: `react@19`, `vite@6`, `typescript@5`, `react-router@7`, `tailwindcss@4`,
`@radix-ui/*`, `lucide-react`, `zustand@5`, `@tanstack/react-query@5`, `react-hook-form@7`,
`zod@3`, `framer-motion@11`, `recharts@2`, `date-fns@3`.

---

## Category 12 — Human Oversight

No code reaches `main` without explicit human approval. Every PR is human-reviewed, every merge
and every production deploy is a human action. Scope decisions belong to the developer.

---

## Category 13 — Design Handoff Protocol

Frontend work is design-driven. Source designs live in `filtervoda-handoff/` and are distilled
into `_docs/design/frontend-web/`.

Before writing any frontend code: read `FilterVoda_Design_Prompt.md`, `handoff/README.md`,
`tokens.css`, `components.md`, and the relevant `screens/<screen>.spec.md` in full. If a
handoff spec is missing, **warn the developer rather than guessing**.

Rules:

- **Tokens are the source of truth** — never hardcode a colour, spacing, radius, shadow, font,
  or motion value covered by `tokens.css`. Reference the CSS variable (Tailwind 4 `@theme`).
- **The final design must be identical to the handoff folder** — reproduce it pixel-accurately;
  no invented layout, imagery, or copy.
- **Admin accent colour per module** (never bleed one into another): Lead-ови green ·
  Производи/Категории blue · Совети/Страници/ЧПП violet · За фирми/Искуства orange · Медиуми
  teal · Поставки/Корисници gray · Дизајн и темплејти / Навигација cyan · Проблеми со испорака
  / Tracking / SEO / Редирекции red.
- **Macedonian Cyrillic UI text**, matching the copy bank (Design Brief Блок Д). Fonts must
  have full Cyrillic support (ѓ ќ ѕ џ љ њ), self-hosted woff2, no Google Fonts CDN.
- Contrast AA (4.5:1 text, 3:1 UI), visible focus, labels on all fields, input text ≥ 16px (no
  iOS zoom), semantic heading order, touch targets ≥ 44px, mobile-first (390 → 768 → 1280+).
- Claude Code never edits the original handoff prototypes — changes go back to design.

---

## filtervoda-Specific Rules

These take precedence when in conflict with generic guidance.

### The 3 templates & the "Дизајн и темплејти" admin module

Three complete storefront templates exist and are all implemented as selectable themes,
switchable from the admin. This is the feature the developer emphasized: the client changes
them whenever they like and picks exactly one to be active.

| ID     | Name (MK)           | Direction                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------- |
| **b1** | Б-1 Кристално чисто | Premium, light, white space, big product photo. Unbounded + Manrope.       |
| **b2** | Б-2 Жива вода       | Blue→aqua gradient hero, organic wave shapes, Oswald headings, green CTA.  |
| **b3** | Б-3 Паметна вода    | Navy "data" panels, gauges, JetBrains Mono numbers, teal CTA, tight radii. |

**Single-active model (the correct behaviour — mirrors Potencijashop's Design Versions):**

- **Exactly one template is active at a time.** All visitors see that one. There is **no
  percentage split**, no simultaneous multi-template serving.
- The admin module shows all three as a selection; the active one is marked „Активен темплејт",
  the others show „Примени на сајтот".
- Applying a template stages the change; it goes live on publish (nothing auto-publishes), and
  then **every visitor immediately sees the new template** (Redis full-page cache purged on
  publish). Log `template.activated`; write an `AuditLog` row.
- Each template's design tokens are editable in this module (CTA colour, ink, accent, button
  radius, font families, mono) with a live AA-contrast check and „Генерирај tokens.css" export.
  „Врати фабрички" resets a template to its shipped values.
- Backend: a single `activeTemplateId` setting (`Setting.key = 'design.activeTemplate'`) plus
  per-template token overrides in `Setting`. The storefront reads the published active template
  and renders that theme for **all** requests. Activation is fully reversible — never remove
  the ability to switch back.
- The three templates share the same content, routes, and copy — only tokens/layout treatment
  differ. Content edits are template-independent.

### Lead system (the core of the project)

Guest, no login. **Single conversion = lead.** Entry points: global lead modal (pre-selected
product), short home form (name + phone), product inline form, B2B form, contact form, advisor
mini-form, click-to-call, Viber. Lead types: `B2C | B2B | CONTACT | ADVISOR`.

Form fields validated server-side via Zod (schemas in `packages/shared`). MK phone required,
normalized to E.164 (`packages/shared/phone.ts`). Consent checkbox required; consent text and
version stored on the lead. Anti-spam: honeypot + **Cloudflare Turnstile** (server-verified) +
rate limit (`POST /leads` 5 / 10 min / IP and 20 / 24 h / IP). Auto-attached: `pageUrl`,
`section`, first/last UTM, `referrer`, `fbclid`/`gclid`, `fbp`/`fbc`, `userAgent`, `ipHash`
(HMAC, never raw IP). A phone seen again within 24h flags `isDuplicate`.

**Processing is asynchronous via transactional outbox.** On submit, in **one DB transaction**:
write `Lead` + `LeadEvent(CREATED)` + `OutboxJob`(s) + `AuditLog`. No email, Meta CAPI,
webhook, or Telegram/Viber call happens in the HTTP request path. The `node-cron` processor
(`*/30s` + immediate `setImmediate` kick) drains the outbox with `SELECT … FOR UPDATE SKIP
LOCKED`, backoff 1m → 5m → 15m → 1h → 6h, `DEAD` after `OUTBOX_MAX_ATTEMPTS`, visible in admin
„Проблеми со испорака" with a retry button.

Lead management (admin): list with filters (type/status/date/product/source), search, export
(CSV/XLSX, UTF-8 **with BOM** for Cyrillic in Excel), bulk mark spam; detail with attribution,
timeline, notes, „Повикај / Viber / Email" buttons, status change with a reason when „Изгубено",
and „Анонимизирај" behind a re-auth dialog. Status lifecycle:

```
NEW (Нов) → CONTACTED (Контактиран) → OFFER_SENT (Понуда испратена) → WON (Договорено) → INSTALLED (Монтирано) → LOST (Изгубено) / SPAM (Спам)
```

### B2B savings calculator

Inputs: employee count (slider), current solution (galloni 19L / bottles 0.5L), price per
gallon. Output: current monthly ≈ X ден., with SPAR from Y ден./mo, annual saving ≈ Z ден.,
with the disclaimer „Пресметката е ориентациона." and „Добиј точна понуда" CTA that carries the
`calcInput` into the B2B lead. Formula uses `DEFAULT_LITERS_PER_PERSON_DAY` and
`DEFAULT_WORKING_DAYS`; calculator parameters live in `Setting`. Behind `feature.calculator`
flag. Test the formula, the zero-saving edge, and the carry-over.

### Tracking — Pixel + CAPI + GA4 (mandatory architecture)

Existing **Meta Pixel** `1957593378149639` is kept. Every key event fires **twice**: browser
(Pixel via GTM) + server (Conversions API) with the **same `event_id`** → Meta deduplicates.
Server events go through the **outbox** carrying `event_id`, `event_time`, `client_ip`,
`user_agent`, `fbp`/`fbc`, and **SHA-256-hashed** phone/name/city/email. Event map in PRD
Прилог Д (GTM → GA4 + Pixel/CAPI). Every event carries the **active template** the visitor saw.

**Nothing fires before consent.** Cookie banner (Прифати сè / Само неопходни / Поставки) with
**Consent Mode v2** signals (`ad_storage`, `analytics_storage`, `ad_user_data`,
`ad_personalization`). Third-party scripts load only after consent and after `load`. Definition
of done: dedup verified in Meta Test Events, GA4 DebugView shows all events with correct
values.

### Admin panel / CMS

Custom lightweight admin (`apps/admin`, decided in PRD §9.3 — no Payload). Roles: `ADMIN`
(everything incl. users & settings) · `EDITOR` (content, media, leads) · `CLIENT_VIEWER`
(leads only — touches no content route, a test proves it). Modules: Dashboard (recharts: leads
today/7/30, by source, by product, delivery state) · Lead-ови · Производи (editor tabs:
Основно, Галерија, Придобивки, Степени, Спецификација, Цена и беџови, ЧПП, Поврзани, SEO) ·
Категории · Страници и копи · Совети (TipTap) · ЧПП · За фирми · Искуства · Навигација и футер ·
**Дизајн и темплејти** · Медиуми · Tracking и интеграции · SEO · Редирекции · Поставки ·
Корисници · Проблеми со испорака (outbox) · Audit лог. Every publish invalidates the Redis
cache of the affected pages and writes an `AuditLog` row. Destructive ops require re-auth.

### SEO & rendering

SSR (React Router 7 framework mode) with prerender/cache for all public pages. Unique
title/description per page (editable, default templates), canonical, OG/Twitter cards,
auto `sitemap.xml` + `robots.txt`, JSON-LD (`Organization`, `LocalBusiness`, `Product`+`Offer`
in MKD, `FAQPage`, `Article`, `BreadcrumbList`), clean slugs, **301 map for all legacy URLs**
(Прилог Ѓ) applied at the web-server layer, `noindex` for `/blagodarime`, `/admin`, staging.

### Performance (hard NFRs)

LCP < 2.5s, INP < 200ms, CLS < 0.1 (mobile, throttled 4G); Lighthouse mobile Performance ≥ 90.
Responsive AVIF/WebP (`<picture>` + `srcset`), lazy-load below the fold, hero
`fetchpriority="high"` + `<link rel="preload">`, fonts preload, JS budget ≤ 150 kB gzip per
public page (excl. consented third-party). No hero video, no auto-play carousels, no
full-screen loaders. Cache headers 1 year for hashed static.

### Emails & operator alerts

nodemailer via the outbox. **New lead → shop** (`NOTIFY_EMAILS`, up to 3) immediately ·
**Autoreply → lead** (if email given): „Ви благодариме, ќе ве контактираме…" · **Password
reset** · **Daily digest** (COULD). Optional Telegram/Viber alert to the operator on every new
lead. HTML emails: 600px, table layout, MK Cyrillic, no external fonts. Log every send.

### Redirects & migration

The old WordPress site (17 products, 10+ articles on `/NNN/` URLs with SEO value) is migrated.
Every legacy URL → `301` new URL via the redirect map (Прилог Ѓ), CSV-importable in admin, with
a hit counter. Meta Pixel ID stays the same.

---

## Delivery Phases

| Phase             | Scope                                                                                                                                                                                                   | Outcome                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **0. Prep**       | ADRs (001–005), tokens extracted from the 3 templates, final prices/specs, MK copy, product photos, redirect list, hosting `[D-10]`                                                                    | Approved content + design + ADRs |
| **1. MVP launch** | Home + Catalogue + Product + За фирми (calculator) + Совети + legal + lead system (outbox, email, Turnstile) + tracking (Pixel/CAPI/GA4 behind consent) + admin (all modules incl. **3 templates single-active**) + 301 redirects | Live lead generation with full tracking |
| **2. Expansion**  | CAPI hardening, per-source/product lead metrics, content scheduling, EN/SQ i18n, rich media pipeline, daily digest, backups + monitoring                                                               | Full autonomy + scaling         |
| **3. Options**    | TOTP 2FA, Sentry, Microsoft Clarity, courier/CRM integrations, A/B of hero/offer                                                                                                                       | Optimization                    |

---

## Acceptance Criteria (Definition of Done)

- Public pages live (Home, Catalogue, Product, За фирми, Совети, За нас, Контакт, legal, 404),
  full block structure, all content editable from admin.
- Lead in < 60s on mobile: landing → form → thank-you; email arrives; lead in admin.
- B2B calculator produces a saving and carries it into the B2B form.
- Admin content/price/template change visible on the site < 1 minute after publish/purge.
- Tracking verified: Pixel + CAPI dedup (same `event_id`), Consent Mode v2 gating, GA4
  ecommerce in DebugView.
- Legacy URLs → `301` → 200 with query params preserved (full Прилог Ѓ map).
- Lighthouse mobile Performance ≥ 90; LCP < 2.5s on every public page; works in FB/IG in-app
  browsers.
- Lead export as CSV/XLSX with configurable columns (UTF-8 BOM).
- Legal pages + consent banner present; retention/anonymization cron runs.
- **3 templates:** exactly one active template serves all visitors; admin swaps it in one
  click + publish; tokens editable per template with AA-contrast check.
- The delivered design is **identical to the handoff folder**.

---

## Open Items (close before / during development)

1. `[D-1]` Address form — recommend „Вие" site-wide (client confirms).
2. `[D-2]` Cloudflare Turnstile keys.
3. `[D-6]` Media driver — Cloudinary (recommended) vs MinIO/S3 + sharp + Bunny (ADR-003).
4. `[D-7]` Production SMTP provider.
5. `[D-8]` SSR approach — RR7 framework mode (recommended, ADR-001).
6. `[D-10]` Hosting — dedicated Hetzner VPS (recommended) vs shared.
7. Final HEX palette + SPAR logo vector (must not resemble the SPAR supermarket brand).
8. Final prices/specs per product; confirm the „[потврди]" spec placeholders.
9. Lead retention period (proposed 24 months) — client sign-off.
10. Order phone + Viber/WhatsApp accounts; notification recipients.
11. Legal selling entity for footer/terms (ЕДБ/ЕМБС) + privacy policy text.

---

_This file is the living constitution of the filtervoda.mk (SPAR Company) project._
_Adapted from the GoDigital Agency OS constitution; modelled on `CLAUDE-potencijashop.md`;
reconciled with PRD v1.1. Stack: React 19 + Vite + React Router 7 SSR (web) + React/Vite SPA
(admin) + Express 5 + Prisma + PostgreSQL 16 + Redis 7 + transactional outbox/node-cron, on
Hetzner VPS + Nginx/Certbot._
_Last updated: 2026-09-01._
