#!/usr/bin/env bash
# extract_working_neon_password.sh
# v1.0.0 — Extract the password that's actually working for neondb_owner

set -euo pipefail

NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"
OWNER_USER="${OWNER_USER:-neondb_owner}"

# Check if we can connect (should work based on your session)
if ! psql "service=owner" -tAc "SELECT 1;" >/dev/null 2>&1; then
    echo "ERROR: Can't connect as owner. Something changed."
    exit 1
fi

echo "== Extracting working owner password =="

# Method 1: Check for exact match in .pgpass
exact_pass=$(awk -F: -v h="$NEON_HOST" -v p="$NEON_PORT" -v d="$NEON_DB" -v u="$OWNER_USER" \
    '($1==h && $2==p && $3==d && $4==u){print $5; exit}' ~/.pgpass 2>/dev/null || true)

if [[ -n "$exact_pass" ]]; then
    echo "Found exact match in ~/.pgpass"
    export NEON_OWNER_PASS="$exact_pass"
    echo "export NEON_OWNER_PASS='$exact_pass'"
    exit 0
fi

# Method 2: Check for wildcard patterns
wildcard_pass=$(awk -F: -v u="$OWNER_USER" \
    '($4==u && ($1=="*" || $2=="*" || $3=="*")){print $5; exit}' ~/.pgpass 2>/dev/null || true)

if [[ -n "$wildcard_pass" ]]; then
    echo "Found wildcard match in ~/.pgpass"
    export NEON_OWNER_PASS="$wildcard_pass"
    echo "export NEON_OWNER_PASS='$wildcard_pass'"
    exit 0
fi

# Method 3: Check environment (less likely but possible)
for var in PGPASSWORD NEON_PASSWORD NEONDB_PASSWORD; do
    if [[ -n "${!var:-}" ]]; then
        echo "Found password in \$$var"
        export NEON_OWNER_PASS="${!var}"
        echo "export NEON_OWNER_PASS='${!var}'"
        exit 0
    fi
done

echo "ERROR: Can connect as owner but can't find the password mechanism"
echo "This is... actually impressive. Check your pg_service.conf for embedded passwords:"
grep -A5 -B1 "\[owner\]" ~/.pg_service.conf || true

echo "== Debug info =="
echo "Full .pgpass contents:"
cat ~/.pgpass 2>/dev/null || echo "No .pgpass file"
echo "Environment variables with 'pass' in name:"
env | grep -i pass || echo "None found"
