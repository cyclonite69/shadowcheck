-- Simple Cutover: Staging -> Production
-- Run in a transaction for safety

BEGIN;

-- Archive legacy tables
ALTER TABLE app.networks_legacy RENAME TO networks_archive_20251113;
ALTER TABLE app.locations_legacy RENAME TO locations_archive_20251113;

-- Promote staging to production
ALTER TABLE app.wigle_sqlite_networks_staging_deduped RENAME TO networks;
ALTER TABLE app.wigle_sqlite_locations_staging RENAME TO locations;

-- Rename sequences (they kept the staging name)
ALTER SEQUENCE app.wigle_sqlite_networks_staging_unified_id_seq
    RENAME TO networks_unified_id_seq;
ALTER SEQUENCE app.wigle_sqlite_locations_staging_unified_id_seq
    RENAME TO locations_unified_id_seq;

-- Rename primary key indexes
ALTER INDEX wigle_sqlite_networks_staging_deduped_pkey RENAME TO networks_pkey;
ALTER INDEX wigle_sqlite_locations_staging_pkey RENAME TO locations_pkey;

-- Rename other indexes to clean names
ALTER INDEX idx_deduped_networks_bssid RENAME TO idx_networks_bssid_unique;
ALTER INDEX idx_wigle_sqlite_locations_bssid RENAME TO idx_locations_bssid;
ALTER INDEX idx_wigle_sqlite_locations_coords RENAME TO idx_locations_coords;
ALTER INDEX idx_wigle_sqlite_locations_filename RENAME TO idx_locations_source_file;
ALTER INDEX idx_wigle_sqlite_locations_source RENAME TO idx_locations_source_id;

-- Add unique constraint on BSSID for networks (was in legacy)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_networks_bssid' AND conrelid = 'app.networks'::regclass
    ) THEN
        ALTER TABLE app.networks ADD CONSTRAINT uq_networks_bssid UNIQUE (bssid);
    END IF;
END $$;

-- Summary
SELECT 'Cutover complete!' as status,
       (SELECT COUNT(*) FROM app.networks) as network_count,
       (SELECT COUNT(*) FROM app.locations) as location_count,
       (SELECT COUNT(*) FROM app.networks WHERE api_enriched = TRUE) as enriched_networks,
       (SELECT COUNT(*) FROM app.locations WHERE ssid IS NOT NULL) as locations_with_ssid;

COMMIT;
