-- Cutover Staging Tables to Production
-- Replaces networks_legacy and locations_legacy with enriched staging tables
--
-- BACKUP FIRST: Database backup already exists from earlier
-- Run: docker exec shadowcheck_postgres_18 pg_dump ...
--
-- Strategy:
-- 1. Rename legacy tables to _archive_YYYYMMDD
-- 2. Rename staging_deduped -> networks (new production)
-- 3. Rename locations_staging -> locations (new production)
-- 4. Migrate indexes/constraints/triggers
-- 5. Update sequences

BEGIN;

-- ============================================================================
-- PHASE 1: Archive Legacy Tables
-- ============================================================================
DO $$
DECLARE
    backup_suffix TEXT := '_archive_' || to_char(NOW(), 'YYYYMMDD_HH24MI');
BEGIN
    RAISE NOTICE 'Phase 1: Archiving legacy tables with suffix: %', backup_suffix;

    -- Rename legacy tables to archive
    EXECUTE 'ALTER TABLE IF EXISTS app.networks_legacy RENAME TO networks' || backup_suffix;
    EXECUTE 'ALTER TABLE IF EXISTS app.locations_legacy RENAME TO locations' || backup_suffix;

    -- Rename legacy sequences
    EXECUTE 'ALTER SEQUENCE IF EXISTS app.network_unified_id_seq RENAME TO network_unified_id_seq' || backup_suffix;
    EXECUTE 'ALTER SEQUENCE IF EXISTS app.location_unified_id_seq RENAME TO location_unified_id_seq' || backup_suffix;

    RAISE NOTICE '✓ Legacy tables archived';
END $$;

-- ============================================================================
-- PHASE 2: Promote Staging Tables to Production
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Phase 2: Promoting staging tables to production...';

    -- Rename staging_deduped -> networks (new production)
    ALTER TABLE app.wigle_sqlite_networks_staging_deduped RENAME TO networks;

    -- Rename locations_staging -> locations (new production)
    ALTER TABLE app.wigle_sqlite_locations_staging RENAME TO locations;

    -- Rename sequences to production names
    ALTER SEQUENCE app.wigle_sqlite_networks_staging_deduped_unified_id_seq
        RENAME TO network_unified_id_seq;

    ALTER SEQUENCE app.wigle_sqlite_locations_staging_unified_id_seq
        RENAME TO location_unified_id_seq;

    RAISE NOTICE '✓ Staging tables promoted to production';
END $$;

-- ============================================================================
-- PHASE 3: Add Missing Constraints from Legacy
-- ============================================================================

-- Networks table - add unique constraint on BSSID (was in legacy)
ALTER TABLE app.networks
    ADD CONSTRAINT IF NOT EXISTS uq_networks_bssid UNIQUE (bssid);

-- Update primary key constraint name to match legacy
ALTER INDEX app.wigle_sqlite_networks_staging_deduped_pkey
    RENAME TO network_pkey;

ALTER INDEX app.wigle_sqlite_locations_staging_pkey
    RENAME TO location_pkey;

-- ============================================================================
-- PHASE 4: Rename Indexes to Match Legacy Naming
-- ============================================================================

-- Networks indexes
ALTER INDEX IF EXISTS idx_deduped_networks_bssid RENAME TO idx_networks_bssid;
ALTER INDEX IF EXISTS idx_deduped_networks_type RENAME TO idx_networks_type;
ALTER INDEX IF EXISTS idx_deduped_networks_time RENAME TO idx_networks_lasttime;

-- Add missing indexes from legacy
CREATE INDEX IF NOT EXISTS idx_networks_capabilities ON app.networks (capabilities);
CREATE INDEX IF NOT EXISTS idx_networks_bestlevel ON app.networks (bestlevel)
    WHERE bestlevel IS NOT NULL;

-- Recreate GIS index for networks (was in legacy)
CREATE INDEX IF NOT EXISTS idx_networks_location
    ON app.networks USING gist (st_setsrid(st_makepoint(lastlon, lastlat), 4326))
    WHERE lastlat IS NOT NULL AND lastlon IS NOT NULL;

-- Locations indexes
ALTER INDEX IF EXISTS idx_wigle_sqlite_locations_bssid RENAME TO idx_locations_bssid;
ALTER INDEX IF EXISTS idx_wigle_sqlite_locations_coords RENAME TO idx_locations_coords;

-- Add time-based index (was in legacy)
CREATE INDEX IF NOT EXISTS idx_locations_bssid_time ON app.locations (bssid, time);

-- Recreate GIS index for locations (was in legacy)
DROP INDEX IF EXISTS idx_wigle_sqlite_locations_coords;
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon
    ON app.locations USING gist (st_makepoint(lon, lat));

-- ============================================================================
-- PHASE 5: Create Triggers (from legacy)
-- ============================================================================

-- Text trimming trigger for networks
CREATE OR REPLACE FUNCTION app.trim_networks_text_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bssid := TRIM(NEW.bssid);
    NEW.ssid := TRIM(NEW.ssid);
    NEW.type := TRIM(NEW.type);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_all_text_trigger ON app.networks;
CREATE TRIGGER trim_all_text_trigger
    BEFORE INSERT OR UPDATE ON app.networks
    FOR EACH ROW
    EXECUTE FUNCTION app.trim_networks_text_fields();

-- Text trimming trigger for locations
CREATE OR REPLACE FUNCTION app.trim_locations_text_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bssid := TRIM(NEW.bssid);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_text_trigger ON app.locations;
CREATE TRIGGER trim_text_trigger
    BEFORE INSERT OR UPDATE ON app.locations
    FOR EACH ROW
    EXECUTE FUNCTION app.trim_locations_text_fields();

-- ============================================================================
-- PHASE 6: Update Statistics and Vacuum
-- ============================================================================

ANALYZE app.networks;
ANALYZE app.locations;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
    net_count BIGINT;
    loc_count BIGINT;
    enriched_count BIGINT;
    ssid_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO net_count FROM app.networks;
    SELECT COUNT(*) INTO loc_count FROM app.locations;
    SELECT COUNT(*) INTO enriched_count FROM app.networks WHERE api_enriched = TRUE;
    SELECT COUNT(*) INTO ssid_count FROM app.locations WHERE ssid IS NOT NULL;

    RAISE NOTICE '';
    RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  CUTOVER COMPLETE                                            ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Production Tables:';
    RAISE NOTICE '  app.networks:          % rows', net_count;
    RAISE NOTICE '    - API enriched:      % (%.2f%%)', enriched_count, (enriched_count::float / net_count * 100);
    RAISE NOTICE '  app.locations:         % rows', loc_count;
    RAISE NOTICE '    - With SSID:         % (%.2f%%)', ssid_count, (ssid_count::float / loc_count * 100);
    RAISE NOTICE '';
    RAISE NOTICE 'Archive Tables:';
    RAISE NOTICE '  app.networks_archive_*';
    RAISE NOTICE '  app.locations_archive_*';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Cutover successful';
    RAISE NOTICE '';
END $$;

COMMIT;
