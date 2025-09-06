#!/usr/bin/env bash
# Build unified app schema from imported device schemas
# Based on motherload_build_all_v2.sh

set -euo pipefail

PG_DB="${1:-sigint}"

echo "[*] Building unified app schema in database: $PG_DB"

psql -v ON_ERROR_STOP=1 -d "$PG_DB" <<'SQL'
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE SCHEMA IF NOT EXISTS app;

-- Metadata tracking
CREATE TABLE IF NOT EXISTS app.load_runs (
  id           bigserial PRIMARY KEY,
  label        text,
  started_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz,
  obs_rows     bigint,
  unified_rows bigint
);

INSERT INTO app.load_runs(label) VALUES ('unified schema build') RETURNING id
\gset

-- Unified observation history
DROP TABLE IF EXISTS app.observation_history CASCADE;
CREATE TABLE app.observation_history (
  id           bigserial PRIMARY KEY,
  source       text NOT NULL,
  origin       text NOT NULL,
  bssid        text,
  ssid         text,
  lat          double precision,
  lon          double precision,
  frequency    integer,
  level        integer,
  capabilities text,
  lastlat      double precision,
  lastlon      double precision,
  bestlat      double precision,
  bestlon      double precision,
  time_ms      bigint,
  extra_json   jsonb DEFAULT '{}'::jsonb
);

-- Dynamic insertion from all detected schemas
DO $$
DECLARE
  schema_rec record;
  insert_sql text;
BEGIN
  -- Find all schemas with WiGLE-style tables
  FOR schema_rec IN 
    SELECT DISTINCT table_schema as schema_name
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'public', 'app', 'raw', 'enrich')
      AND table_name IN ('network', 'location')
  LOOP
    RAISE NOTICE 'Processing schema: %', schema_rec.schema_name;
    
    -- Insert network data
    insert_sql := format('
      INSERT INTO app.observation_history
      (source, origin, bssid, ssid, lat, lon, frequency, level, capabilities,
       lastlat, lastlon, bestlat, bestlon, time_ms, extra_json)
      SELECT ''%1$s'', ''network'', lower(n.bssid), n.ssid,
             n.lastlat, n.lastlon, n.frequency, n.bestlevel, n.capabilities,
             n.lastlat, n.lastlon, n.bestlat, n.bestlon,
             n.lasttime,
             jsonb_build_object(''type'', n.type, ''service'', COALESCE(n.service,''''), 
                              ''mfgrid'', COALESCE(n.mfgrid,0), ''rcois'', COALESCE(n.rcois,''''))
      FROM %1$s.network n
    ', schema_rec.schema_name);
    EXECUTE insert_sql;
    
    -- Insert location data  
    insert_sql := format('
      INSERT INTO app.observation_history
      (source, origin, bssid, ssid, lat, lon, frequency, level, capabilities,
       lastlat, lastlon, bestlat, bestlon, time_ms, extra_json)
      SELECT ''%1$s'', ''location'', lower(l.bssid), NULL,
             l.lat, l.lon, NULL, l.level, NULL,
             NULL, NULL, NULL, NULL,
             l."time",
             jsonb_build_object(''accuracy'', l.accuracy, ''altitude'', l.altitude, 
                              ''external'', l.external, ''mfgrid'', l.mfgrid)
      FROM %1$s.location l
    ', schema_rec.schema_name);
    EXECUTE insert_sql;
  END LOOP;
END$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS obshist_bssid_btree ON app.observation_history (bssid);
CREATE INDEX IF NOT EXISTS obshist_time_brin ON app.observation_history USING BRIN (time_ms);
CREATE INDEX IF NOT EXISTS obshist_source_idx ON app.observation_history (source);

ANALYZE app.observation_history;

-- Unified network summary
DROP TABLE IF EXISTS app.network_unified_raw CASCADE;
CREATE TABLE app.network_unified_raw (
  id             bigserial PRIMARY KEY,
  bssid          text UNIQUE NOT NULL,
  ssid           text,
  lat            double precision,
  lon            double precision,
  frequency      integer,
  first_seen_ms  bigint,
  last_seen_ms   bigint,
  sources        text[] NOT NULL DEFAULT '{}'
);

-- Aggregate by BSSID with best values
WITH scored AS (
  SELECT
    lower(bssid) AS bssid,
    -- Best SSID (longest, most recent)
    (ARRAY_REMOVE(
      ARRAY_AGG(ssid ORDER BY (ssid IS NOT NULL AND ssid <> '') DESC, 
                length(ssid) DESC NULLS LAST, time_ms DESC NULLS LAST),
      NULL
    ))[1] AS ssid,
    -- Best coordinates (valid, most recent)
    (ARRAY_REMOVE(
      ARRAY_AGG(lat ORDER BY (lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180) DESC, 
                time_ms DESC NULLS LAST), 
      NULL
    ))[1] AS lat,
    (ARRAY_REMOVE(
      ARRAY_AGG(lon ORDER BY (lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180) DESC, 
                time_ms DESC NULLS LAST), 
      NULL
    ))[1] AS lon,
    -- Best frequency (most recent valid)
    (ARRAY_REMOVE(
      ARRAY_AGG(frequency ORDER BY (frequency IS NOT NULL) DESC, time_ms DESC NULLS LAST), 
      NULL
    ))[1] AS frequency,
    MIN(time_ms) AS first_seen_ms,
    MAX(time_ms) AS last_seen_ms,
    ARRAY_AGG(DISTINCT source ORDER BY source) AS sources
  FROM app.observation_history
  WHERE bssid IS NOT NULL
  GROUP BY lower(bssid)
)
INSERT INTO app.network_unified_raw (bssid, ssid, lat, lon, frequency, first_seen_ms, last_seen_ms, sources)
SELECT bssid, ssid, lat, lon, frequency, first_seen_ms, last_seen_ms, sources
FROM scored;

-- Indexes for unified table
CREATE INDEX IF NOT EXISTS network_unified_bssid_idx ON app.network_unified_raw (bssid);
CREATE INDEX IF NOT EXISTS network_unified_last_ms_idx ON app.network_unified_raw USING BRIN (last_seen_ms);

ANALYZE app.network_unified_raw;

-- PostGIS views for spatial queries
CREATE OR REPLACE VIEW app.observation_geo_v AS
SELECT
  id, source, origin, bssid, ssid, lat, lon, frequency, level, capabilities,
  time_ms,
  CASE WHEN time_ms IS NOT NULL THEN to_timestamp(time_ms/1000.0) END AS observed_at,
  CASE WHEN lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180
       THEN ST_SetSRID(ST_MakePoint(lon,lat),4326)::geometry(Point,4326)
       ELSE NULL END AS geom
FROM app.observation_history;

CREATE OR REPLACE VIEW app.network_unified_geo_v AS
SELECT
  id, bssid, ssid, lat, lon, frequency,
  first_seen_ms, last_seen_ms,
  CASE WHEN first_seen_ms IS NOT NULL THEN to_timestamp(first_seen_ms/1000.0) END AS first_seen,
  CASE WHEN last_seen_ms  IS NOT NULL THEN to_timestamp(last_seen_ms /1000.0) END AS last_seen,
  CASE WHEN lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180
       THEN ST_SetSRID(ST_MakePoint(lon,lat),4326)::geometry(Point,4326)
       ELSE NULL END AS geom,
  sources
FROM app.network_unified_raw;

-- Update run metadata
UPDATE app.load_runs
SET finished_at = now(),
    obs_rows = (SELECT count(*) FROM app.observation_history),
    unified_rows = (SELECT count(*) FROM app.network_unified_raw)
WHERE id = :'id';

-- Summary
SELECT 'Build complete' as status,
       (SELECT count(*) FROM app.observation_history) as observation_rows,
       (SELECT count(*) FROM app.network_unified_raw) as unified_networks,
       (SELECT count(DISTINCT source) FROM app.observation_history) as source_schemas;
SQL

echo "✅ Unified schema build complete!"
echo "   Verify with: psql -d $PG_DB -c 'SELECT * FROM app.load_runs ORDER BY id DESC LIMIT 1;'"
