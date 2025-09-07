#!/usr/bin/env bash
# sync_neon_roles_pgpass_noprompt.sh
# v1.0.0 — No prompts. Uses ~/.pgpass exclusively for app/admin; owner is added from env/file if missing.
# Steps:
#   - Ensure neondb_owner has a ~/.pgpass line (using NEON_OWNER_PASS or NEON_OWNER_PASS_FILE)
#   - Read app/admin passwords from ~/.pgpass (wildcard-aware like libpq)
#   - ALTER ROLE ... PASSWORD ... using owner creds
#   - Verify connections for app/admin

set -euo pipefail

NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"

OWNER_USER="${OWNER_USER:-neondb_owner}"
APP_USER="${APP_USER:-shadowcheck_app}"
ADMIN_USER="${ADMIN_USER:-sigint_admin}"

PGPASS_FILE="${PGPASS_FILE:-$HOME/.pgpass}"
PG_SERVICE_FILE="${PG_SERVICE_FILE:-$HOME/.pg_service.conf}"

# --- helper: wildcard-aware lookup (libpq-like precedence) ---
# exact host/port/db outrank wildcard '*', user must match exactly
get_pw () {
  local want_user="$1"
  [[ -f "$PGPASS_FILE" ]] || return 1
  awk -F: -v h="$NEON_HOST" -v p="$NEON_PORT" -v d="$NEON_DB" -v u="$want_user" '
    $4==u {
      score=0
      if ($1==h) score+=8; else if ($1=="*") score+=0; else next
      if ($2==p) score+=4; else if ($2=="*") score+=0; else next
      if ($3==d) score+=2; else if ($3=="*") score+=0; else next
      score+=1
      print score "\t" $5 "\t" NR
    }
  ' "$PGPASS_FILE" \
  | sort -k1,1nr -k3,3n \
  | awk -F'\t' 'NR==1 {print $2}'
}

# --- ensure ~/.pgpass exists & is private ---
touch "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

# --- 1) Ensure OWNER entry exists (no prompt) ---
owner_pw_exact="$(awk -F: -v h="$NEON_HOST" -v p="$NEON_PORT" -v d="$NEON_DB" -v u="$OWNER_USER" \
  '($1==h && $2==p && $3==d && $4==u){print $5; exit}' "$PGPASS_FILE")"

if [[ -z "${owner_pw_exact}" ]]; then
  # Accept owner password from env var or from a file path; no interactive prompt.
  if [[ -n "${NEON_OWNER_PASS:-}" ]]; then
    OWNER_PASS_SRC="$NEON_OWNER_PASS"
  elif [[ -n "${NEON_OWNER_PASS_FILE:-}" && -f "${NEON_OWNER_PASS_FILE}" ]]; then
    OWNER_PASS_SRC="$(cat "${NEON_OWNER_PASS_FILE}")"
  else
    echo "ERROR: Missing owner line in ~/.pgpass AND no non-interactive source provided."
    echo "Set one of the following and re-run (no prompts will be used):"
    echo "  export NEON_OWNER_PASS='YOUR_OWNER_PASSWORD'"
    echo "  # or"
    echo "  export NEON_OWNER_PASS_FILE='/path/to/file/with/owner_password'"
    exit 1
  fi

  # remove any old exact owner tuple, append fresh exact tuple
  grep -v -E "^${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${OWNER_USER}:" "$PGPASS_FILE" > "${PGPASS_FILE}.tmp" || true
  mv "${PGPASS_FILE}.tmp" "$PGPASS_FILE"
  printf '%s\n' "${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${OWNER_USER}:${OWNER_PASS_SRC}" >> "$PGPASS_FILE"
  chmod 600 "$PGPASS_FILE"
fi

# --- 2) Resolve passwords from ~/.pgpass (wildcard-aware) ---
OWNER_PASS="$(get_pw "$OWNER_USER" || true)"
APP_PASS="$(get_pw "$APP_USER" || true)"
ADMIN_PASS="$(get_pw "$ADMIN_USER" || true)"

missing=()
[[ -n "${OWNER_PASS:-}" ]] || missing+=("$OWNER_USER")
[[ -n "${APP_PASS:-}"   ]] || missing+=("$APP_USER")
[[ -n "${ADMIN_PASS:-}" ]] || missing+=("$ADMIN_USER")

if (( ${#missing[@]} > 0 )); then
  echo "ERROR: Could not resolve ~/.pgpass password(s) for: ${missing[*]}"
  echo "Add exact or wildcard line(s) for the missing user(s), e.g.:"
  for u in "${missing[@]}"; do
    echo "echo '${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${u}:<PUT_${u}_PASSWORD_HERE>' >> '${PGPASS_FILE}'"
  done
  exit 1
fi

# --- 3) ALTER ROLE using owner creds ---
export PGPASSWORD="$OWNER_PASS"
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${OWNER_USER}" <<SQL
BEGIN;
ALTER ROLE "${APP_USER}"   WITH LOGIN PASSWORD '${APP_PASS}';
ALTER ROLE "${ADMIN_USER}" WITH LOGIN PASSWORD '${ADMIN_PASS}';
COMMIT;
SQL

# --- 4) Verify connections (no env; rely on ~/.pgpass) ---
unset PGPASSWORD
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${APP_USER}"   -tAc "SELECT current_user, 1;"
psql "sslmode=require host=${NEON_HOST} port=${NEON_PORT} dbname=${NEON_DB} user=${ADMIN_USER}" -tAc "SELECT current_user, 1;"

echo "Sync complete (no prompts)."
