# Staging deployment (staging.filtervoda.mk)

Isolated subdomain (ADR-004): HTTPS + HTTP basic auth + `noindex`, its own `.env.staging`, its
own Pixel test dataset. Never share cookies/analytics with production.

## Setup

1. DNS: `staging.filtervoda.mk` → VPS IP.
2. Certbot: `certbot certonly --webroot -w /var/www/certbot -d staging.filtervoda.mk`.
3. Basic auth file on the host: `htpasswd -c /etc/nginx/.htpasswd spar` (mounted into nginx).
4. `.env.staging` with `META_TEST_EVENT_CODE` set, `TURNSTILE_*` staging keys.
5. Use `nginx/staging.conf`.

## Deploy

```bash
bash scripts/deploy.sh staging         # deploys origin/develop
```

## Verify before promoting to production

- Login works (all 3 roles); CLIENT_VIEWER sees only Lead-ови.
- Submit a B2C lead → email arrives (check inbox), lead visible in admin.
- Template swap in „Дизајн и темплејти" changes the public site.
- Meta Test Events shows deduped `Lead` (browser + CAPI, same `event_id`); GA4 DebugView green.
- `bash scripts/redirect-check.sh https://staging.filtervoda.mk` passes.

Only after staging is green: open the Release PR `develop → main` and deploy production.
