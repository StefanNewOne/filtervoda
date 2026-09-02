# ADR-002 — Background jobs: transactional outbox + node-cron

- **Status:** Accepted
- **Date:** 2026-09-01
- **Refs:** PRD §12.8, CLAUDE.md (filtervoda-Specific Rules → Lead system)

## Context

Every lead triggers external side effects (shop email, autoreply, Meta CAPI, optional webhook
and Telegram/Viber). These must never run in the HTTP request path, must survive restarts, and
must not double-fire. BullMQ is not on the approved dependency list; Redis is a cache, not a
job broker here.

## Decision

**Transactional outbox + node-cron.** On lead submit, an `OutboxJob` row is written in the
**same DB transaction** as the `Lead` (+ `LeadEvent`, `AuditLog`). A processor runs inside the
`api` process via `node-cron` (`*/30 * * * * *`) plus an immediate `setImmediate` kick after
insert (typical latency < 5s; cron is the safety net). Jobs are claimed with
`SELECT … FOR UPDATE SKIP LOCKED` and a `lockedAt` 5-min timeout — idempotent and safe across
restarts / two instances.

- Backoff: 1m → 5m → 15m → 1h → 6h; after `OUTBOX_MAX_ATTEMPTS` (5) → `DEAD`, `error` log,
  visible in admin „Проблеми со испорака" with a retry button.
- Each cron has an HTTP trigger `GET /api/v1/cron/<job>?secret=` with `?test=1` dry-run.
- Meta CAPI codes 4/17/32/613 → backoff 5s/15s/30s, `warn` log; CAPI failure does not block the
  email job (independent rows).

BullMQ is acceptable **only** if the Tech Lead justifies need (e.g. > 10 000 jobs/day) — then a
separate `worker` service and dependency approval.

## Consequences

No new infra. Slightly more code than a hosted queue, but full control, idempotency, and
visibility in the admin.
