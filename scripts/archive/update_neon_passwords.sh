#!/usr/bin/env bash
# Update Neon role passwords using environment secrets

set -euo pipefail

# Use environment variables from Replit secrets
APP_PASS="${NEON_APP_PASS:?Set NEON_APP_PASS in Replit secrets}"
ADMIN_PASS="${NEON_ADMIN_PASS:?Set NEON_ADMIN_PASS in Replit secrets}"

# Get owner password from DATABASE_URL or environment
if [[ -n "${DATABASE_URL:-}" ]]; then
    # Extract password from DATABASE_URL
    OWNER_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
else
    OWNER_PASS="${NEON_OWNER_PASS:?Set NEON_OWNER_PASS in Replit secrets or DATABASE_URL}"
fi

NEON_HOST="ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech"
NEON_PORT="5432"
NEON_DB="neondb"

echo "Updating role passwords on Neon..."

# Update passwords using owner connection
export PGPASSWORD="$OWNER_PASS"
psql "sslmode=require host=$NEON_HOST port=$NEON_PORT dbname=$NEON_DB user=neondb_owner" <<SQL
BEGIN;
ALTER ROLE shadowcheck_app WITH LOGIN PASSWORD '$APP_PASS';
ALTER ROLE sigint_admin WITH LOGIN PASSWORD '$ADMIN_PASS';
COMMIT;
SQL

# Update .pgpass file
PGPASS_FILE="$HOME/.pgpass"
touch "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

# Remove old entries
grep -v -E ":shadowcheck_app:|:sigint_admin:" "$PGPASS_FILE" > "${PGPASS_FILE}.tmp" || true
mv "${PGPASS_FILE}.tmp" "$PGPASS_FILE"

# Add new entries
echo "$NEON_HOST:$NEON_PORT:$NEON_DB:shadowcheck_app:$APP_PASS" >> "$PGPASS_FILE"
echo "$NEON_HOST:$NEON_PORT:$NEON_DB:sigint_admin:$ADMIN_PASS" >> "$PGPASS_FILE"

chmod 600 "$PGPASS_FILE"

echo "Testing connections..."
unset PGPASSWORD  # Use .pgpass for role connections

psql "service=shadowcheck_app" -tAc "SELECT 'app_user_works';"
psql "service=sigint_admin" -tAc "SELECT 'admin_user_works';"

echo "Password management setup complete!"
