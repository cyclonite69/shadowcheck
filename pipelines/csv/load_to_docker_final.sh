#!/bin/bash
# Load FINAL cleaned WiGLE data into Docker PostgreSQL

set -e

CONTAINER="shadowcheck_postgres_18"
DB_NAME="shadowcheck"
DB_USER="postgres"

echo "=========================================="
echo "WiGLE CSV Data Loader - FINAL"
echo "=========================================="
echo "Container: $CONTAINER"
echo "Database: $DB_NAME"
echo ""

# Check if container is running
if ! docker ps | grep -q "$CONTAINER"; then
    echo "✗ Container $CONTAINER is not running"
    exit 1
fi

echo "✓ Container is running"
echo ""

# Drop old tables if they exist (optional)
echo "Preparing database..."
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << EOSQL
DROP TABLE IF EXISTS app.wigle_csv_locations CASCADE;
DROP TABLE IF EXISTS app.wigle_csv_networks CASCADE;
EOSQL
echo "✓ Old tables dropped (if existed)"
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
    lasttime BIGINT,
    lastlat DOUBLE PRECISION,
    lastlon DOUBLE PRECISION,
    type TEXT,
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
CREATE INDEX idx_wigle_csv_networks_filename ON app.wigle_csv_networks(sqlite_filename);
CREATE INDEX idx_wigle_csv_networks_source ON app.wigle_csv_networks(source_id);

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
    time BIGINT,
    external INTEGER,
    mfgrid INTEGER,
    sqlite_filename TEXT NOT NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bssid, level, lat, lon, altitude, accuracy, time)
);

CREATE INDEX idx_wigle_csv_locations_bssid ON app.wigle_csv_locations(bssid);
CREATE INDEX idx_wigle_csv_locations_coords ON app.wigle_csv_locations(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;
CREATE INDEX idx_wigle_csv_locations_filename ON app.wigle_csv_locations(sqlite_filename);
CREATE INDEX idx_wigle_csv_locations_source ON app.wigle_csv_locations(source_id);
EOSQL
echo "✓ Tables created"
echo ""

# Copy files to container
echo "Copying files to container..."
docker cp /mnt/user-data/outputs/wigle_csv_networks_final.csv "$CONTAINER":/tmp/
docker cp /mnt/user-data/outputs/wigle_csv_locations_final.csv "$CONTAINER":/tmp/
echo "✓ Files copied"
echo ""

# Load networks data
echo "Loading networks data (46,507 unique networks)..."
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << EOSQL
\COPY app.wigle_csv_networks (source_id, bssid, ssid, frequency, capabilities, lasttime, lastlat, lastlon, type, bestlevel, bestlat, bestlon, rcois, mfgrid, service, sqlite_filename) FROM '/tmp/wigle_csv_networks_final.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
EOSQL
echo "✓ Networks loaded"
echo ""

# Load locations data
echo "Loading locations data (123,047 observations)..."
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << EOSQL
\COPY app.wigle_csv_locations (source_id, _id, bssid, level, lat, lon, altitude, accuracy, time, external, mfgrid, sqlite_filename) FROM '/tmp/wigle_csv_locations_final.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
EOSQL
echo "✓ Locations loaded"
echo ""

# Verify
echo "Verification:"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 'wigle_csv_networks' as table_name, COUNT(*) as row_count FROM app.wigle_csv_networks
UNION ALL
SELECT 'wigle_csv_locations' as table_name, COUNT(*) as row_count FROM app.wigle_csv_locations;"

echo ""
echo "Sample data:"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT bssid, ssid, bestlevel, type FROM app.wigle_csv_networks LIMIT 3;"

echo ""
echo "✓ Import complete!"
echo ""
echo "Cleanup temporary files..."
docker exec "$CONTAINER" rm -f /tmp/wigle_csv_networks_final.csv /tmp/wigle_csv_locations_final.csv
echo "✓ Done!"

