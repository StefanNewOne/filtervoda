# Production deployment (Hetzner VPS + Nginx + Certbot)

TLS is always on (HSTS). Deploy from a trusted machine with `scripts/deploy.sh` — no GitHub
Actions. The VPS pulls source from Git.

## One-time server setup

1. Install Docker + Docker Compose plugin, and Certbot on the host.
2. Point DNS: `filtervoda.mk` and `www.filtervoda.mk` → VPS IP.
3. Issue certificates (webroot or standalone):
   ```bash
   certbot certonly --webroot -w /var/www/certbot -d filtervoda.mk -d www.filtervoda.mk
   ```
   Certs land in `/etc/letsencrypt/live/filtervoda.mk/` (mounted read-only into the nginx container).
4. Create `.env.production` on the server (never committed) with all secrets from `.env.example`
   plus `POSTGRES_USER/PASSWORD/DB`. Secrets are Zod-validated at API startup.
5. Certbot auto-renew: `certbot renew` via systemd timer; reload nginx on renewal.

## Deploy

```bash
bash scripts/deploy.sh production      # deploys origin/main
```

The script: backs up the DB → captures HEAD → `git reset --hard origin/main` →
`docker compose -f docker-compose.prod.yml up -d --build` → reloads Nginx →
`prisma migrate deploy` (in the api image CMD) → health-checks `/api/v1/health` →
**rolls back git + DB restore on any failure**. Staging must be verified first.

## Backups & restore (runbook)

- Daily `bash scripts/backup.sh` (cron) → `pg_dump | gzip` → Hetzner Storage Box, 30-day retention.
- **Monthly restore test:** spin a throwaway Postgres, `gunzip < db-YYYY….sql.gz | psql`, verify row counts.
- Media: if self-hosted (MinIO), back up the bucket volume too; Cloudinary is managed.

## Secret rotation

Rotate `SESSION_SECRET`, `CRON_SECRET`, `META_CAPI_TOKEN`, DB password on a schedule. Update
`.env.production`, `docker compose up -d` to restart with new values. Rotating `SESSION_SECRET`
invalidates sessions (users re-login) — acceptable.

## Smoke tests after deploy

```bash
bash scripts/redirect-check.sh https://filtervoda.mk    # legacy 301 → 200
curl -s https://filtervoda.mk/api/v1/health             # {"status":"ok"}
curl -s https://filtervoda.mk/proizvodi/spar-crystal-digital-600hf | grep -q application/ld+json
```
