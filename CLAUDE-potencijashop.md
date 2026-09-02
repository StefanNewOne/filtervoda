# CLAUDE.md — Potencijashop.mk

This file is the living constitution of this repository. Claude Code reads it automatically
on every session. All rules defined here are non-negotiable unless the developer explicitly
overrides one for a specific task. It is adapted from the GoDigital Agency OS constitution
(`CLAUDE-godigital.md`) — the same engineering standard, infrastructure, and conventions,
retargeted to this project.

---

## What This Repository Is

**Potencijashop.mk** is a **direct-response (built-to-sell) e-commerce website** for the
Macedonian market. It sells four supplement products in a restricted category (sexual
health / potency / vitality): **POSKOK, MAX ERECT, Spanish Fly (Шпанска Мушичка), and
POSKOK Women**, with room for 1–2 more. It is **not** a catalogue shop — primary traffic
comes from **Meta ads (Facebook/Instagram)** landing directly on per-product conversion
pages.

Two applications ship from one monorepo:

1. **Storefront** — public site (`potencijashop.mk`). Home hub + 4 product landing pages +
   cart + checkout + thank-you + legal pages. Guest-only ordering, **cash on delivery (COD)**.
2. **Admin panel (CMS)** — protected app at `/admin`. Ten modules: dashboard, orders,
   products & stock, content editing, media library, marketing & pixel, **design versions**,
   settings, users, contacts. The team runs everything without a developer.

Everything customer-facing is in **Macedonian Cyrillic** at launch, with **EN and SQ**
translations shipping in the same launch (see i18n rules). The admin is bilingual MK/EN.

### Source documents (read before building)

| Document                  | Location                                                                 | Authority                                           |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| Design handoff README     | `design_handoff_potencijashop/**/README.md`                              | Storefront + admin implementation detail            |
| PRD v2                    | `design_handoff_potencijashop/**/PRD v2.dc.html`                         | **Current** product requirements — wins on conflict |
| Admin functional analysis | `design_handoff_potencijashop/**/admin/Admin panel - analiza.dc.html`    | Admin module-by-module spec                         |
| PRD v1.0                  | `design_handoff_potencijashop/**/prd.md` + `Potencijashop_PRD_v1.0.docx` | Tech stack + domain strategy (settles these)        |
| Design prototypes         | `design_handoff_potencijashop/**/verzija-*/*.dc.html`                    | 5 high-fidelity design versions (A, Б, В, Г, Д)     |

The `.dc.html` prototypes are **design references, not production code**. Their `support.js`
runtime is a prototyping tool — **do not port it**. Recreate the designs pixel-accurately in
the target stack. The `help-layer.js` explanation layer is prototype-only — **do not build it**.

### Deployment target

Existing **Hetzner VPS** — **Caddy** reverse proxy (automatic TLS, redirects, compression,
cache headers), Docker Compose, SSH deploy. `poskok.mk` → `301` → `potencijashop.mk/poskok`
preserving **all** query params (fbclid, utm_*) — configured in Caddy.

### Repository

`<set on first push — e.g. github.com/GoDigital/potencijashop>`

---

## Model Strategy

Default **Claude Sonnet 4.6** (`claude-sonnet-4-6`) for all tasks — architecture,
implementation, quick edits. Escalate to **Opus** only when the developer explicitly asks
for the hardest architectural or tracking-correctness work. **Haiku 4.5**
(`claude-haiku-4-5-20251001`) only for 1–5 line changes the developer labels trivial.
Never switch models silently. The developer makes the final call.

### Written Plan Rule

For any multi-file feature or architectural decision, write a plan in `_docs/plans/` before
implementation. Implementation does not start until the developer explicitly approves it.

---

## Technology Stack

Decided with the developer (see `_docs/architecture/adr/`):

| Layer                        | Technology                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Storefront (public)**      | **Astro** (SSR, Node adapter) with full server-side / Redis cache; interactive parts (order form, mini-cart, bundle picker) are **React 19 islands** |
| **Admin SPA**                | **React 19 + TypeScript + Vite + TailwindCSS + Zustand + TanStack Query + React Router 7 + React Hook Form**                                         |
| **Backend API**              | **Node.js + Fastify + TypeScript + Prisma ORM**                                                                                                      |
| **Database / cache / queue** | **PostgreSQL 16 + Redis 7 + BullMQ** (CAPI dispatch, email/SMS, image processing)                                                                    |
| **Infrastructure**           | **Docker Compose** on Hetzner VPS, **Caddy** (TLS, redirects, compression, cache)                                                                    |
| **Images**                   | Upload → auto resize + **WebP/AVIF** variants; lazy loading; LCP image preload                                                                       |
| **Object storage**           | MinIO (local) / VPS volume or S3-compatible (prod)                                                                                                   |
| **Mail**                     | Mailhog (local) / SMTP service (prod) via nodemailer                                                                                                 |

Monorepo layout (npm workspaces):

```
apps/
  web/         ← Astro storefront (+ React islands)
  admin/       ← React + Vite admin SPA
  api/         ← Fastify + Prisma backend
packages/
  shared/      ← shared TS types (types.ts) + Zod schemas (schemas.ts)
  ui/          ← shared design tokens / primitives (optional)
_docs/         ← architecture, plans, deployment, design
```

**Rationale:** LCP < 1.8s on cold Meta traffic is a hard acceptance criterion and directly
drives ad cost — Astro SSR + full-page cache serves the landing pages effectively static.
Fastify + BullMQ gives robust server-side CAPI with queue + retry, the core tracking
requirement. This mirrors PRD Chapter 13 while keeping GoDigital's Prisma/Postgres/Redis/
Docker/Caddy infrastructure and every rule below.

---

## Documentation Structure

```
_docs/
├── architecture/
│   ├── system-overview.md          ← high-level architecture decisions
│   ├── data-model.md               ← Prisma entities + relationships
│   ├── tracking-spec.md            ← Pixel + CAPI + GA4 event map, dedup, EMQ
│   └── adr/                        ← Architecture Decision Records (stack, design-versions, i18n)
├── plans/                          ← feature plans written before implementation
├── backlog.md                      ← epics + tickets (source of truth until Jira is wired)
├── deployment/
│   ├── local.md                    ← Docker Compose local setup
│   ├── staging.md                  ← staging deploy + HTTPS (Caddy)
│   └── production.md               ← production deploy + HTTPS + poskok.mk redirect
└── design/
    └── storefront/handoff/         ← copied/derived from design_handoff_potencijashop
        ├── README.md
        ├── tokens.css              ← storefront + admin design tokens
        ├── versions.md             ← the 5 design versions + per-product colour worlds
        └── screens/                ← per-screen specs
```

Rules: plans are written **before** implementation and kept current; deployment docs always
include HTTPS setup; `_docs/architecture/` is the source of truth for design and architecture.

---

## Engineering Posture

Built to production-grade standards. This is a **public, revenue-generating, PII-handling**
site in a **restricted ad category** — there is no "harden later" path.

1. **Defense in depth.** Every endpoint validates AuthN + AuthZ at the controller, even when
   middleware already did.
2. **Short-lived, scoped tokens.** Admin sessions expire with sliding renewal; 30-minute
   idle logout (admin analysis requirement). Owner-destructive actions require fresh re-auth.
3. **Audit every mutation.** Actor, target entity, before/after snapshot, source IP,
   correlation ID, timestamp. Audit rows are append-only. Price and order-status changes are
   always audited.
4. **Treat all customer data as PII.** No PII in logs, URLs, query strings, error messages,
   or analytics event payloads sent client-side. Customer phone/name/email are hashed
   (SHA-256) before CAPI. Every customer table declares a retention policy.
5. **Generic client-facing errors.** No stack traces to the client. `404` vs `403` must not
   enable enumeration. Detailed errors stay server-side, keyed by correlation ID.
6. **Rate limit every public endpoint** — the **order form** especially (fake COD orders are
   a real problem): IP + honeypot + MK phone validation. Login/reset get IP + account limits
   with exponential backoff.
7. **Scoped service credentials.** No long-lived tokens in code. All secrets in env vars,
   rotation documented.
8. **Observability per feature.** Structured JSON logs, metrics for business events (orders,
   CAPI sends, refused-rate), correlation IDs — written with the feature.
9. **Rollback path per feature.** Feature flags, backwards-compatible migrations, or an
   explicit rollback procedure in the PR.
10. **No internal shortcuts.** A demo-only control (unbounded session, audit skipped,
    ad-safety bypass) is never silently taken. Raise it with the safer alternative.

---

## Category 1 — Git & Versioning

### Branch Strategy

```
main    → production (Release PR only)
develop → staging (feature PRs only)
feature/<TICKET>-<name>   → feature work
bugfix/<TICKET>-<name>    → bug fixes
hotfix/<TICKET>-<name>    → emergency production fixes
```

No direct commits to `main` or `develop`. Ever.

### Commit Standard — Conventional Commits

```
<type>(<scope>): <short description>

[body — why, not what. wrap at 72]

Refs <TICKET>
```

Types & bumps: `feat`→MINOR, `fix`/`perf`→PATCH, `feat!`/`BREAKING CHANGE`→MAJOR;
`docs|style|refactor|test|build|ci|chore|revert`→none. Imperative mood, lowercase, no
trailing period, be specific.

**Scopes (in `commitlint.config.js`):**

```
storefront admin api db infra ci docs
products orders checkout cart content media
marketing tracking capi versions settings auth i18n legal
```

### Commit Toolchain

Husky (git hooks in `.husky/`), commitlint (`commit-msg`), lint-staged (`pre-commit`),
commitizen (`npm run commit`). `--no-verify` only for genuine emergencies.

### Two PR Gates

- **Gate 1 — Feature → Develop:** local checks pass (`pre-push`: lint → typecheck → build)
  plus `npm test` with the Docker stack up. Developer reviews and merges.
- **Gate 2 — Release → Main:** PR from `develop` into `main` after staging is verified;
  then `bash scripts/deploy.sh production`.

Versioning is manual: bump `package.json`, summarize `feat`/`fix` in `CHANGELOG.md`, tag
`vX.Y.Z` on `main`.

---

## Category 2 — Environments & Docker

Three tiers, never mixed:

```
local (Docker, localhost) → staging (staging.potencijashop.mk) → production (potencijashop.mk)
```

Env files: `.env.example` (committed, documents ALL vars, no real values), `.env.local`
(gitignored), `.env.staging` / `.env.production` (CI/CD secrets only, never committed).
Every new variable goes into `.env.example` with a placeholder and a comment.

`docker compose up` starts the whole local stack behind Caddy on localhost:

| Role                     | Service                              |
| ------------------------ | ------------------------------------ |
| Database                 | PostgreSQL 16 (`postgres:16-alpine`) |
| Cache + sessions + queue | Redis 7 (`redis:7-alpine`)           |
| Backend API              | Fastify (`apps/api`)                 |
| Storefront               | Astro SSR (`apps/web`)               |
| Admin                    | React/Vite (`apps/admin`)            |
| Object storage           | MinIO                                |
| Mail capture             | Mailhog                              |
| Reverse proxy            | Caddy                                |

**Auth:** session-based (Fastify session + Redis store), bcrypt/argon2 password hashing.
No external IdP. **Owner role requires 2FA (app code) on every new sign-in.**

Local: plain HTTP. Staging/Production: HTTPS via Caddy automatic TLS.

---

## Category 3 — Secrets & Security

No hardcoded secrets. All loaded from `.env.*`, **validated at startup with Zod** — the app
refuses to start if a required secret is missing. Known integrations:

```
DATABASE_URL              PostgreSQL connection
REDIS_URL                 Redis connection
SESSION_SECRET            session signing
META_PIXEL_ID             Meta Pixel (client)
META_CAPI_TOKEN           Meta Conversions API access token
META_CAPI_DATASET_ID      Meta CAPI dataset ID
META_CAPI_TEST_CODE       test event code (staging only)
GA4_MEASUREMENT_ID        GA4
GTM_CONTAINER_ID          Google Tag Manager (optional)
SMTP_URL / SMTP_*         email sending
SMS_API_KEY               operator SMS/Viber alerts
CRON_SECRET               HTTP-triggered cron endpoints
```

`gitleaks` runs as a `pre-commit` hook and blocks any commit with a detected secret. No
secrets in prompts, tickets, or logs — reference names, never values. HTTPS always on
staging/production, documented in `_docs/deployment/`.

---

## Category 4 — Developer Communication

Pause and ask the developer before: architectural decisions between two valid approaches;
scope expansion; destructive operations (drop tables, delete files, force-push, reset
environments); ambiguous requirements; **new dependencies**; deployment-environment changes.
Do **not** ask about details that follow from an approved plan, established conventions here,
or routine lifecycle updates.

---

## Category 5 — CI/CD Pipeline

**Local-first.** Quality gate is a Husky `pre-push` hook (`lint → typecheck → build`);
deploy runs from a trusted machine via `scripts/deploy.sh`. The VPS pulls source from Git.

```
bash scripts/deploy.sh staging      # deploys origin/develop
bash scripts/deploy.sh production    # deploys origin/main
```

Deploy script: backup DB → capture pre-deploy HEAD → `git reset --hard origin/<ref>` →
`docker compose -f docker-compose.prod.yml up -d --build` → reload Caddy →
`prisma migrate deploy` → in-container health check → rollback (git + DB restore) on failure.
Staging must be verified before production.

---

## Category 6 — Testing Standards

Every feature ships with tests in the same PR. Coverage: **70%** backend, **60%** frontend.

| Type                          | Scope                                   | Tool                               |
| ----------------------------- | --------------------------------------- | ---------------------------------- |
| Unit + Integration (backend)  | Isolated logic + real Postgres (Docker) | **Vitest**                         |
| Unit + Integration (frontend) | Components + hooks                      | **Vitest** + React Testing Library |
| E2E                           | Full user flows in Chromium             | **Playwright**                     |

No mocks for the DB layer — real Docker Postgres in integration tests.

### Coverage priority (build order)

1. Order creation (COD): bundle → form → validation → Purchase event → thank-you
2. Product state machine (`active`/`oos`/`soon`/`hidden`) + stock auto-flip
3. Tracking: Pixel + CAPI dedup (same `event_id`), consent gating, EMQ fields
4. Admin auth (login, session, owner 2FA, idle logout, rate limiting)
5. Order status lifecycle + email/SMS notification triggers
6. Design-version activation (single active, publish, storefront swap)
7. Ad-safety: API refuses to attach an ad-unsafe image to a product page
8. CSV/XLSX export (UTF-8 BOM, configurable columns)

---

## Category 7 — Code Quality & Linting

Prettier (all JS/TS/JSON/CSS, via lint-staged). ESLint with `@typescript-eslint/recommended`
— errors block merge. TypeScript `strict: true` everywhere; **no `any`**, no `@ts-ignore`
without a reason comment. Shared types in `packages/shared/src/types.ts`; shared Zod schemas
in `packages/shared/src/schemas.ts` (backend validates, frontend infers) — single source of
truth. Dead code removed before merge.

TODO format: `// TODO(scope): description — <TICKET>`

**Macedonian vs English in code:** all identifiers, function names, and comments in
**English**. All user-facing strings (UI labels, emails, notifications) in **Macedonian
Cyrillic** (with EN/SQ variants via i18n). Never mix languages in identifiers.

---

## Category 8 — Database Migrations (Prisma)

Immutable (never edit a committed migration — create a new one). Reversible (`up`/`down`).
Auto-run on deploy via `prisma migrate deploy`, never manually against shared environments
without explicit confirmation. Live in the repo, in the same PR as the code. A failed
migration on staging blocks the production Release PR.

Schema: `apps/api/prisma/schema.prisma`. Migrations: `apps/api/prisma/migrations/`.

Project rules: integer `SERIAL` or `cuid()` IDs (never float timestamps); append-only audit
tables (no `UPDATE`/`DELETE` grant for the app DB role); every customer-data table declares a
retention policy.

---

## Category 9 — Logging & Error Handling

**Pino** structured JSON logging. No `console.log` in production code. Levels: `error`,
`warn`, `info` (business events), `debug` (dev only). **Never log PII** (phone, name, email,
address) or secrets. Every error log includes: `message`, `stack`, `userId?`, `endpoint`,
`correlationId` (UUID per request), `timestamp` (ISO 8601). Client-facing errors are generic.

Project business events (always `info`):

```
order.created  order.statusChanged  order.exported
product.stateChanged  product.stockZeroed
capi.sent  capi.failed  capi.retried
pixel.consentGranted  email.sent  email.failed  sms.sent  sms.failed
version.activated  version.published
media.uploaded  media.adUnsafeBlocked
auth.login  auth.logout  auth.loginFailed  auth.rateLimited  auth.2faChallenged
```

---

## Category 10 — API Documentation

Every endpoint in **OpenAPI 3.1**, generated from code via `zod-to-openapi`. Swagger UI at
`http://localhost:3001/api/docs`. Kept current in the same PR. Route prefix `/api/v1/`.

---

## Category 11 — Dependency Management

Justify every new dependency in the PR. Apply security patches promptly. Prefer
well-maintained packages. Resolve peer-dependency warnings before merge.

**Approved core (do not replace without a plan):**

Backend: `fastify@5`, `@fastify/*` (cors, helmet, rate-limit, session, multipart),
`prisma@6`, `zod@3`, `pino@9`, `bullmq@5`, `ioredis@5`, `bcryptjs@3`, `nodemailer@6`,
`axios@1`, `sharp` (image processing), `otplib` (owner 2FA).

Frontend/admin: `react@19`, `vite@6`, `typescript@5`, `tailwindcss@4`, `zustand@5`,
`@tanstack/react-query@5`, `react-router@7`, `react-hook-form@7`, `zod@3`, `lucide-react`,
`recharts@2` (metrics), `date-fns@3`.

Storefront: `astro@4+`, `@astrojs/react`, `@astrojs/node`, Tailwind.

---

## Category 12 — Human Oversight

No code reaches `main` without explicit human approval. Every PR is human-reviewed, every
merge and every production deploy is a human action. Scope decisions belong to the developer.

---

## Category 13 — Design Handoff Protocol

Frontend work is design-driven. Source designs live in `design_handoff_potencijashop/` and
are distilled into `_docs/design/storefront/handoff/`.

Before writing any frontend code: read `README.md`, `tokens.css`, `versions.md`, and the
relevant `screens/<screen>.spec.md` in full. If a handoff spec is missing, warn the developer
rather than guessing.

Rules:

- **Tokens are the source of truth** — never hardcode a colour, spacing, radius, or font
  covered by `tokens.css`. Reference the variable.
- **Per-product colour worlds** — POSKOK teal/navy, MAX ERECT warm/crimson, Spanish Fly
  bordeaux, POSKOK Women rose/gold. Never bleed one product's world into another's page.
- **One product = one primary colour + neutral base.** The site is never gaudy.
- **Macedonian Cyrillic UI text**, matching the prototype copy. EN/SQ via i18n.
- Claude Code never edits the original handoff prototypes — changes go back to design.

---

## Potencijashop-Specific Rules

These take precedence when in conflict with generic guidance.

### The 5 Design Versions & the "Design Versions" admin screen

Five complete storefront designs exist and are all implemented as selectable themes:

| ID    | Folder                | Direction                      | Ad-safe                           |
| ----- | --------------------- | ------------------------------ | --------------------------------- |
| **A** | `verzija-A-svetla`    | Light cream, text-led          | yes (ad-* purged)                 |
| **Б** | `verzija-B-slikovna`  | Image-first                    | **only after purging `ad-*.jpg`** |
| **В** | `verzija-V-boja`      | One colour world per product   | **only after purging `ad-*.jpg`** |
| **Г** | `verzija-G-intimna`   | Warm, intimate, serif-led      | yes ← recommended                 |
| **Д** | `verzija-D-dobavuvac` | Navy + crimson pharma register | yes (supplier benchmark)          |

**CORRECTED BEHAVIOUR (overrides the prototype).** The prototype's "Дизајн верзии" screen
used per-version **traffic-split percentages** for A/B testing. **That is wrong for this
project.** The correct model:

- **Exactly one version is active at a time.** All visitors see that one version. There is
  **no percentage split**, no simultaneous multi-version serving.
- The admin screen shows all 5 versions as a **radio selection**. The active one is marked.
- Selecting another version and clicking **Активирај** stages the change; it goes live only
  on **Публикувај** (nothing auto-publishes), and then **every visitor immediately sees the
  new version** (Redis full-page cache purged on publish).
- Per-version **metrics stay visible** (visits, started, orders, conversion %, refused %) so
  the team can compare historically — but they are read-only stats, not a routing control.
  Refused % turns pink above 15%.
- Backend: a single `activeVersionId` setting (with `publishedVersionId` vs staged
  `draftVersionId`). The storefront reads the published active version and renders that theme
  for **all** requests. Store historical metrics per version keyed by the version a visitor
  saw at the time.
- Never remove the ability to switch back — activation is fully reversible.

### Products & the four-state stock machine

Four states, not two. This drives the storefront:

| State    | Storefront behaviour                                                 |
| -------- | -------------------------------------------------------------------- |
| `active` | Visible in menu and on home, orderable                               |
| `oos`    | Visible, CTA becomes **„Извести ме"**, collects phone numbers (Lead) |
| `soon`   | Visible with a **„Наскоро"** badge, collects interest, no ordering   |
| `hidden` | Removed from menu, page returns **404**                              |

Stock 0 auto-flips `active → oos`; raising stock above 0 flips it back. Each product row in
admin states, in plain language, what its current state does on the storefront. A per-product
warning threshold drives dashboard alerts. **POSKOK Women launches `soon`** (interest form),
and its catalogue row never borrows another product's photography.

### Orders (COD) & lifecycle

Guest-only, cash on delivery. Order in < 60s on mobile: landing → bundle → form → confirm.
Form: name, phone (**MK format validation, required**), city, address, optional email,
optional note, **consent checkbox**. Secondary path: session mini-cart → `/naracka`.

Status lifecycle (each with its own pill colour):

```
new → confirmed → packed → shipped → delivered → refused → cancelled
```

Because payment is on delivery, **refused rate is a primary metric** — tracked by product, by
city, and by design version. Orders in `new` get a left accent border; a phone appearing more
than once in 24h shows a duplicate warning. UTM params + fbclid captured from the URL on first
visit and bound to the order. Manual phone orders can be entered by an operator (channel =
`phone`) so all orders live in one place. CSV/XLSX export of the filtered set, UTF-8 **with
BOM** (Excel reads Cyrillic), configurable columns for the courier.

### Tracking — Pixel + CAPI + GA4 (mandatory architecture)

Every event fires **twice**: browser (Pixel) + server (Conversions API) with the **same
`event_id`** → Meta deduplicates. This is required, not optional. Server events go from the
Fastify backend through a **BullMQ queue with retry**, carrying `event_id`, `event_time`,
`client_ip`, `user_agent`, `fbp`/`fbc`, and **SHA-256-hashed** phone/name/city/email.

Event map: `PageView, ViewContent, AddToCart, InitiateCheckout, Contact, Lead, Purchase`.
Every event carries product name, value, `currency = MKD`, and the **active design version**
the visitor saw. **Purchase is server-authoritative.** GA4 mirrors the ecommerce events.

**Nothing fires before consent.** Cookie banner (MK/EN/SQ) with accept/reject, separate
toggles for statistics and marketing (Consent Mode). Required by the Macedonian personal-data
law and by GDPR for EU visitors. Definition of done: dedup verified in Meta Test Events,
EMQ ≥ 7 on Purchase, GA4 DebugView shows all events with correct values.

### Ad-safety (restricted category — account-ban risk)

Meta scans the **destination**, not just the creative. Rules that apply to all site copy:
allowed angle = energy, vitality, confidence, focus, endurance, intimacy, mood. Avoid
explicit sexual terms, performance guarantees, before/after claims, and personal-attribute
targeting. No medical claims, never the word "лек". Mandatory disclaimer on every landing and
footer (supplement, not a medicine).

The six `ad-*.jpg` files are **ad creatives with claims burned into the image**. They must
**never** appear on a storefront page — grounds for an ad-account ban. They exist only so the
media library can demonstrate flagging them. **The API must refuse to attach an ad-unsafe
image to a product page** — a UI checkbox alone is not enough. Purge `ad-*` references from
versions Б and В before either goes live.

### Media library

Named image slots per product (`img, heroImg, packImg, problemImg, ingImg, bandImg` + a 3–5
image gallery), not a free pile. Drag-and-drop upload (JPG/PNG to 4 MB, auto WebP/AVIF). Every
image has an **ad-safe flag** and a required **alt** field. Show empty slots and recommended
dimensions. Known content gaps: MAX ERECT has one clean photo; POSKOK Women has none — handle
with a reduced gallery + explanatory note.

### Content editing (per language)

Every landing field is editable per product, per language, with a live `used / max` counter
(limits enforced **server-side** too — an over-long headline breaks the layout). Product
fields: `h1, lead, short, socialProof, heroCta, problemTitle, problemText, ingTitle, ingNote,
bandText, finalTitle, finalText, maker`. Page modes: Home / Cart / Checkout / Thank-you /
Cookies / Legal. Draft → Preview (tokenised URL) → Publish (cache purge for that page/locale);
last 10 publishes kept with rollback.

### i18n (MK / EN / SQ)

Macedonian is the default at root (`/`); English at `/en/...`; Albanian at `/sq/...`. **Every**
editable CMS field exists per language (three tabs MK/EN/SQ). Missing translation → fall back
to MK + an "непреведено" flag in admin. `hreflang` tags; `html lang` per version; prices in
MKD everywhere. The language switcher preserves the current page.

### Roles & admin auth

| Role               | Can                                     | Cannot                                |
| ------------------ | --------------------------------------- | ------------------------------------- |
| Owner (Сопственик) | Everything: prices, integrations, users | —                                     |
| Editor (Уредник)   | Text, images, stock, product state      | Prices, integrations, customer export |
| Operator           | Orders: status, note, call, shipping    | Content, prices, settings             |

Real auth: email + password (bcrypt/argon2), **2FA for the owner on every new sign-in**,
30-minute idle logout, full activity log. Re-validate role at the controller, never only in
middleware.

### Email & operator alerts — three automatic messages

| Message               | To                        | When                  |
| --------------------- | ------------------------- | --------------------- |
| New order             | Shop (up to 3 addresses)  | Immediately on submit |
| Customer confirmation | Customer (if email given) | Immediately           |
| Shipment on the way   | Customer                  | On status → `shipped` |

Plus an SMS/Viber alert to the operator on every new order (email is checked less often). Log
every send with its result. **Subject lines must be discreet** — order number only, no product
names, no explicit words.

### Pricing, bundles, discounts

Prices in MKD, formatted `mk-MK`, suffix `ден.`. Default unit price context: POSKOK 990 ден.
(confirm others). Shipping cost + free-shipping threshold configurable in admin. Bundles per
product (1× / 2×+1 free / 3×, middle preselected as „Најпродаван"). Time-boxed % or fixed
discounts show a struck-through previous price and auto-revert on expiry. **Struck-through
prices must reflect a real previous price** (consumer-protection). Coupons are Phase 2.

### Domain strategy

`potencijashop.mk` is primary. `poskok.mk` → `301` → `potencijashop.mk/poskok` preserving all
query params (Caddy). `www` → non-www. Meta ads use direct `potencijashop.mk/...` URLs.

---

## Delivery Phases

| Phase             | Scope                                                                                                                                                                                                                                                                          | Outcome                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| **0. Prep**       | Final prices/bundles, manufacturer declarations, MK/EN/SQ copy, product photos, tokens extracted from prototypes                                                                                                                                                               | Approved content + design direction |
| **1. MVP launch** | Home + 4 landings (MK/EN/SQ) + order form + mini-cart + thank-you + admin (orders, products/prices/bundles/discounts, content, media + ad-safe flag, marketing Pixel/CAPI/GA4 behind consent, settings, users, **design versions single-active**) + legal + poskok.mk redirect | Live sales with full tracking       |
| **2. Expansion**  | Full CAPI hardening + per-version metrics + refused-rate by city + content rollback + coupons + courier label printing + activity log + backups                                                                                                                                | Full autonomy + scaling             |
| **3. Options**    | Card payment, courier API, upsell/cross-sell automation, hero/offer A/B                                                                                                                                                                                                        | AOV + CPA optimization              |

---

## Acceptance Criteria (Definition of Done)

- 4 landing pages live (MK, with EN/SQ), full block structure, content editable from admin.
- Order in < 60s on mobile: landing → bundle → form → confirm.
- Mini-cart works with multiple products and a single checkout.
- Admin price/discount/bundle change visible on the site < 1 minute after publish/purge.
- Tracking verified: Pixel + CAPI dedup, EMQ ≥ 7 on Purchase, GA4 ecommerce in DebugView.
- `poskok.mk` → `301` → `/poskok` with query params preserved.
- Lighthouse mobile Performance ≥ 90 and LCP < 1.8s on every landing.
- Courier report exports as CSV/XLSX with configurable columns (UTF-8 BOM).
- Language switcher with correct hreflang; MK fallback for untranslated fields.
- Legal pages + disclaimer + consent banner present in all languages.
- **Design versions:** exactly one active version serves all visitors; admin can swap it in
  one click + publish; the ad-unsafe images never reach a product page.

---

## Open Items (close before / during development)

1. Final prices per product and bundle (POSKOK 990 ден. confirmed — others?).
2. Legal selling entity for footer/terms (ЕДБ/ЕМБС).
3. Official product declarations/ingredients from PP Products (mandatory before publish).
4. Order phone number + Viber/WhatsApp accounts.
5. Courier — undecided; blocks shipping fields and label format.
6. Courier report column format (sample file from the courier).
7. Shipping cost + free-shipping threshold values.
8. POSKOK Women: ingredients, packaging, availability date (launches `soon` until then).
9. Manufacturer permission for supplier photography / customer-count figure (version Д).
10. Real video URL for version Д's video slot.

---

_This file is the living constitution of the Potencijashop.mk project._
_Adapted from the GoDigital Agency OS constitution. Stack: Astro (storefront) +
React 19/Vite (admin) + Fastify + Prisma + PostgreSQL + Redis + BullMQ, on Hetzner VPS + Caddy._
_Last updated: 2026-08-25._
