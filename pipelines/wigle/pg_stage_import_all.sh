#!/usr/bin/env bash
# pg_stage_import_all.sh
# Imports the location, network, and route CSVs into Postgres staging tables (all rows for s22b, source_id=4).
#
# Usage:
#   PGHOST=... PGPORT=... PGUSER=... PGPASSWORD=... ./pg_stage_import_all.sh \
#       ./sqlite_location_export.csv ./sqlite_network_export.csv ./sqlite_route_export.csv
#
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 location_csv network_csv route_csv"
  echo "Env: PGBIN_PSQL optional (defaults to psql)."
  exit 2
fi

LOC_CSV="$1"
NET_CSV="$2"
ROUTE_CSV="$3"
PSQL="pgcc"

# Database connection variables can be passed via env or .pgpass
# Example: PGPASSWORD=... PGUSER=... PGHOST=... PGDATABASE=shadowcheck $PSQL -c "SELECT 1;"
echo "Using psql: $PSQL"
echo "Location CSV: $LOC_CSV"
echo "Network CSV:  $NET_CSV"
echo "Route CSV:    $ROUTE_CSV"

# Ensure target schema exists
$PSQL -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
CREATE SCHEMA IF NOT EXISTS app;
COMMIT;
SQL

# 1) Create staging tables
$PSQL -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- Drop staging if exists for clean run
DROP TABLE IF EXISTS app.location_staging_s22b;
DROP TABLE IF EXISTS app.network_staging_s22b;
DROP TABLE IF EXISTS app.route_staging_s22b;

-- Create staging tables that match the SQLite CSV export shape
CREATE TABLE app.location_staging_s22b (
  _id           bigint,
  bssid         text,
  level         integer,
  lat           double precision,
  lon           double precision,
  altitude      double precision,
  accuracy      double precision,
  time          bigint,
  external      integer,
  mfgrid        integer
);

CREATE TABLE app.network_staging_s22b (
  bssid         text,
  ssid          text,
  frequency     integer,
  capabilities  text,
  lasttime      bigint,
  lastlat       double precision,
  lastlon       double precision,
  type          text,
  bestlevel     integer,
  bestlat       double precision,
  bestlon       double precision,
  rcois         text,
  mfgrid        integer,
  service       text
);

CREATE TABLE app.route_staging_s22b (
  route_id      bigint,
  start_time    bigint,
  end_time      bigint,
  lat_start     double precision,
  lon_start     double precision,
  lat_end       double precision,
  lon_end       double precision,
  total_distance double precision,
  speed_avg     double precision
);
COMMIT;
SQL

echo "COPYing CSVs into staging tables..."

# Use psql \copy to import CSV files (client-side)
# CORRECTED: The column lists now match the expected output of `SELECT *` from the SQLite tables.
$PSQL -v ON_ERROR_STOP=1 --single-transaction <<PSQL
\copy app.location_staging_s22b(_id, bssid, level, lat, lon, altitude, accuracy, "time", external, mfgrid) FROM '${LOC_CSV}' WITH CSV HEADER;
\copy app.network_staging_s22b(bssid, ssid, frequency, capabilities, lasttime, lastlat, lastlon, "type", bestlevel, bestlat, bestlon, rcois, mfgrid, service) FROM '${NET_CSV}' WITH CSV HEADER;
\copy app.route_staging_s22b(route_id, start_time, end_time, lat_start, lon_start, lat_end, lon_end, total_distance, speed_avg) FROM '${ROUTE_CSV}' WITH CSV HEADER;
PSQL

echo "Staging loaded. Now performing merges into canonical tables (source_id = 4 for s22b)."

$PSQL -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

-- 1) Insert locations
INSERT INTO app.locations_legacy (
  source_id, _id, bssid, level, lat, lon, altitude, accuracy, time, external, mfgrid
)
SELECT
  4 AS source_id,
  s._id,
  UPPER(NULLIF(s.bssid,'')) AS bssid,
  s.level,
  s.lat,
  s.lon,
  s.altitude,
  s.accuracy,
  s.time,
  s.external,
  s.mfgrid
FROM app.location_staging_s22b s;

-- 2) Insert networks
INSERT INTO app.networks_legacy (
  source_id, bssid, ssid, frequency, capabilities, lasttime, lastlat, lastlon, type, bestlevel, bestlat, bestlon, rcois, mfgrid, service
)
SELECT
  4 AS source_id,
  UPPER(NULLIF(s.bssid,'')) AS bssid,
  s.ssid,
  s.frequency,
  s.capabilities,
  s.lasttime,
  s.lastlat,
  s.lastlon,
  s.type,
  s.bestlevel,
  s.bestlat,
  s.bestlon,
  s.rcois,
  s.mfgrid,
  s.service
FROM app.network_staging_s22b s;

-- 3) Insert routes
INSERT INTO app.routes_legacy (
  source_id, route_id, start_time, end_time, lat_start, lon_start, lat_end, lon_end, total_distance, speed_avg
)
SELECT
  4 AS source_id,
  s.route_id,
  s.start_time,
  s.end_time,
  s.lat_start,
  s.lon_start,
  s.lat_end,
  s.lon_end,
  s.total_distance,
  s.speed_avg
FROM app.route_staging_s22b s;

COMMIT;
SQL

echo "Merge complete. Running verification queries and cleaning up staging tables..."

# ADDED: The missing final block for verification and cleanup.
$PSQL -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- Verification queries
SELECT 'app.locations_legacy new rows for s22b (source_id=4):' AS "table", COUNT(*) FROM app.locations_legacy WHERE source_id = 4;
SELECT 'app.networks_legacy new rows for s22b (source_id=4):'  AS "table", COUNT(*) FROM app.networks_legacy  WHERE source_id = 4;
SELECT 'app.routes_legacy new rows for s22b (source_id=4):'    AS "table", COUNT(*) FROM app.routes_legacy    WHERE source_id = 4;

-- Cleanup
DROP TABLE app.location_staging_s22b;
DROP TABLE app.network_staging_s22b;
DROP TABLE app.route_staging_s22b;
COMMIT;
SQL

echo "All done."
