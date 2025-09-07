#!/usr/bin/env bash
# 002_create_missing_tables.sh - Complete what bootstrap failed to do

set -euo pipefail

psql "service=sigint_admin" <<'SQL'
-- Create the ping table that bootstrap tried to create
CREATE TABLE IF NOT EXISTS app._ping_geom (
  id           bigserial PRIMARY KEY,
  note         text,
  observed_at  timestamptz DEFAULT now(),
  geom         geometry(Point, 4326)
);

-- Insert test data if missing
INSERT INTO app._ping_geom (note, geom)
SELECT 'bootstrap ok', ST_SetSRID(ST_Point(-83.69, 43.01), 4326)
WHERE NOT EXISTS (SELECT 1 FROM app._ping_geom);

-- Create index if missing
CREATE INDEX IF NOT EXISTS idx__ping_geom_gist 
ON app._ping_geom USING GIST (geom);

-- Verify it worked
SELECT COUNT(*) as ping_count FROM app._ping_geom;
SQL

echo "Core tables created. Testing basic connectivity..."
psql "service=shadowcheck_app" -tAc "SELECT COUNT(*) FROM app._ping_geom;"
