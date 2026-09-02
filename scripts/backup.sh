#!/usr/bin/env bash
# Daily backup (cron on the VPS): pg_dump → Hetzner Storage Box, 30-day retention.
# Runbook: _docs/deployment/production.md. Test restore monthly.
set -euo pipefail

COMPOSE="docker-compose.prod.yml"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/db-$STAMP.sql.gz"
mkdir -p backups

docker compose -f "$COMPOSE" exec -T postgres pg_dump -U "${POSTGRES_USER:-filtervoda}" "${POSTGRES_DB:-filtervoda}" | gzip > "$OUT"
echo "✔ Backup → $OUT"

# Upload to Storage Box (configure SSH/rsync target in .env.production).
if [ -n "${STORAGE_BOX_TARGET:-}" ]; then
  rsync -az "$OUT" "$STORAGE_BOX_TARGET/"
fi

# Retain 30 days locally.
find backups -name 'db-*.sql.gz' -mtime +30 -delete
