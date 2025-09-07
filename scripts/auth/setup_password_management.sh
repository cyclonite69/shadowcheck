#!/usr/bin/env bash
# Automated password management using Replit secrets

set -euo pipefail

echo "Setting up automated password management..."

# Extract owner password from DATABASE_URL
if [[ -n "${DATABASE_URL:-}" ]]; then
    OWNER_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    echo "Owner password extracted from DATABASE_URL"
else
    echo "ERROR: DATABASE_URL not found"
    exit 1
fi

# Get role passwords from Replit secrets
APP_PASS="${NEON_APP_PASS:?Add NEON_APP_PASS to Replit secrets}"
ADMIN_PASS="${NEON_ADMIN_PASS:?Add NEON_ADMIN_PASS to Replit secrets}"
echo "Role passwords loaded from secrets"

NEON_HOST="ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech"
NEON_PORT="5432"
NEON_DB="neondb"

echo "Updating Neon role passwords..."

# Update passwords on Neon
export PGPASSWORD="$OWNER_PASS"
psql "sslmode=require host=$NEON_HOST port=$NEON_PORT dbname=$NEON_DB user=neondb_owner" <<SQL
BEGIN;
ALTER ROLE shadowcheck_app WITH LOGIN PASSWORD '$APP_PASS';
ALTER ROLE sigint_admin WITH LOGIN PASSWORD '$ADMIN_PASS';
COMMIT;
SQL

echo "Neon passwords updated"

# Update .pgpass file
echo "Updating ~/.pgpass..."
PGPASS_FILE="$HOME/.pgpass"
touch "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

# Remove old role entries
grep -v -E ":shadowcheck_app:|:sigint_admin:" "$PGPASS_FILE" > "${PGPASS_FILE}.tmp" || true
mv "${PGPASS_FILE}.tmp" "$PGPASS_FILE"

# Add new role entries
echo "$NEON_HOST:$NEON_PORT:$NEON_DB:shadowcheck_app:$APP_PASS" >> "$PGPASS_FILE"
echo "$NEON_HOST:$NEON_PORT:$NEON_DB:sigint_admin:$ADMIN_PASS" >> "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

echo "~/.pgpass updated"

# Test connections
echo "Testing role connections..."
unset PGPASSWORD

psql "service=shadowcheck_app" -tAc "SELECT 'app_works';"
psql "service=sigint_admin" -tAc "SELECT 'admin_works';"

echo "Password management setup complete!"
