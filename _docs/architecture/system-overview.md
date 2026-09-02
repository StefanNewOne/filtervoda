# System Overview — filtervoda.mk

Source of truth for architecture. See ADRs for individual decisions.

## Topology

```
Visitor ──HTTPS──▶ Nginx (Certbot) ─┬─ /          ──▶ web (RR7 SSR on Node) ──(docker net)──▶ api
                                    ├─ /admin/     ──▶ admin (static SPA build)
                                    ├─ /api/v1/    ──▶ api (Express 5) ──▶ PostgreSQL 16 (data + sessions + outbox + audit)
                                    │                       ├──▶ Redis 7 (page/data cache, rate limit)
                                    │                       ├──▶ node-cron: process-outbox (30s) → SMTP · Meta CAPI · Webhook · Telegram
                                    │                       │             anonymize-leads (daily) · cleanup-sessions · daily-digest
                                    │                       └──▶ StorageService → Cloudinary | MinIO/S3 (+ Bunny CDN)
                                    └─ /api/docs   ──▶ Swagger UI (local; behind admin session / off in prod)

Browser (after consent): GTM → GA4 + Meta Pixel (event_id shared with server CAPI)
```

## Applications

- **apps/web** — public storefront. React Router 7 framework mode (SSR). Reads a **template
  provider** (`design.activeTemplate` + per-template token overrides from `Setting`) and renders
  one of the 3 themes for all visitors. Redis page cache, invalidated on publish.
- **apps/admin** — React Router 7 SPA behind `/admin/`. Custom lightweight CMS.
- **apps/api** — Express 5 + Prisma. Public read (cached), auth, lead intake (transactional
  outbox), admin CRUD, cron HTTP triggers. AuthN + AuthZ in middleware **and** every controller.
- **packages/shared** — Zod schemas (single source), TS types, constants, MK phone → E.164.

## Core flows

- **Lead intake:** validate (Zod + phone + honeypot + Turnstile + origin + rate limit) → one
  transaction: `Lead` + `LeadEvent(CREATED)` + `OutboxJob`(s) + `AuditLog` → `setImmediate`
  outbox kick. External calls never in request path.
- **Publish:** admin mutation → `AuditLog` + Redis cache invalidation for affected pages.
- **Template activation:** set `design.activeTemplate` → publish → purge page cache → all
  visitors see the new theme (`template.activated`).

## Data retention (declared per table)

| Table | Retention |
| --- | --- |
| `Lead` PII (name, phone, email, message, company) | 24 months → cron `anonymize-leads` replaces with `[анонимизирано]`; stats stay |
| `Lead.ipHash` | 30 days |
| `OutboxJob` (`DONE`) | 30 days; `DEAD` until manually closed |
| `AuditLog` | forever; snapshots contain no PII |
| `Session` | until expiry (30-day sliding); cron `cleanup-sessions` |
| Redis rate-limit keys | TTL 10 min / 24 h |

## Multi-tenant

`tenantId Int @default(1)` on every primary table; a Prisma client extension injects the tenant
predicate; a guard test fails if any model query omits it. Single tenant (SPAR) today; the code
is a reusable lead-gen engine (PRD §0.5).

## Environments

local (Docker, HTTP) → staging (`staging.filtervoda.mk`, HTTPS + basic auth + noindex, ADR-004)
→ production (`filtervoda.mk`). Configs never mixed; secrets Zod-validated at startup.
