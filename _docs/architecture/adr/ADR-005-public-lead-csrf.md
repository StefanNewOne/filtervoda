# ADR-005 — CSRF policy for the public lead endpoint

- **Status:** Accepted
- **Date:** 2026-09-01
- **Refs:** PRD §12.7, §11.5

## Context

`POST /api/v1/leads` is public and **session-less**, so a classic double-submit CSRF token has
nothing to bind to. Admin write routes, by contrast, are authenticated and can use CSRF tokens.

## Decision

- **Admin write routes:** `csrf-csrf` double-submit cookie + header (replaces deprecated
  `csurf`).
- **Public `POST /leads`:** no CSRF token. Protected instead by:
  1. **Origin/Referer allowlist** against `PUBLIC_SITE_URL`,
  2. **Cloudflare Turnstile** token (server-verified; `TURNSTILE_DEV_BYPASS` for local),
  3. **Rate limit** (5 / 10 min / IP and 20 / 24 h / IP) + honeypot field,
  4. Server-side Zod validation + MK phone validation.

## Consequences

Public form stays frictionless (no session) while abuse is bounded by Turnstile + rate limit +
origin checks. Fake-lead risk is mitigated without a login wall.
