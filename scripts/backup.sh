#!/usr/bin/env bash
# Backup (cron on the VPS or pre-deploy): pg_dump + admin-uploaded media, 30-day retention.
# Runs ON the VPS from /srv/filtervoda. Runbook: _docs/deployment/production.md.
set -euo pipefail

COMPOSE="docker-compose.prod.yml"
DC="docker compose --env-file .env.production -f $COMPOSE"
STAMP="$(date +%Y%m%d-%H%M%S)"
DB_OUT="backups/db-$STAMP.sql.gz"
UP_OUT="backups/uploads-$STAMP.tar.gz"
mkdir -p backups

# 1) Database.
$DC exec -T postgres pg_dump -U "${POSTGRES_USER:-filtervoda}" "${POSTGRES_DB:-filtervoda}" | gzip > "$DB_OUT"
echo "✔ DB → $DB_OUT"

# 2) Admin-uploaded media (the persistent uploads volume). Empty tar is fine on a fresh site.
$DC exec -T api sh -c 'tar czf - -C apps/api/uploads . 2>/dev/null' > "$UP_OUT" || true
echo "✔ uploads → $UP_OUT ($(du -h "$UP_OUT" 2>/dev/null | cut -f1))"

# Upload off-box if a target is configured (e.g. Hetzner Storage Box).
if [ -n "${STORAGE_BOX_TARGET:-}" ]; then
  rsync -az "$DB_OUT" "$UP_OUT" "$STORAGE_BOX_TARGET/"
fi

# Retain 30 days locally.
find backups -name 'db-*.sql.gz' -mtime +30 -delete
find backups -name 'uploads-*.tar.gz' -mtime +30 -delete
