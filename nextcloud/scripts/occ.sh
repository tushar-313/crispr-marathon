#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

if [[ $# -eq 0 ]]; then
  echo "Usage: ./scripts/occ.sh <occ arguments>"
  exit 1
fi

docker compose exec -T --user www-data app php occ "$@"
