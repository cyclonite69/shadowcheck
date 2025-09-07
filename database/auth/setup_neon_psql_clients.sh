#!/usr/bin/env bash
# setup_neon_psql_clients.sh
# v1.0.1 — Create psql service + password files for Neon and verify two roles.

set -euo pipefail

NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"

APP_USER="${APP_USER:-shadowcheck_app}"
ADMIN_USER="${ADMIN_USER:-sigint_admin}"

: "${APP_PASS:?You must export APP_PASS in your environment first}"
: "${ADMIN_PASS:?You must export ADMIN_PASS in your environment first}"

PG_SERVICE_FILE="$HOME/.pg_service.conf"
PGPASS_FILE="$HOME/.pgpass"

# Write ~/.pg_service.conf
tmp_service="$(mktemp)"
if [[ -f "$PG_SERVICE_FILE" ]]; then
  awk '
    BEGIN{skip=0}
    /^\[shadowcheck_app\]/ {skip=1}
    /^\[sigint_admin\]/ {skip=1}
    /^\[/ && $0!~"\\[shadowcheck_app\\]|\\[sigint_admin\\]" {skip=0}
    skip==0 {print}
  ' "$PG_SERVICE_FILE" > "$tmp_service"
fi

cat >> "$tmp_service" <<SERVEOF

[shadowcheck_app]
host=$NEON_HOST
port=$NEON_PORT
dbname=$NEON_DB
user=$APP_USER
sslmode=require

[sigint_admin]
host=$NEON_HOST
port=$NEON_PORT
dbname=$NEON_DB
user=$ADMIN_USER
sslmode=require
SERVEOF

mv "$tmp_service" "$PG_SERVICE_FILE"
chmod 600 "$PG_SERVICE_FILE"

# Write ~/.pgpass
touch "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"
grep -v -E "^${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${APP_USER}:" "$PGPASS_FILE" | \
grep -v -E "^${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${ADMIN_USER}:" > "${PGPASS_FILE}.tmp" || true
mv "${PGPASS_FILE}.tmp" "$PGPASS_FILE"

{
  echo "${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${APP_USER}:${APP_PASS}"
  echo "${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${ADMIN_USER}:${ADMIN_PASS}"
} >> "$PGPASS_FILE"

chmod 600 "$PGPASS_FILE"

# Verify connections
echo "== Checking service connections =="
psql "service=shadowcheck_app" -tAc "SELECT current_user, 1;"
psql "service=sigint_admin"    -tAc "SELECT current_user, 1;"

echo "== Direct env one-liners =="
PGPASSWORD="$APP_PASS"   psql "sslmode=require host=$NEON_HOST port=$NEON_PORT dbname=$NEON_DB user=$APP_USER"   -tAc "SELECT 1;"
PGPASSWORD="$ADMIN_PASS" psql "sslmode=require host=$NEON_HOST port=$NEON_PORT dbname=$NEON_DB user=$ADMIN_USER" -tAc "SELECT 1;"
