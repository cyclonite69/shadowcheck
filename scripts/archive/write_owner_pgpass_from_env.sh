#!/usr/bin/env bash
# write_owner_pgpass_from_env.sh
# v1.0.0 — Write exact owner tuple to ~/.pgpass using NEON_OWNER_PASS (no prompts).

set -euo pipefail
NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"
OWNER_USER="${OWNER_USER:-neondb_owner}"
PGPASS_FILE="${PGPASS_FILE:-$HOME/.pgpass}"

: "${NEON_OWNER_PASS:?NEON_OWNER_PASS must be set in your environment}"

touch "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

# Remove any existing exact owner line, then append fresh exact tuple
grep -v -E "^${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${OWNER_USER}:" "$PGPASS_FILE" > "${PGPASS_FILE}.tmp" || true
mv "${PGPASS_FILE}.tmp" "$PGPASS_FILE"
printf '%s\n' "${NEON_HOST}:${NEON_PORT}:${NEON_DB}:${OWNER_USER}:${NEON_OWNER_PASS}" >> "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

echo "Owner tuple written to ~/.pgpass for ${OWNER_USER}@${NEON_HOST}."
