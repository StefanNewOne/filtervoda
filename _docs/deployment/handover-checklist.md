# Production handover checklist — filtervoda.mk

Status of the codebase at handover and the exact steps to go live. See also `production.md`,
`staging.md`, `local.md`.

## ✅ Done (verified)

- **Security**: RBAC + CLIENT_VIEWER isolation (tested), rate limits on every endpoint, CSRF
  (admin) + Origin allowlist + Turnstile + honeypot (public lead), Zod validation, parameterized
  SQL, bcrypt cost 12 + account lockout, session in Postgres (httpOnly/secure/SameSite), fresh
  re-auth for destructive ops, PII hashing + no PII in logs, append-only audit, file-upload
  hardening (sharp re-encode, mime allowlist, no SVG, 4 MB), helmet on API, **CSP + X-Frame +
  Referrer + HSTS on the storefront via Nginx**, tenant guard on read+update+delete, timing-safe
  cron secret, blog HTML sanitized on save, JSON-LD escaped.
- **Dependencies**: `npm audit --omit=dev` → **0 vulnerabilities** (production tree clean).
  nodemailer 9, sharp 0.35, node-cron 4. (Remaining audit items are dev-only tooling: esbuild/
  vitest/react-router dev — not shipped.)
- **Tests**: all suites run green — shared 16, api 12 unit + 7 integration (lead txn, outbox,
  auth lockout, no-enumeration), web 7, admin 4. Integration: `npm run test:integration
  --workspace apps/api` against a test DB. E2E specs in `e2e/` (Playwright).
- **Quality**: 4 workspaces `tsc` clean, ESLint 0/0.
- **Design**: 3 templates pixel-accurate to the approved prototypes; self-hosted fonts (84
  woff2, cyrillic+latin); real product photos wired.
- **Build**: apps are self-contained (tokens copied into each app) so prod Docker builds don't
  depend on `_docs`. `.dockerignore` prevents `.env`/node_modules/.git leaking into images.
- **Git**: initialized, `main` + `develop` branches, initial commit.

## ⛔ Must do before go-live (deployer / client)

1. **Secrets** — create `.env.production` on the server (never commit) with strong random values:
   `SESSION_SECRET` (32+), `CRON_SECRET`, `IP_HASH_SECRET`, `PREVIEW_SECRET`, DB creds. Set
   `NODE_ENV=production`, `PUBLIC_SITE_URL=https://filtervoda.mk`.
2. **Turnstile** — real `TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`; **do NOT set
   `TURNSTILE_DEV_BYPASS`** (it must be off in prod).
3. **Email** — production SMTP (`SMTP_*`, `MAIL_FROM`, `NOTIFY_EMAILS`); SPF/DKIM/DMARC on the domain.
4. **Tracking** — real `GA4_ID`, `GTM_ID`, `META_CAPI_TOKEN` (Pixel ID already 1957593378149639),
   verify Meta Test Events dedup + GA4 DebugView after deploy.
5. **Media driver** — decide `STORAGE_DRIVER` for prod: `s3` (MinIO/Hetzner) or `cloudinary`
   (`[D-6]`); set the corresponding keys + `CDN_BASE_URL`. (Local uses `local` filesystem.)
6. **Hosting/DNS/TLS** — Hetzner VPS, DNS for `filtervoda.mk` + `www` + `staging.`, Certbot certs
   (see `production.md`), then `bash scripts/deploy.sh staging` → verify → `... production`.
7. **Backups** — enable the daily `backup.sh` cron → Hetzner Storage Box; run one restore test.
8. **Remote GitHub** — add the remote and push `main`/`develop`; enable Dependabot.
9. **Content** — replace placeholder product specs/FAQ/testimonials with the client's real data;
   confirm the `[потврди]` spec placeholders and final prices.

## 🔶 Recommended (SHOULD, not blocking)

- Increase test coverage toward the CLAUDE.md targets (70% api / 60% frontend) — current tests
  cover the critical security/business paths; CRUD routes and components need more.
- Wire or remove the draft **preview token** (`GET /admin/products/:id/preview-token` is generated
  but the web SSR preview route that verifies it is not built yet).
- Reset-token: make consume atomic (`updateMany where usedAt null`) and destroy sessions on reset.
- Full OpenAPI generation from Zod (`/api/docs` currently ships a minimal hand-authored spec).
- Confirm Nginx **replaces** (not appends) `X-Forwarded-For` so per-IP limits/ipHash are accurate.
- Rotate to Sentry (`SENTRY_DSN`) + uptime monitoring.

## Smoke tests after each deploy

```bash
curl -s https://filtervoda.mk/api/v1/health          # {"status":"ok"}
bash scripts/redirect-check.sh https://filtervoda.mk  # legacy 301 → 200
# submit a test lead → confirm the shop email arrives; open /admin and change a lead status
# swap the active template in admin „Дизајн и темплејти" → confirm the public site changes
```
