#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<'EOF'
Usage: ./scripts/provision_users_from_csv.sh <csv-file>

CSV format (header required):
username,display_name,email,group,password

If password is empty, a random one is generated.
EOF
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

CSV_FILE="$1"

if [[ ! -f "$CSV_FILE" ]]; then
  echo "CSV file not found: $CSV_FILE"
  exit 1
fi

TMP_CREDS="${CSV_FILE%.csv}.generated-passwords.csv"
echo "username,password" > "$TMP_CREDS"

tail -n +2 "$CSV_FILE" | while IFS=',' read -r username display_name email group password; do
  username="${username//[$'\t\r\n ']/}"
  group="${group//[$'\t\r\n ']/}"

  if [[ -z "$username" || -z "$group" ]]; then
    echo "Skipping malformed row with empty username/group."
    continue
  fi

  if [[ -z "$password" ]]; then
    password="$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%^&*()_+=-' </dev/urandom | head -c 16)"
    echo "$username,$password" >> "$TMP_CREDS"
  fi

  if ! "$SCRIPT_DIR/occ.sh" group:info "$group" >/dev/null 2>&1; then
    "$SCRIPT_DIR/occ.sh" group:add "$group"
  fi

  if "$SCRIPT_DIR/occ.sh" user:info "$username" >/dev/null 2>&1; then
    echo "User exists, ensuring group membership: $username"
    "$SCRIPT_DIR/occ.sh" group:adduser "$group" "$username" || true
  else
    echo "Creating user: $username"
    "$SCRIPT_DIR/occ.sh" user:add \
      --password-from-env \
      --display-name="$display_name" \
      --group="$group" \
      "$username" <<<"$password"
  fi

  if [[ -n "$email" ]]; then
    "$SCRIPT_DIR/occ.sh" user:setting "$username" settings email "$email" || true
  fi
done

echo "Provisioning complete. Generated passwords (if any): $TMP_CREDS"
