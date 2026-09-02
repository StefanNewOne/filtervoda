#!/usr/bin/env bash
# Smoke-check the legacy redirect map (Прилог Ѓ): every old URL should 301 to a 200.
# Usage: bash scripts/redirect-check.sh https://filtervoda.mk
set -euo pipefail
BASE="${1:-http://localhost}"

# A few representative legacy URLs from the seed redirect map.
URLS=(
  "/produkt/spar-crystal-digital/"
  "/produkt/spar-crystal-smart/"
  "/produkt/aqua-glass-sistem-za-filtracija-na-voda/"
)

fail=0
for u in "${URLS[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$u")
  final=$(curl -sL -o /dev/null -w '%{http_code}' "$BASE$u")
  if [ "$code" = "301" ] && [ "$final" = "200" ]; then
    echo "✔ $u → 301 → 200"
  else
    echo "✖ $u → $code (final $final)"; fail=1
  fi
done
exit $fail
