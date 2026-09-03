#!/usr/bin/env bash
# filtervoda.mk — Docker deploy to the Hostinger VPS (mirrors the sister potencijashop setup).
# Ships the committed tree (git archive — no node_modules/secrets), installs Docker if missing,
# brings up the full stack via docker-compose.prod.yml (Caddy auto-TLS), runs migrations + seed,
# and health-checks. Idempotent — safe to re-run for updates.
#
#   bash scripts/deploy-vps.sh          # deploys the current committed HEAD
#
# Requires .env.production with: VPS_IP, DEPLOY_SSH_USER, (DEPLOY_SSH_PRIVATE_KEY), SITE_DOMAIN.
set -euo pipefail

ENV_FILE=".env.production"
[[ -f "$ENV_FILE" ]] || { echo "✗ missing $ENV_FILE (copy from .env.production.example)"; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${VPS_IP:?VPS_IP required in .env.production}"
: "${DEPLOY_SSH_USER:?DEPLOY_SSH_USER required}"
: "${SITE_DOMAIN:?SITE_DOMAIN required}"

REMOTE="${DEPLOY_SSH_USER}@${VPS_IP}"
REMOTE_DIR="/srv/filtervoda"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new)
[[ -n "${DEPLOY_SSH_PRIVATE_KEY:-}" ]] && SSH_OPTS+=(-i "${DEPLOY_SSH_PRIVATE_KEY}")

echo "▶ deploy filtervoda → ${VPS_IP}  (domain: ${SITE_DOMAIN})"

# 1) LOCAL: pack the committed tree (clean — no node_modules, no .env, no build output).
TAR="$(mktemp -t fv.XXXXXX).tar.gz"
git archive --format=tar.gz -o "$TAR" HEAD
echo "  packed $(du -h "$TAR" | cut -f1) archive"

# 2) Ship the archive + the production env file.
scp "${SSH_OPTS[@]}" "$TAR" "${REMOTE}:/tmp/fv.tar.gz" >/dev/null
scp "${SSH_OPTS[@]}" "$ENV_FILE" "${REMOTE}:/tmp/fv.env" >/dev/null
rm -f "$TAR"
echo "  shipped archive + env"

# 3) SERVER: install Docker if missing, unpack, bring up the stack, migrate, seed, health-check.
ssh "${SSH_OPTS[@]}" "$REMOTE" bash -euo pipefail -s <<REMOTE
  REMOTE_DIR="${REMOTE_DIR}"

  # Docker (idempotent).
  if ! command -v docker >/dev/null 2>&1; then
    echo "  installing Docker…"
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
  fi
  docker compose version >/dev/null 2>&1 || { echo "✗ docker compose plugin missing"; exit 1; }

  # Unpack the new code over the checkout (keep volumes/env).
  mkdir -p "\$REMOTE_DIR"
  tar xzf /tmp/fv.tar.gz -C "\$REMOTE_DIR"
  mv -f /tmp/fv.env "\$REMOTE_DIR/.env.production"
  rm -f /tmp/fv.tar.gz
  cd "\$REMOTE_DIR"

  echo "  building + starting containers (first run pulls images + builds — a few minutes)…"
  docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

  # Wait for Postgres, then migrate + seed inside the api container.
  # NOTE: every \`exec -T\` MUST redirect stdin from /dev/null — otherwise it consumes the rest
  # of THIS heredoc as its own stdin and the following commands never run.
  DC="docker compose --env-file .env.production -f docker-compose.prod.yml"
  echo "  waiting for database…"
  for i in \$(seq 1 30); do
    if \$DC exec -T postgres pg_isready -U "\${POSTGRES_USER:-filtervoda}" </dev/null >/dev/null 2>&1; then break; fi
    sleep 2
  done
  echo "  running migrations…"
  \$DC exec -T api npx prisma migrate deploy --schema prisma/schema.prisma </dev/null
  echo "  seeding (idempotent)…"
  \$DC exec -T api npm run seed </dev/null || true

  # Health check via the api container (127.0.0.1, not localhost → avoid IPv6 ::1 refusal).
  echo "  health check…"
  ok=0
  for i in \$(seq 1 20); do
    if \$DC exec -T api wget -qO- http://127.0.0.1:3001/api/v1/health </dev/null 2>/dev/null | grep -q '"status":"ok"'; then ok=1; break; fi
    sleep 3
  done
  [ "\$ok" = 1 ] && echo "  ✔ api healthy" || { echo "  ✗ api health check failed"; \$DC logs --tail=40 api; exit 1; }
REMOTE

echo "✔ deploy complete → https://${SITE_DOMAIN}"
echo "  storefront: https://${SITE_DOMAIN}/"
echo "  admin:      https://${SITE_DOMAIN}/admin/"
echo "  (first TLS cert may take ~30s to issue)"
