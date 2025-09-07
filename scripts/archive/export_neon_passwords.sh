#!/usr/bin/env bash
# export_neon_passwords.sh
# v1.0.0 — Generate random passwords for Neon roles and update env + .pgpass.

set -euo pipefail

NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"

APP_USER="${APP_USER:-shadowcheck_app}"
ADMIN_USER="${ADMIN_USER:-sigint_admin}"

# Generate 24-char random base64 passwords (safe for Postgres)
APP_PASS="$(openssl rand -base64 18)"
ADMIN_PASS="$(openssl rand -base64 18)"

export APP_PASS ADMIN_PASS

echo "== Generated new random passwords =="
echo "APP_USER   ($APP_USER):   $APP_PASS"
echo "ADMIN_USER ($ADMIN_USER): $ADMIN_PASS"
echo "These are also exported into your shell environment."

PGPASS_FILE="$HOME/.pgpass"
touch "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

# Remove old lines for these users
grep -v -E "^${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${APP_USER}:" "$PGPASS_FILE" | \
grep -v -E "^${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${ADMIN_USER}:" > "${PGPASS_FILE}.tmp" || true
mv "${PGPASS_FILE}.tmp" "$PGPASS_FILE"

# Add new entries
{
  echo "${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${APP_USER}:${APP_PASS}"
  echo "${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${ADMIN_USER}:${ADMIN_PASS}"
} >> "$PGPASS_FILE"

chmod 600 "$PGPASS_FILE"

echo "== ~/.pgpass updated with new credentials =="
echo "Run ./setup_neon_psql_clients.sh next to verify connections."
