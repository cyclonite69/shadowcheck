#!/usr/bin/env bash
# alter_neon_role_passwords.sh
# v1.0.0 — Sync Neon role passwords to local values (env or ~/.pgpass) and verify.

set -euo pipefail

NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"

OWNER_USER="${OWNER_USER:-neondb_owner}"
APP_USER="${APP_USER:-shadowcheck_app}"
ADMIN_USER="${ADMIN_USER:-sigint_admin}"

PGPASS_FILE="${PGPASS_FILE:-$HOME/.pgpass}"

# --- Helper: read password for a specific user from ~/.pgpass ---
get_pass_from_pgpass () {
  local user="$1"
  if [[ -f "$PGPASS_FILE" ]]; then
    awk -F: -v h="$NEON_HOST" -v p="$NEON_PORT" -v d="$NEON_DB" -v u="$user" \
      '($1==h && $2==p && $3==d && $4==u){pw=$5} END{if(pw!="") print pw}' "$PGPASS_FILE"
  fi
}

# Determine target passwords (prefer env; else from ~/.pgpass)
APP_PASS="${APP_PASS:-$(get_pass_from_pgpass "$APP_USER")}"
ADMIN_PASS="${ADMIN_PASS:-$(get_pass_from_pgpass "$ADMIN_USER")}"

if [[ -z "${APP_PASS}" || -z "${ADMIN_PASS}" ]]; then
  echo "ERROR: Could not find APP_PASS/ADMIN_PASS via env or ~/.pgpass."
  echo "       Run 'source ./export_neon_passwords.sh' first, or ensure ~/.pgpass has entries."
  exit 1
fi

# Owner password (env or prompt securely)
if [[ -z "${NEON_OWNER_PASS:-}" ]]; then
  read -s -p "Enter password for ${OWNER_USER}@${NEON_HOST}: " NEON_OWNER_PASS
  echo
fi

echo "== Updating role passwords on Neon =="
export PGPASSWORD="$NEON_OWNER_PASS"

# Use a single psql session to run both ALTERs atomically.
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${OWNER_USER}" <<SQL
BEGIN;
ALTER ROLE "${APP_USER}"   WITH LOGIN PASSWORD '${APP_PASS}';
ALTER ROLE "${ADMIN_USER}" WITH LOGIN PASSWORD '${ADMIN_PASS}';
COMMIT;
SQL

echo "== Verifying connections =="
# These rely on ~/.pgpass (or PGPASSWORD if you export explicitly)
unset PGPASSWORD
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${APP_USER}"   -tAc "SELECT current_user, 1;"
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${ADMIN_USER}" -tAc "SELECT current_user, 1;"

echo "All good."
