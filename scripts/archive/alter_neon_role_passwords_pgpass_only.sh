#!/usr/bin/env bash
# alter_neon_role_passwords_pgpass_only.sh
# v1.1.0 — Sync Neon role passwords using ONLY ~/.pgpass (supports wildcards like libpq).
# - No prompts. Reads owner/app/admin passwords from ~/.pgpass with wildcard-aware matching.
# - Updates app/admin roles to match ~/.pgpass values.
# - Verifies connections (also via ~/.pgpass).

set -euo pipefail

NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"

OWNER_USER="${OWNER_USER:-neondb_owner}"
APP_USER="${APP_USER:-shadowcheck_app}"
ADMIN_USER="${ADMIN_USER:-sigint_admin}"

PGPASS_FILE="${PGPASS_FILE:-$HOME/.pgpass}"

# libpq-like precedence: exact > wildcard host/port/db, in file order.
# We'll rank each line with a score: +8 host match, +4 port match, +2 db match, +1 user match (user must match exactly).
get_pw () {
  local want_user="$1"
  [[ -f "$PGPASS_FILE" ]] || return 1

  # Read all candidates where user matches exactly (field 4)
  # Then compute a match score with host/port/db equality or wildcard '*'
  awk -F: -v h="$NEON_HOST" -v p="$NEON_PORT" -v d="$NEON_DB" -v u="$want_user" '
    $4==u {
      score=0
      if ($1==h) score+=8; else if ($1=="*") score+=0; else next
      if ($2==p) score+=4; else if ($2=="*") score+=0; else next
      if ($3==d) score+=2; else if ($3=="*") score+=0; else next
      # user matched exactly by filter
      score+=1
      # print: score \t password \t original_line_number (to preserve file order on ties)
      print score "\t" $5 "\t" NR
    }
  ' "$PGPASS_FILE" \
  | sort -k1,1nr -k3,3n \
  | awk -F'\t' 'NR==1 {print $2}'
}

need_pgpass_hint () {
  local user="$1"
  echo "echo '${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${user}:<PUT_${user}_PASSWORD_HERE>' >> '${PGPASS_FILE}'"
}

OWNER_PASS="$(get_pw "$OWNER_USER" || true)"
APP_PASS="$(get_pw "$APP_USER" || true)"
ADMIN_PASS="$(get_pw "$ADMIN_USER" || true)"

missing=()
[[ -n "${OWNER_PASS:-}" ]] || missing+=("$OWNER_USER")
[[ -n "${APP_PASS:-}"   ]] || missing+=("$APP_USER")
[[ -n "${ADMIN_PASS:-}" ]] || missing+=("$ADMIN_USER")

if (( ${#missing[@]} > 0 )); then
  echo "ERROR: Could not find the following in ~/.pgpass (exact or wildcard): ${missing[*]}"
  echo "Add the following line(s) (or ensure a suitable wildcard entry exists), then re-run:"
  for u in "${missing[@]}"; do
    need_pgpass_hint "$u"
  done
  exit 1
fi

# Apply password changes using OWNER from ~/.pgpass
export PGPASSWORD="$OWNER_PASS"
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${OWNER_USER}" <<SQL
BEGIN;
ALTER ROLE "${APP_USER}"   WITH LOGIN PASSWORD '${APP_PASS}';
ALTER ROLE "${ADMIN_USER}" WITH LOGIN PASSWORD '${ADMIN_PASS}';
COMMIT;
SQL

# Verify (no env; rely on ~/.pgpass)
unset PGPASSWORD
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${APP_USER}"   -tAc "SELECT current_user, 1;"
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${ADMIN_USER}" -tAc "SELECT current_user, 1;"

echo "Password sync + verification complete via ~/.pgpass (wildcard-aware)."
