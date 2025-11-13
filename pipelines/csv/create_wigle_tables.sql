-- Create WiGLE CSV tables in ShadowCheck database
-- Epoch times are in MILLISECONDS (13 digits) to match existing schema

-- Drop tables if they exist
DROP TABLE IF EXISTS app.wigle_csv_locations CASCADE;
DROP TABLE IF EXISTS app.wigle_csv_networks CASCADE;

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
