#!/usr/bin/env bash
set -euo pipefail
NEON_HOST="${NEON_HOST:-ep-damp-morning-adjynxfp.c-2.us-east-1.aws.neon.tech}"
NEON_PORT="${NEON_PORT:-5432}"
NEON_DB="${NEON_DB:-neondb}"
OWNER_USER="${OWNER_USER:-neondb_owner}"
PG_SERVICE_FILE="$HOME/.pg_service.conf"

tmp="$(mktemp)"
if [[ -f "$PG_SERVICE_FILE" ]]; then
  awk 'BEGIN{skip=0} /^\[owner\]/{skip=1} /^\[/ && $0!~"\\[owner\\]"{skip=0} skip==0{print}' "$PG_SERVICE_FILE" > "$tmp"
fi
cat >> "$tmp" <<SERVEOF

[owner]
host=$NEON_HOST
port=$NEON_PORT
dbname=$NEON_DB
user=$OWNER_USER
sslmode=require
SERVEOF
mv "$tmp" "$PG_SERVICE_FILE"
chmod 600 "$PG_SERVICE_FILE"
echo "Added [owner] service to $PG_SERVICE_FILE"
