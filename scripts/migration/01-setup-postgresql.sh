#!/usr/bin/env bash
# PostgreSQL + PostGIS setup for ShadowCheck
# Based on pg_bootstrap_sigint.sh and pg_kickstart.sh

set -euo pipefail

DB_NAME="${1:-sigint}"
ADMIN_ROLE="${2:-sigint_admin}"
RO_ROLE="${3:-shadowcheck_app}"

echo "[*] Setting up PostgreSQL database: $DB_NAME"

# Generate secure password
ADMIN_PASS="$(tr -dc 'A-Za-z0-9!@#%^+=_' </dev/urandom | head -c 24)"

# Create database and roles
psql -v ON_ERROR_STOP=1 -d postgres <<SQL
-- Create roles if they don't exist
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${ADMIN_ROLE}') THEN
    CREATE ROLE ${ADMIN_ROLE} LOGIN PASSWORD '${ADMIN_PASS}';
  ELSE
    ALTER ROLE ${ADMIN_ROLE} LOGIN PASSWORD '${ADMIN_PASS}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${RO_ROLE}') THEN
    CREATE ROLE ${RO_ROLE} LOGIN;
  END IF;
END\$\$;

-- Create database if it doesn't exist
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname='${DB_NAME}') THEN
    CREATE DATABASE ${DB_NAME};
  END IF;
END\$\$;

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${ADMIN_ROLE};
SQL

# Setup PostGIS and schemas
psql -v ON_ERROR_STOP=1 -d "$DB_NAME" <<'SQL'
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS raw;     -- Raw imported data
CREATE SCHEMA IF NOT EXISTS app;     -- Unified application tables  
CREATE SCHEMA IF NOT EXISTS enrich;  -- Enrichment and analysis

-- Set search path
ALTER DATABASE ${DB_NAME} SET search_path = app, public, raw, enrich;
SQL

# Update ~/.pgpass (optional)
PGPASS="$HOME/.pgpass"
if [[ -w "$HOME" ]]; then
  sed -i "\|:${DB_NAME}:${ADMIN_ROLE}:|d" "$PGPASS" 2>/dev/null || true
  echo "localhost:5432:${DB_NAME}:${ADMIN_ROLE}:${ADMIN_PASS}" >> "$PGPASS"
  chmod 600 "$PGPASS"
  echo "[*] Added credentials to ~/.pgpass"
fi

echo "=============================================================="
echo "✅ PostgreSQL setup complete"
echo "  Database: ${DB_NAME}"
echo "  Admin:    ${ADMIN_ROLE} (password: ${ADMIN_PASS})"
echo "  ReadOnly: ${RO_ROLE}"
echo "  Schemas:  raw, app, enrich"
echo "=============================================================="
