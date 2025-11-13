-- Extend WiGLE Staging Tables with API Columns
-- This adds all columns from wigle_alpha_v3 tables to the staging tables
-- so we can merge API-enriched data while keeping source tracking

-- ========================================
-- EXTEND: wigle_sqlite_networks_staging
-- ========================================

-- Add all columns from wigle_alpha_v3_networks
ALTER TABLE app.wigle_sqlite_networks_staging
  ADD COLUMN IF NOT EXISTS name TEXT,                           -- Network name (API)
  ADD COLUMN IF NOT EXISTS encryption TEXT,                     -- Encryption details (API)
  ADD COLUMN IF NOT EXISTS channel INTEGER,                     -- Channel (API may differ from staging)
  ADD COLUMN IF NOT EXISTS bcninterval INTEGER,                 -- Beacon interval (API)
  ADD COLUMN IF NOT EXISTS trilaterated_lat DOUBLE PRECISION,   -- WiGLE's calculated lat
  ADD COLUMN IF NOT EXISTS trilaterated_lon DOUBLE PRECISION,   -- WiGLE's calculated lon
  ADD COLUMN IF NOT EXISTS best_cluster_qos INTEGER,            -- WiGLE quality score
  ADD COLUMN IF NOT EXISTS first_seen TIMESTAMP,                -- First seen timestamp (API)
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP,                 -- Last seen timestamp (API)
  ADD COLUMN IF NOT EXISTS last_update TIMESTAMP,               -- Last update timestamp (API)
  ADD COLUMN IF NOT EXISTS street_address JSONB,                -- Geocoded address (API)
  ADD COLUMN IF NOT EXISTS freenet TEXT,                        -- Free network flag (API)
  ADD COLUMN IF NOT EXISTS dhcp TEXT,                           -- DHCP detected (API)
  ADD COLUMN IF NOT EXISTS paynet TEXT,                         -- Paywall network (API)
  ADD COLUMN IF NOT EXISTS comment TEXT;                        -- Comments (API)

-- Add merge tracking columns
ALTER TABLE app.wigle_sqlite_networks_staging
  ADD COLUMN IF NOT EXISTS api_enriched BOOLEAN DEFAULT FALSE,  -- Has API data been merged?
  ADD COLUMN IF NOT EXISTS observation_count_staging INTEGER DEFAULT 0,  -- Count from SQLite
  ADD COLUMN IF NOT EXISTS observation_count_api INTEGER DEFAULT 0,      -- Count from API
  ADD COLUMN IF NOT EXISTS data_source_bitmask INTEGER DEFAULT 1,        -- 1=sqlite, 2=api, 3=both
  ADD COLUMN IF NOT EXISTS merge_timestamp TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS merge_batch_id TEXT;

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_networks_staging_trilaterated
  ON app.wigle_sqlite_networks_staging (trilaterated_lat, trilaterated_lon)
  WHERE trilaterated_lat IS NOT NULL AND trilaterated_lon IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_networks_staging_api_enriched
  ON app.wigle_sqlite_networks_staging (api_enriched)
  WHERE api_enriched = TRUE;

CREATE INDEX IF NOT EXISTS idx_networks_staging_merge_batch
  ON app.wigle_sqlite_networks_staging (merge_batch_id)
  WHERE merge_batch_id IS NOT NULL;

COMMENT ON COLUMN app.wigle_sqlite_networks_staging.name IS
  'Network name from WiGLE API (may differ from SSID)';
COMMENT ON COLUMN app.wigle_sqlite_networks_staging.trilaterated_lat IS
  'WiGLE-calculated trilaterated position (may differ from bestlat)';
COMMENT ON COLUMN app.wigle_sqlite_networks_staging.street_address IS
  'Geocoded street address from WiGLE API: {road, city, region, country, etc.}';
COMMENT ON COLUMN app.wigle_sqlite_networks_staging.data_source_bitmask IS
  'Track data sources: 1=sqlite only, 2=api only, 3=both sqlite and api';

-- ========================================
-- EXTEND: wigle_sqlite_locations_staging
-- ========================================

-- Add all observation columns from wigle_alpha_v3_observations
ALTER TABLE app.wigle_sqlite_locations_staging
  ADD COLUMN IF NOT EXISTS observation_time TIMESTAMP,           -- Parsed timestamp (API)
  ADD COLUMN IF NOT EXISTS last_update TIMESTAMP,                -- Last update (API)
  ADD COLUMN IF NOT EXISTS month_bucket TEXT,                    -- Month grouping (API)
  ADD COLUMN IF NOT EXISTS ssid TEXT,                            -- SSID at observation time (API)
  ADD COLUMN IF NOT EXISTS name TEXT,                            -- Network name (API)
  ADD COLUMN IF NOT EXISTS signal_dbm INTEGER,                   -- Signal in dBm (API format)
  ADD COLUMN IF NOT EXISTS noise INTEGER,                        -- Noise floor (API)
  ADD COLUMN IF NOT EXISTS snr INTEGER,                          -- Signal-to-noise ratio (API)
  ADD COLUMN IF NOT EXISTS channel INTEGER,                      -- Channel (API)
  ADD COLUMN IF NOT EXISTS frequency INTEGER,                    -- Frequency in MHz (API)
  ADD COLUMN IF NOT EXISTS encryption_value TEXT,                -- Encryption (API)
  ADD COLUMN IF NOT EXISTS wep TEXT,                             -- WEP status (API)
  ADD COLUMN IF NOT EXISTS wigle_net_id TEXT;                    -- WiGLE network ID (API)

-- Add source tracking columns
ALTER TABLE app.wigle_sqlite_locations_staging
  ADD COLUMN IF NOT EXISTS observation_source TEXT DEFAULT 'sqlite',  -- 'sqlite' or 'wigle_api'
  ADD COLUMN IF NOT EXISTS api_observation_id BIGINT,                 -- Link to alpha_v3_observations
  ADD COLUMN IF NOT EXISTS merge_batch_id TEXT,
  ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE,        -- Flagged as duplicate
  ADD COLUMN IF NOT EXISTS duplicate_of_unified_id BIGINT;            -- Points to original

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_locations_staging_observation_source
  ON app.wigle_sqlite_locations_staging (observation_source);

CREATE INDEX IF NOT EXISTS idx_locations_staging_api_obs_id
  ON app.wigle_sqlite_locations_staging (api_observation_id)
  WHERE api_observation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_locations_staging_ssid
  ON app.wigle_sqlite_locations_staging (ssid)
  WHERE ssid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_locations_staging_merge_batch
  ON app.wigle_sqlite_locations_staging (merge_batch_id)
  WHERE merge_batch_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_locations_staging_duplicates
  ON app.wigle_sqlite_locations_staging (is_duplicate, duplicate_of_unified_id)
  WHERE is_duplicate = TRUE;

COMMENT ON COLUMN app.wigle_sqlite_locations_staging.observation_source IS
  'Source of observation: sqlite (local wardriving) or wigle_api (from WiGLE API)';
COMMENT ON COLUMN app.wigle_sqlite_locations_staging.ssid IS
  'SSID observed at this specific location/time (from API, staging lacks this)';
COMMENT ON COLUMN app.wigle_sqlite_locations_staging.signal_dbm IS
  'Signal strength in dBm (API format, staging has level in different scale)';
COMMENT ON COLUMN app.wigle_sqlite_locations_staging.is_duplicate IS
  'Flagged as duplicate of existing observation (same bssid/location/time within threshold)';

-- ========================================
-- UTILITY VIEWS
-- ========================================

-- View: Networks with API enrichment
CREATE OR REPLACE VIEW app.wigle_networks_enriched AS
SELECT
    n.*,
    CASE
        WHEN n.api_enriched THEN 'API-enriched'
        ELSE 'SQLite-only'
    END as enrichment_status,
    CASE
        WHEN n.trilaterated_lat IS NOT NULL
             AND n.bestlat IS NOT NULL
        THEN
            ST_Distance(
                ST_MakePoint(n.bestlon, n.bestlat)::geography,
                ST_MakePoint(n.trilaterated_lon, n.trilaterated_lat)::geography
            )
        ELSE NULL
    END as trilateration_distance_meters
FROM app.wigle_sqlite_networks_staging n;

COMMENT ON VIEW app.wigle_networks_enriched IS
  'Networks with API enrichment status and trilateration accuracy comparison';

-- View: API observations with deduplication status
CREATE OR REPLACE VIEW app.wigle_observations_with_source AS
SELECT
    unified_id,
    bssid,
    ssid,
    lat,
    lon,
    CASE
        WHEN observation_source = 'sqlite' THEN level
        WHEN observation_source = 'wigle_api' THEN signal_dbm
        ELSE level
    END as signal_strength,
    CASE
        WHEN time IS NOT NULL THEN to_timestamp(time / 1000)
        ELSE observation_time
    END as observation_timestamp,
    observation_source,
    is_duplicate,
    sqlite_filename,
    merge_batch_id
FROM app.wigle_sqlite_locations_staging
ORDER BY bssid, observation_timestamp;

COMMENT ON VIEW app.wigle_observations_with_source IS
  'Unified view of observations from both SQLite and API sources with normalized fields';

-- ========================================
-- SUMMARY
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✓ Schema extensions applied successfully';
    RAISE NOTICE '  - Added % columns to networks_staging',
        (SELECT count(*) FROM information_schema.columns
         WHERE table_name = 'wigle_sqlite_networks_staging'
         AND column_name IN ('name', 'encryption', 'trilaterated_lat', 'api_enriched'));
    RAISE NOTICE '  - Added % columns to locations_staging',
        (SELECT count(*) FROM information_schema.columns
         WHERE table_name = 'wigle_sqlite_locations_staging'
         AND column_name IN ('ssid', 'signal_dbm', 'observation_source', 'api_observation_id'));
    RAISE NOTICE '  - Created 2 utility views';
    RAISE NOTICE '  - Created % new indexes', 8;
END $$;
