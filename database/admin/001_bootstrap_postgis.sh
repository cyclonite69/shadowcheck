#!/usr/bin/env bash
# 001_bootstrap_postgis.sh
# v1.0.1 — Enable PostGIS, create schemas (raw/app/enrich), set grants & defaults, spatial smoke test.
# Idempotent. Uses `service=owner` for DDL.

set -euo pipefail
PSQL_OWNER='service=owner'

# Fail early if owner service isn't available
psql "$PSQL_OWNER" -tAc "SELECT 1;" >/dev/null

psql "$PSQL_OWNER" -v ON_ERROR_STOP=1 <<'SQL'
-- 1) Ensure roles exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shadowcheck_app') THEN
    CREATE ROLE shadowcheck_app LOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sigint_admin') THEN
    CREATE ROLE sigint_admin LOGIN;
  END IF;
END$$;

-- 2) Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 3) Schemas
CREATE SCHEMA IF NOT EXISTS raw    AUTHORIZATION neondb_owner;
CREATE SCHEMA IF NOT EXISTS app    AUTHORIZATION neondb_owner;
CREATE SCHEMA IF NOT EXISTS enrich AUTHORIZATION neondb_owner;

-- 4) Privileges
GRANT USAGE ON SCHEMA raw, app, enrich TO shadowcheck_app, sigint_admin;
GRANT CREATE ON SCHEMA raw, app, enrich TO sigint_admin;

GRANT SELECT ON ALL TABLES    IN SCHEMA raw, app, enrich TO shadowcheck_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA raw, app, enrich TO sigint_admin;
GRANT USAGE ON ALL SEQUENCES  IN SCHEMA raw, app, enrich TO shadowcheck_app, sigint_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA raw, app, enrich TO shadowcheck_app, sigint_admin;

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA raw, app, enrich
  GRANT SELECT ON TABLES TO shadowcheck_app;
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA raw, app, enrich
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sigint_admin;

ALTER DEFAULT PRIVILEGES FOR ROLE sigint_admin IN SCHEMA raw, app, enrich
  GRANT SELECT ON TABLES TO shadowcheck_app;
ALTER DEFAULT PRIVILEGES FOR ROLE sigint_admin IN SCHEMA raw, app, enrich
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sigint_admin;

-- 5) Smoke test table in app schema
CREATE TABLE IF NOT EXISTS app._ping_geom (
  id           bigserial PRIMARY KEY,
  note         text,
  observed_at  timestamptz DEFAULT now(),
  geom         geometry(Point, 4326)
);

INSERT INTO app._ping_geom (note, geom)
SELECT 'bootstrap ok', ST_SetSRID(ST_Point(-83.69, 43.01), 4326)
WHERE NOT EXISTS (SELECT 1 FROM app._ping_geom);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='app' AND indexname='idx__ping_geom_gist'
  ) THEN
    EXECUTE 'CREATE INDEX idx__ping_geom_gist ON app._ping_geom USING GIST (geom)';
  END IF;
END$$;
SQL

echo "== Verify PostGIS extension =="
psql "$PSQL_OWNER" -tAc "SELECT extname, extversion FROM pg_extension WHERE extname='postgis';"

echo "== Verify schemas exist =="
psql "$PSQL_OWNER" -tAc "SELECT nspname FROM pg_namespace WHERE nspname IN ('raw','app','enrich') ORDER BY 1;"

echo '== Smoke query as shadowcheck_app =='
psql "service=shadowcheck_app" -tAc "SELECT count(*) FROM app._ping_geom;"

echo '== ST_AsText(Point) as shadowcheck_app =='
psql "service=shadowcheck_app" -tAc "SELECT ST_AsText(geom) FROM app._ping_geom LIMIT 1;"
