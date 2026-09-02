# ADR-004 — Staging on a subdomain (not a path)

- **Status:** Accepted (conscious deviation from Agency OS path-based staging)
- **Date:** 2026-09-01
- **Refs:** PRD §0.2 (#18), §11.6

## Context

Agency OS default is path-based staging (`goai.mk/staging`). A public marketing site needs
isolation of SEO signals, cookies, and the Meta Pixel — a shared path risks indexing staging,
cross-cookie leakage, and polluting the production Pixel dataset.

## Decision

Staging runs on **`staging.filtervoda.mk`** with:

- HTTP **basic auth** in front of everything,
- `X-Robots-Tag: noindex` + `robots.txt` disallow,
- its own env (`.env.staging`), its own Pixel test dataset / `META_TEST_EVENT_CODE`,
- separate cookies (distinct domain).

## Consequences

One extra DNS record and Nginx server block. Cleaner separation; production analytics and SEO
stay uncontaminated. Staging must be verified before every production release.
