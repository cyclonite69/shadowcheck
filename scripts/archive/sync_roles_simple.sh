#!/usr/bin/env bash
# sync_roles_simple.sh - Use env PGPASSWORD to sync app/admin roles

set -euo pipefail

NEON_HOST="ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech"
NEON_PORT="5432"
NEON_DB="neondb"
OWNER_USER="neondb_owner"
APP_USER="shadowcheck_app"
ADMIN_USER="sigint_admin"

# Get app/admin passwords from .pgpass
APP_PASS=$(awk -F: -v h="$NEON_HOST" -v p="$NEON_PORT" -v d="$NEON_DB" -v u="$APP_USER" \
    '($1==h && $2==p && $3==d && $4==u){print $5; exit}' ~/.pgpass)
ADMIN_PASS=$(awk -F: -v h="$NEON_HOST" -v p="$NEON_PORT" -v d="$NEON_DB" -v u="$ADMIN_USER" \
    '($1==h && $2==p && $3==d && $4==u){print $5; exit}' ~/.pgpass)

if [[ -z "$APP_PASS" || -z "$ADMIN_PASS" ]]; then
    echo "ERROR: Missing passwords in .pgpass"
    exit 1
fi

echo "Syncing role passwords on Neon..."
# PGPASSWORD is already set for owner
psql "sslmode=require host=$NEON_HOST port=$NEON_PORT dbname=$NEON_DB user=$OWNER_USER" <<SQL
BEGIN;
ALTER ROLE "$APP_USER"   WITH LOGIN PASSWORD '$APP_PASS';
ALTER ROLE "$ADMIN_USER" WITH LOGIN PASSWORD '$ADMIN_PASS';
COMMIT;
SQL

echo "Testing connections..."
unset PGPASSWORD  # Force use of .pgpass for testing
psql "sslmode=require host=$NEON_HOST port=$NEON_PORT dbname=$NEON_DB user=$APP_USER" -tAc "SELECT current_user, 1;"
psql "sslmode=require host=$NEON_HOST port=$NEON_PORT dbname=$NEON_DB user=$ADMIN_USER" -tAc "SELECT current_user, 1;"

echo "Sync complete!"
