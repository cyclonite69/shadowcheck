-- WiGLE API Query Results Staging Tables
-- Separate staging area for WiGLE API query results
-- NEVER merged to legacy tables - kept separate for data provenance

-- WiGLE API networks staging table
CREATE TABLE IF NOT EXISTS app.wigle_api_networks_staging (
    wigle_api_net_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL,
    ssid TEXT,
    frequency INTEGER,
    capabilities TEXT,
    type TEXT,
    lasttime TIMESTAMP,
    lastlat DOUBLE PRECISION,
    lastlon DOUBLE PRECISION,

    -- Additional WiGLE API metadata
    trilat DOUBLE PRECISION,
    trilong DOUBLE PRECISION,
    channel INTEGER,
    qos INTEGER,
    transid TEXT,
    firsttime TIMESTAMP,
    lastupdt TIMESTAMP,
    country TEXT,
    region TEXT,
    city TEXT,
    road TEXT,
    housenumber TEXT,
    postalcode TEXT,
    userfound BOOLEAN,
    device INTEGER,
    mfgr_id TEXT,
    name TEXT,

    -- Query metadata
    query_timestamp TIMESTAMPTZ DEFAULT NOW(),
    query_params JSONB,

    UNIQUE(bssid, query_timestamp)
);

-- WiGLE API locations staging table
CREATE TABLE IF NOT EXISTS app.wigle_api_locations_staging (
    wigle_api_loc_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    time TIMESTAMP,
    signal_level INTEGER,

    -- Query metadata
    query_timestamp TIMESTAMPTZ DEFAULT NOW(),
    query_params JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wigle_api_networks_bssid ON app.wigle_api_networks_staging(bssid);
CREATE INDEX IF NOT EXISTS idx_wigle_api_networks_query_time ON app.wigle_api_networks_staging(query_timestamp);
CREATE INDEX IF NOT EXISTS idx_wigle_api_locations_bssid ON app.wigle_api_locations_staging(bssid);
CREATE INDEX IF NOT EXISTS idx_wigle_api_locations_coords ON app.wigle_api_locations_staging(lat, lon);

-- Comments
COMMENT ON TABLE app.wigle_api_networks_staging IS 'Staging table for WiGLE API query results - NEVER merged to legacy tables';
COMMENT ON TABLE app.wigle_api_locations_staging IS 'Staging table for WiGLE API location observations';
