-- Load WiGLE CSV data with time conversion (seconds → milliseconds)

-- ========================================
-- LOAD NETWORKS DATA
-- ========================================

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
    mfgrid DOUBLE PRECISION,  -- Accept as float, will cast to integer
    service TEXT,
    sqlite_filename TEXT
);

-- Load CSV into temp table (empty strings treated as NULL)
\COPY wigle_networks_temp FROM '/tmp/wigle_csv_networks_final.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', FORCE_NULL (source_id, mfgrid, service, rcois));

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
    rcois, CAST(mfgrid AS INTEGER), service, sqlite_filename
FROM wigle_networks_temp;

DROP TABLE wigle_networks_temp;

-- ========================================
-- LOAD LOCATIONS DATA
-- ========================================

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
    mfgrid DOUBLE PRECISION,  -- Accept as float, will cast to integer
    type TEXT,
    sqlite_filename TEXT
);

-- Load CSV into temp table (empty strings treated as NULL)
\COPY wigle_locations_temp FROM '/tmp/wigle_csv_locations_final.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', FORCE_NULL (source_id, mfgrid, external));

-- Insert into final table with time conversion
-- Use ON CONFLICT DO NOTHING to skip exact duplicates
INSERT INTO app.wigle_csv_locations (
    source_id, _id, bssid, level, lat, lon, altitude, accuracy,
    time, external, mfgrid, type, sqlite_filename
)
SELECT
    source_id, _id, bssid, level, lat, lon, altitude, accuracy,
    time_seconds * 1000 as time,  -- Convert to milliseconds
    external, CAST(mfgrid AS INTEGER), type, sqlite_filename
FROM wigle_locations_temp
ON CONFLICT (bssid, level, lat, lon, altitude, accuracy, time) DO NOTHING;

DROP TABLE wigle_locations_temp;
