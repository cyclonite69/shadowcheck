-- ============================================================================
-- Migration: Replace Legacy Tables with WiGLE SQLite Data
-- ============================================================================
-- This script migrates data from wigle_sqlite_networks and
-- wigle_sqlite_locations_staging to replace networks_legacy and locations_legacy
--
-- Created: 2025-11-09
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Backup existing legacy tables
-- ============================================================================

-- Drop old backup tables if they exist
DROP TABLE IF EXISTS app.networks_legacy_backup CASCADE;
DROP TABLE IF EXISTS app.locations_legacy_backup CASCADE;

-- Create backup of networks_legacy
CREATE TABLE app.networks_legacy_backup AS
SELECT * FROM app.networks_legacy;

-- Create backup of locations_legacy
CREATE TABLE app.locations_legacy_backup AS
SELECT * FROM app.locations_legacy;

\echo 'Backup tables created:'
\echo '  - app.networks_legacy_backup'
\echo '  - app.locations_legacy_backup'

-- ============================================================================
-- STEP 2: Drop dependent objects on networks_legacy
-- ============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS t_proactive_alert ON app.networks_legacy CASCADE;
DROP TRIGGER IF EXISTS trim_all_text_trigger ON app.networks_legacy CASCADE;

-- Drop views that depend on networks_legacy
DROP VIEW IF EXISTS app.latest_location_per_bssid CASCADE;

-- Note existing foreign keys for locations_legacy
-- location_source_id_fkey FOREIGN KEY (source_id) REFERENCES app.provenance_legacy(id)

\echo 'Dependent objects dropped'

-- ============================================================================
-- STEP 3: Truncate legacy tables (preserve structure)
-- ============================================================================

TRUNCATE TABLE app.locations_legacy RESTART IDENTITY CASCADE;
TRUNCATE TABLE app.networks_legacy RESTART IDENTITY CASCADE;

\echo 'Legacy tables truncated'

-- ============================================================================
-- STEP 4: Migrate wigle_sqlite_networks -> networks_legacy
-- ============================================================================

INSERT INTO app.networks_legacy (
    unified_id,
    source_id,
    bssid,
    ssid,
    frequency,
    capabilities,
    lasttime,
    lastlat,
    lastlon,
    type,
    bestlevel,
    bestlat,
    bestlon
)
SELECT
    network_id,                                                    -- unified_id
    NULL,                                                           -- source_id (no provenance mapping yet)
    bssid,
    ssid,
    frequency,
    capabilities,
    EXTRACT(EPOCH FROM last_seen)::bigint * 1000,                 -- lasttime (convert to milliseconds)
    lastlat,
    lastlon,
    type,
    bestlevel,
    bestlat,
    bestlon
FROM app.wigle_sqlite_networks;

\echo 'Networks migrated: ' :'rows_affected' ' records'

-- ============================================================================
-- STEP 5: Migrate wigle_sqlite_locations_staging -> locations_legacy
-- ============================================================================

INSERT INTO app.locations_legacy (
    unified_id,
    source_id,
    _id,
    bssid,
    level,
    lat,
    lon,
    altitude,
    accuracy,
    time,
    external,
    mfgrid
)
SELECT
    unified_id,
    source_id,
    _id,
    bssid,
    level,
    lat,
    lon,
    altitude,
    accuracy,
    time,
    external,
    mfgrid
FROM app.wigle_sqlite_locations_staging;

\echo 'Locations migrated: ' :'rows_affected' ' records'

-- ============================================================================
-- STEP 6: Recreate indexes for networks_legacy
-- ============================================================================

-- Spatial index for network locations
CREATE INDEX IF NOT EXISTS idx_networks_legacy_location
ON app.networks_legacy
USING gist (st_setsrid(st_makepoint(lastlon, lastlat), 4326))
WHERE lastlat IS NOT NULL AND lastlon IS NOT NULL;

-- BSSID index
CREATE INDEX IF NOT EXISTS idx_networks_bssid ON app.networks_legacy(bssid);

-- Signal strength index
CREATE INDEX IF NOT EXISTS idx_networks_bestlevel ON app.networks_legacy(bestlevel) WHERE bestlevel IS NOT NULL;

-- Capabilities index
CREATE INDEX IF NOT EXISTS idx_networks_capabilities ON app.networks_legacy(capabilities);

-- Type index
CREATE INDEX IF NOT EXISTS idx_networks_type ON app.networks_legacy(type);

-- Unique BSSID constraint
CREATE UNIQUE INDEX IF NOT EXISTS uq_networks_legacy_bssid ON app.networks_legacy(bssid);

\echo 'Networks indexes recreated'

-- ============================================================================
-- STEP 7: Recreate indexes for locations_legacy
-- ============================================================================

-- BSSID index
CREATE INDEX IF NOT EXISTS idx_locations_bssid ON app.locations_legacy(bssid);

-- Spatial index for location coordinates
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon
ON app.locations_legacy
USING gist (st_makepoint(lon, lat));

-- BSSID + time index for time-series queries
CREATE INDEX IF NOT EXISTS idx_locations_legacy_bssid_time
ON app.locations_legacy(bssid, time);

-- Coordinate range index
CREATE INDEX IF NOT EXISTS idx_locations_legacy_coords
ON app.locations_legacy(lat, lon)
WHERE lat IS NOT NULL AND lon IS NOT NULL;

\echo 'Locations indexes recreated'

-- ============================================================================
-- STEP 8: Recreate triggers
-- ============================================================================

-- Text trimming trigger for networks_legacy
CREATE OR REPLACE FUNCTION app.trim_networks_legacy_text_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bssid = TRIM(NEW.bssid);
    IF NEW.ssid IS NOT NULL THEN
        NEW.ssid = TRIM(NEW.ssid);
    END IF;
    IF NEW.capabilities IS NOT NULL THEN
        NEW.capabilities = TRIM(NEW.capabilities);
    END IF;
    IF NEW.type IS NOT NULL THEN
        NEW.type = TRIM(NEW.type);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_all_text_trigger ON app.networks_legacy;
CREATE TRIGGER trim_all_text_trigger
    BEFORE INSERT OR UPDATE ON app.networks_legacy
    FOR EACH ROW
    EXECUTE FUNCTION app.trim_networks_legacy_text_fields();

-- Text trimming trigger for locations_legacy
CREATE OR REPLACE FUNCTION app.trim_locations_legacy_text_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bssid IS NOT NULL THEN
        NEW.bssid = TRIM(NEW.bssid);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_text_trigger ON app.locations_legacy;
CREATE TRIGGER trim_text_trigger
    BEFORE INSERT OR UPDATE ON app.locations_legacy
    FOR EACH ROW
    EXECUTE FUNCTION app.trim_locations_legacy_text_fields();

-- Proactive alert trigger (if the function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_new_network_sighting_alert') THEN
        CREATE TRIGGER t_proactive_alert
            AFTER INSERT OR UPDATE ON app.networks_legacy
            FOR EACH ROW
            EXECUTE FUNCTION app.process_new_network_sighting_alert();
        RAISE NOTICE 'Proactive alert trigger recreated';
    ELSE
        RAISE NOTICE 'Skipping proactive alert trigger (function does not exist)';
    END IF;
END $$;

\echo 'Triggers recreated'

-- ============================================================================
-- STEP 9: Recreate dependent views
-- ============================================================================

-- Recreate latest_location_per_bssid view
CREATE OR REPLACE VIEW app.latest_location_per_bssid AS
SELECT DISTINCT ON (bssid)
    unified_id,
    bssid,
    level,
    lat,
    lon,
    altitude,
    accuracy,
    time,
    external,
    mfgrid
FROM app.locations_legacy
WHERE lat IS NOT NULL
  AND lon IS NOT NULL
  AND lat BETWEEN -90 AND 90
  AND lon BETWEEN -180 AND 180
ORDER BY bssid, time DESC NULLS LAST;

\echo 'Dependent views recreated'

-- ============================================================================
-- STEP 10: Update statistics
-- ============================================================================

ANALYZE app.networks_legacy;
ANALYZE app.locations_legacy;

\echo 'Table statistics updated'

-- ============================================================================
-- STEP 11: Verification queries
-- ============================================================================

\echo ''
\echo '================================'
\echo 'Migration Summary'
\echo '================================'

SELECT
    'networks_legacy' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT bssid) as unique_bssids,
    MIN(lasttime) as earliest_observation,
    MAX(lasttime) as latest_observation
FROM app.networks_legacy
UNION ALL
SELECT
    'locations_legacy' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT bssid) as unique_bssids,
    MIN(time) as earliest_observation,
    MAX(time) as latest_observation
FROM app.locations_legacy;

\echo ''
\echo 'Backup tables preserved:'
\echo '  - app.networks_legacy_backup (' SELECT COUNT(*) FROM app.networks_legacy_backup; ' records)'
\echo '  - app.locations_legacy_backup (' SELECT COUNT(*) FROM app.locations_legacy_backup; ' records)'

COMMIT;

\echo ''
\echo '================================'
\echo 'Migration Complete!'
\echo '================================'
\echo 'To drop backup tables (if migration is successful):'
\echo '  DROP TABLE app.networks_legacy_backup;'
\echo '  DROP TABLE app.locations_legacy_backup;'
