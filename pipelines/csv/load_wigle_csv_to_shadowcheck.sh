#!/bin/bash
# Load FINAL cleaned WiGLE data into ShadowCheck PostgreSQL
# IMPORTANT: Converts epoch times from seconds to milliseconds (x1000) to match existing schema

set -e

CONTAINER="shadowcheck_postgres_18"
DB_NAME="shadowcheck"
DB_USER="shadowcheck_user"
CSV_DIR="/home/nunya/shadowcheck/pipelines/csv"

echo "=========================================="
echo "WiGLE CSV Data Loader - ShadowCheck"
echo "=========================================="
echo "Container: $CONTAINER"
echo "Database: $DB_NAME"
echo "CSV Directory: $CSV_DIR"
echo ""

# Check if container is running
if ! docker ps | grep -q "$CONTAINER"; then
    echo "✗ Container $CONTAINER is not running"
    exit 1
fi

echo "✓ Container is running"
echo ""

# Check if tables already exist
echo "Checking for existing tables..."
TABLE_CHECK=$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'app' AND table_name IN ('wigle_csv_networks', 'wigle_csv_locations');")

if [ "$TABLE_CHECK" -gt 0 ]; then
    echo "⚠ WARNING: Tables already exist!"
    read -p "Drop and recreate tables? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Aborted."
        exit 1
    fi
    echo "Dropping old tables..."
    docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << EOSQL
DROP TABLE IF EXISTS app.wigle_csv_locations CASCADE;
DROP TABLE IF EXISTS app.wigle_csv_networks CASCADE;
EOSQL
    echo "✓ Old tables dropped"
fi
echo ""

# Create tables
echo "Creating tables..."
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << 'EOSQL'
-- Create wigle_csv_networks table
CREATE TABLE app.wigle_csv_networks (
    unified_id BIGSERIAL PRIMARY KEY,
    source_id INTEGER,
    bssid TEXT UNIQUE NOT NULL,
    ssid TEXT,
    frequency INTEGER,
    capabilities TEXT,
    lasttime BIGINT,  -- Milliseconds since epoch
    lastlat DOUBLE PRECISION,
    lastlon DOUBLE PRECISION,
    type TEXT,  -- W, G, L, B, E
    bestlevel INTEGER,
    bestlat DOUBLE PRECISION,
    bestlon DOUBLE PRECISION,
    rcois TEXT,
    mfgrid INTEGER,
    service TEXT,
    sqlite_filename TEXT NOT NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wigle_csv_networks_bssid ON app.wigle_csv_networks(bssid);
CREATE INDEX idx_wigle_csv_networks_type ON app.wigle_csv_networks(type);
CREATE INDEX idx_wigle_csv_networks_filename ON app.wigle_csv_networks(sqlite_filename);
CREATE INDEX idx_wigle_csv_networks_source ON app.wigle_csv_networks(source_id);
CREATE INDEX idx_wigle_csv_networks_time ON app.wigle_csv_networks(lasttime);

-- Create wigle_csv_locations table
CREATE TABLE app.wigle_csv_locations (
    unified_id BIGSERIAL PRIMARY KEY,
    source_id INTEGER,
    _id BIGINT,
    bssid TEXT,
    level INTEGER,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    time BIGINT,  -- Milliseconds since epoch
    external INTEGER,
    mfgrid INTEGER,
    type TEXT,  -- W, G, L, B, E
    sqlite_filename TEXT NOT NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bssid, level, lat, lon, altitude, accuracy, time)
);

CREATE INDEX idx_wigle_csv_locations_bssid ON app.wigle_csv_locations(bssid);
CREATE INDEX idx_wigle_csv_locations_type ON app.wigle_csv_locations(type);
CREATE INDEX idx_wigle_csv_locations_coords ON app.wigle_csv_locations(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;
CREATE INDEX idx_wigle_csv_locations_filename ON app.wigle_csv_locations(sqlite_filename);
CREATE INDEX idx_wigle_csv_locations_source ON app.wigle_csv_locations(source_id);
CREATE INDEX idx_wigle_csv_locations_time ON app.wigle_csv_locations(time);
EOSQL
echo "✓ Tables created"
echo ""

# Copy files to container
echo "Copying CSV files to container..."
docker cp "$CSV_DIR/wigle_csv_networks_final.csv" "$CONTAINER":/tmp/
docker cp "$CSV_DIR/wigle_csv_locations_final.csv" "$CONTAINER":/tmp/
echo "✓ Files copied"
echo ""

# Load networks data with time conversion
echo "Loading networks data (46,507 unique networks)..."
echo "  Converting epoch times: seconds → milliseconds (x1000)"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << 'EOSQL'
-- Create temporary table to load raw data
CREATE TEMP TABLE wigle_networks_temp (
    source_id INTEGER,
    bssid TEXT,
    ssid TEXT,
    frequency INTEGER,
    capabilities TEXT,
    lasttime_seconds BIGINT,
    lastlat DOUBLE PRECISION,
    lastlon DOUBLE PRECISION,
    type TEXT,
    bestlevel INTEGER,
    bestlat DOUBLE PRECISION,
    bestlon DOUBLE PRECISION,
    rcois TEXT,
    mfgrid INTEGER,
    service TEXT,
    sqlite_filename TEXT
);

-- Load CSV into temp table
\COPY wigle_networks_temp FROM '/tmp/wigle_csv_networks_final.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL '');

-- Insert into final table with time conversion
INSERT INTO app.wigle_csv_networks (
    source_id, bssid, ssid, frequency, capabilities, lasttime,
    lastlat, lastlon, type, bestlevel, bestlat, bestlon,
    rcois, mfgrid, service, sqlite_filename
)
SELECT
    source_id, bssid, ssid, frequency, capabilities,
    lasttime_seconds * 1000 as lasttime,  -- Convert to milliseconds
    lastlat, lastlon, type, bestlevel, bestlat, bestlon,
    rcois, mfgrid, service, sqlite_filename
FROM wigle_networks_temp;

DROP TABLE wigle_networks_temp;
EOSQL
echo "✓ Networks loaded"
echo ""

# Load locations data with time conversion
echo "Loading locations data (123,047 observations)..."
echo "  Converting epoch times: seconds → milliseconds (x1000)"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << 'EOSQL'
-- Create temporary table to load raw data
CREATE TEMP TABLE wigle_locations_temp (
    source_id INTEGER,
    _id BIGINT,
    bssid TEXT,
    level INTEGER,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    time_seconds BIGINT,
    external INTEGER,
    mfgrid INTEGER,
    type TEXT,
    sqlite_filename TEXT
);

-- Load CSV into temp table
\COPY wigle_locations_temp FROM '/tmp/wigle_csv_locations_final.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL '');

-- Insert into final table with time conversion
INSERT INTO app.wigle_csv_locations (
    source_id, _id, bssid, level, lat, lon, altitude, accuracy,
    time, external, mfgrid, type, sqlite_filename
)
SELECT
    source_id, _id, bssid, level, lat, lon, altitude, accuracy,
    time_seconds * 1000 as time,  -- Convert to milliseconds
    external, mfgrid, type, sqlite_filename
FROM wigle_locations_temp;

DROP TABLE wigle_locations_temp;
EOSQL
echo "✓ Locations loaded"
echo ""

# Verify
echo "=========================================="
echo "VERIFICATION"
echo "=========================================="
echo ""
echo "Row counts:"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 'wigle_csv_networks' as table_name, COUNT(*) as row_count FROM app.wigle_csv_networks
UNION ALL
SELECT 'wigle_csv_locations' as table_name, COUNT(*) as row_count FROM app.wigle_csv_locations;"

echo ""
echo "Type distribution:"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT type, COUNT(*) as count FROM app.wigle_csv_networks GROUP BY type ORDER BY count DESC;"

echo ""
echo "Time format check (should be 13 digits for milliseconds):"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
    lasttime,
    LENGTH(lasttime::text) as time_length,
    TO_TIMESTAMP(lasttime/1000) as converted_time
FROM app.wigle_csv_networks
LIMIT 3;"

echo ""
echo "SSID whitespace check (should show no leading/trailing spaces):"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
    ssid,
    LENGTH(ssid) as ssid_length,
    LENGTH(TRIM(ssid)) as trimmed_length,
    CASE WHEN LENGTH(ssid) = LENGTH(TRIM(ssid)) THEN 'OK' ELSE 'HAS WHITESPACE!' END as status
FROM app.wigle_csv_networks
WHERE ssid IS NOT NULL
LIMIT 10;"

echo ""
echo "Sample data:"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT bssid, ssid, bestlevel, type, TO_TIMESTAMP(lasttime/1000) as last_seen
FROM app.wigle_csv_networks
LIMIT 5;"

echo ""
echo "Cleanup temporary files..."
docker exec "$CONTAINER" rm -f /tmp/wigle_csv_networks_final.csv /tmp/wigle_csv_locations_final.csv
echo "✓ Temp files removed"
echo ""
echo "=========================================="
echo "✅ IMPORT COMPLETE!"
echo "=========================================="
echo ""
echo "Tables created:"
echo "  • app.wigle_csv_networks (46,507 networks)"
echo "  • app.wigle_csv_locations (123,047 observations)"
echo ""
echo "All epoch times converted to milliseconds to match existing schema."
echo ""
