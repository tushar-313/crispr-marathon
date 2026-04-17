#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

APPS=(
  calendar
  contacts
  tasks
  notes
  deck
  bookmarks
  groupfolders
  richdocuments
  twofactor_totp
)

for app in "${APPS[@]}"; do
  echo "Installing and enabling app: $app"
  if "$SCRIPT_DIR/occ.sh" app:install "$app"; then
    "$SCRIPT_DIR/occ.sh" app:enable "$app" || true
  else
    echo "Skipping $app (not available in current app store/channel)."
  fi
done

echo "Extension setup complete."
