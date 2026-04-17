#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

USERS_PER_BATCH="${USERS_PER_BATCH:-0}"
PREFIX="${PREFIX:-batch}"
OUTPUT="${OUTPUT:-./users/generated-batch-credentials.csv}"

mkdir -p "$(dirname "$OUTPUT")"
echo "username,password,group" > "$OUTPUT"

for i in $(seq -w 1 25); do
  group="$PREFIX-$i"
  echo "Ensuring group exists: $group"
  if ! "$SCRIPT_DIR/occ.sh" group:info "$group" >/dev/null 2>&1; then
    "$SCRIPT_DIR/occ.sh" group:add "$group"
  fi

  if [[ "$USERS_PER_BATCH" -gt 0 ]]; then
    for u in $(seq -w 1 "$USERS_PER_BATCH"); do
      username="${PREFIX}${i}u${u}"
      if "$SCRIPT_DIR/occ.sh" user:info "$username" >/dev/null 2>&1; then
        "$SCRIPT_DIR/occ.sh" group:adduser "$group" "$username" || true
        continue
      fi

      password="$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%^&*()_+=-' </dev/urandom | head -c 16)"
      echo "Creating $username in $group"
      "$SCRIPT_DIR/occ.sh" user:add \
        --password-from-env \
        --display-name="${PREFIX^^} $i USER $u" \
        --group="$group" \
        "$username" <<<"$password"

      echo "$username,$password,$group" >> "$OUTPUT"
    done
  fi
done

echo "Batch provisioning complete. Credentials (if generated): $OUTPUT"
