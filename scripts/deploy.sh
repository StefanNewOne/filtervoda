#!/usr/bin/env bash
# Deploy from a trusted machine (CLAUDE.md Category 5). No GitHub Actions.
#   bash scripts/deploy.sh staging     # deploys origin/develop
#   bash scripts/deploy.sh production   # deploys origin/main
# Flow: backup DB → capture HEAD → reset → build → migrate → health → rollback on failure.
set -euo pipefail

TARGET="${1:-}"
case "$TARGET" in
  staging)    REF="origin/develop"; COMPOSE="docker-compose.prod.yml" ;;
  production) REF="origin/main";    COMPOSE="docker-compose.prod.yml" ;;
  *) echo "Usage: bash scripts/deploy.sh [staging|production]"; exit 1 ;;
esac

echo "▶ Deploying $TARGET from $REF"
PRE_HEAD="$(git rev-parse HEAD)"
BACKUP="backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p backups

echo "▶ Backing up database → $BACKUP"
docker compose -f "$COMPOSE" exec -T postgres pg_dump -U "${POSTGRES_USER:-filtervoda}" "${POSTGRES_DB:-filtervoda}" > "$BACKUP"

rollback() {
  echo "✖ Deploy failed — rolling back to $PRE_HEAD"
  git reset --hard "$PRE_HEAD"
  docker compose -f "$COMPOSE" up -d --build
  echo "▶ Restoring database from $BACKUP"
  docker compose -f "$COMPOSE" exec -T postgres psql -U "${POSTGRES_USER:-filtervoda}" "${POSTGRES_DB:-filtervoda}" < "$BACKUP"
  exit 1
}
trap rollback ERR

echo "▶ Fetching + resetting to $REF"
git fetch --all --prune
git reset --hard "$REF"

echo "▶ Building + starting containers"
docker compose -f "$COMPOSE" up -d --build

echo "▶ Reloading Nginx"
docker compose -f "$COMPOSE" exec nginx nginx -s reload || true

echo "▶ Waiting for API health"
for i in $(seq 1 30); do
  if docker compose -f "$COMPOSE" exec -T api wget -qO- http://localhost:3001/api/v1/health | grep -q '"status":"ok"'; then
    echo "✔ Healthy"
    trap - ERR
    echo "✔ Deploy $TARGET complete"
    exit 0
  fi
  sleep 2
done

echo "✖ Health check timed out"
rollback
