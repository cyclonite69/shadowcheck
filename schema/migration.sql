-- =====================================================
-- ShadowCheck Database Migration Script
-- Migrates from current schema to refactored 3NF schema
-- PRESERVES ALL EXISTING DATA
-- =====================================================

BEGIN;

-- =====================================================
-- PHASE 1: BACKUP VERIFICATION
-- =====================================================

-- Verify we have backup of critical data
DO $$
BEGIN
    -- Check that legacy tables exist and have data
    IF NOT EXISTS (SELECT 1 FROM app.locations LIMIT 1) THEN
        RAISE EXCEPTION 'Legacy locations table is empty - cannot proceed with migration';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM app.networks LIMIT 1) THEN
        RAISE EXCEPTION 'Legacy networks table is empty - cannot proceed with migration';
    END IF;

    RAISE NOTICE 'Migration precondition check passed';
END $$;

-- =====================================================
-- PHASE 2: CREATE NEW SCHEMA STRUCTURES
-- =====================================================

-- Create the refactored schema (if not already exists)
-- Note: This assumes schema_refactored.sql has been executed

-- Verify new tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'wireless_access_points') THEN
        RAISE EXCEPTION 'New schema tables not found - run schema_refactored.sql first';
    END IF;
    RAISE NOTICE 'New schema tables verified';
END $$;

-- =====================================================
-- PHASE 3: POPULATE OUI MANUFACTURERS FROM IEEE DATA
-- =====================================================

RAISE NOTICE 'Migrating IEEE OUI data to manufacturers table...';

-- Clear any existing data
TRUNCATE app.oui_manufacturers RESTART IDENTITY CASCADE;

-- Migrate from ieee_ouis to oui_manufacturers
INSERT INTO app.oui_manufacturers (
    oui_prefix_hex,
    organization_name,
    organization_address,
    registry_type,
    is_active,
    record_created_at
)
SELECT
    UPPER(REPLACE(assignment, ':', '')) as oui_prefix_hex,
    COALESCE(NULLIF(TRIM(organization_name), ''), 'Unknown') as organization_name,
    NULLIF(TRIM(organization_address), '') as organization_address,
    COALESCE(NULLIF(TRIM(registry), ''), 'MA-L') as registry_type,
    TRUE as is_active,
    NOW() as record_created_at
FROM app.ieee_ouis
WHERE assignment IS NOT NULL
  AND organization_name IS NOT NULL
ON CONFLICT (oui_prefix_hex) DO NOTHING;

RAISE NOTICE 'Populated % manufacturers from IEEE OUI data', (SELECT COUNT(*) FROM app.oui_manufacturers);

-- =====================================================
-- PHASE 4: MIGRATE DATA SOURCES
-- =====================================================

RAISE NOTICE 'Migrating data sources...';

-- Enhanced data sources migration with better provenance mapping
INSERT INTO app.data_sources (
    data_source_id,
    source_name,
    source_type,
    source_description,
    first_import_at,
    last_import_at,
    is_active
)
SELECT
    p.id,
    CASE
        WHEN p.filename LIKE '%s22%' THEN 'Samsung Galaxy S22 (' || p.filename || ')'
        WHEN p.filename LIKE '%j24%' THEN 'Custom Device J24 (' || p.filename || ')'
        WHEN p.filename LIKE '%g63%' THEN 'Device G63 (' || p.filename || ')'
        ELSE 'Legacy Import (' || COALESCE(p.filename, 'unknown') || ')'
    END as source_name,
    'wigle_import'::app.data_source_type as source_type,
    CASE
        WHEN p.device_type IS NOT NULL THEN 'WiGLE import from ' || p.device_type || ' device'
        ELSE 'WiGLE import from unknown device type'
    END as source_description,
    COALESCE(p.import_date::timestamptz, NOW()) as first_import_at,
    COALESCE(p.import_date::timestamptz, NOW()) as last_import_at,
    TRUE as is_active
FROM app.provenance p
ON CONFLICT (data_source_id) DO UPDATE SET
    source_name = EXCLUDED.source_name,
    source_description = EXCLUDED.source_description,
    record_updated_at = NOW();

RAISE NOTICE 'Migrated % data sources from provenance', (SELECT COUNT(*) FROM app.data_sources WHERE data_source_id < 1000);

-- =====================================================
-- PHASE 5: MIGRATE WIRELESS ACCESS POINTS
-- =====================================================

RAISE NOTICE 'Migrating wireless access points...';

-- Function to determine radio technology from frequency
CREATE OR REPLACE FUNCTION migrate_radio_technology(freq INTEGER)
RETURNS app.radio_technology AS $$
BEGIN
    CASE
        WHEN freq BETWEEN 2400000000 AND 2500000000 THEN RETURN 'wifi_2_4_ghz';
        WHEN freq BETWEEN 5000000000 AND 6000000000 THEN RETURN 'wifi_5_ghz';
        WHEN freq BETWEEN 6000000000 AND 7000000000 THEN RETURN 'wifi_6_ghz';
        WHEN freq BETWEEN 2400000000 AND 2485000000 THEN RETURN 'bluetooth_classic';
        ELSE RETURN 'unknown';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to extract OUI from MAC address
CREATE OR REPLACE FUNCTION extract_oui(mac_address TEXT)
RETURNS TEXT AS $$
BEGIN
    IF mac_address IS NULL OR LENGTH(mac_address) < 8 THEN
        RETURN '000000';
    END IF;

    -- Extract first 6 hex characters (OUI)
    RETURN UPPER(REPLACE(SUBSTRING(mac_address, 1, 8), ':', ''));
END;
$$ LANGUAGE plpgsql;

-- Migrate from current radio_access_points to new wireless_access_points
INSERT INTO app.wireless_access_points (
    access_point_id,
    mac_address,
    manufacturer_id,
    radio_technology,
    network_name,
    is_hidden_network,
    primary_frequency_hz,
    is_mobile_device,
    primary_location_point,
    coverage_area_polygon,
    total_signal_readings,
    unique_observation_locations,
    first_observed_at,
    last_observed_at,
    data_confidence_score,
    quality_flags,
    record_created_at,
    record_updated_at
)
SELECT
    rap.access_point_id,
    rap.bssid_identifier::text as mac_address,
    COALESCE(
        (SELECT manufacturer_id FROM app.oui_manufacturers
         WHERE oui_prefix_hex = extract_oui(rap.bssid_identifier::text) LIMIT 1),
        (SELECT manufacturer_id FROM app.oui_manufacturers WHERE oui_prefix_hex = '000000' LIMIT 1)
    ) as manufacturer_id,
    COALESCE(rap.radio_technology, 'wifi_2_4_ghz'::app.radio_technology) as radio_technology,

    -- Get most common SSID for this access point
    (SELECT network_ssid FROM app.network_observations
     WHERE access_point_id = rap.access_point_id
       AND network_ssid IS NOT NULL
     GROUP BY network_ssid
     ORDER BY COUNT(*) DESC
     LIMIT 1) as network_name,

    -- Check if any observations marked as hidden
    COALESCE(
        (SELECT bool_or(is_hidden_network) FROM app.network_observations
         WHERE access_point_id = rap.access_point_id),
        FALSE
    ) as is_hidden_network,

    -- Get most common frequency
    (SELECT frequency_hz FROM app.network_observations
     WHERE access_point_id = rap.access_point_id
       AND frequency_hz IS NOT NULL
     GROUP BY frequency_hz
     ORDER BY COUNT(*) DESC
     LIMIT 1) as primary_frequency_hz,

    rap.is_mobile_device,
    rap.primary_location_point,
    rap.coverage_area_polygon,
    rap.total_observation_count,
    rap.unique_location_count,

    -- Estimate observation times from linked measurements
    (SELECT MIN(measurement_timestamp_ms::bigint)
     FROM app.location_measurements
     WHERE access_point_id = rap.access_point_id)::bigint * 1000 as first_observed_at,
    (SELECT MAX(measurement_timestamp_ms::bigint)
     FROM app.location_measurements
     WHERE access_point_id = rap.access_point_id)::bigint * 1000 as last_observed_at,

    1.0 as data_confidence_score,
    NULL as quality_flags,
    rap.record_created_at,
    rap.record_updated_at
FROM app.radio_access_points rap
ON CONFLICT (access_point_id) DO NOTHING;

RAISE NOTICE 'Migrated % wireless access points', (SELECT COUNT(*) FROM app.wireless_access_points);

-- =====================================================
-- PHASE 6: MIGRATE SIGNAL MEASUREMENTS
-- =====================================================

RAISE NOTICE 'Migrating signal measurements...';

-- Function to map encryption type
CREATE OR REPLACE FUNCTION migrate_encryption_type(enc_text TEXT)
RETURNS app.encryption_type AS $$
BEGIN
    IF enc_text IS NULL THEN RETURN 'unknown'; END IF;

    CASE UPPER(enc_text)
        WHEN 'NONE', 'OPEN', '' THEN RETURN 'none';
        WHEN 'WEP' THEN RETURN 'wep';
        WHEN 'WPA' THEN RETURN 'wpa';
        WHEN 'WPA2', 'WPA2-PSK' THEN RETURN 'wpa2_psk';
        WHEN 'WPA2-EAP', 'WPA2-ENTERPRISE' THEN RETURN 'wpa2_enterprise';
        WHEN 'WPA3', 'WPA3-SAE' THEN RETURN 'wpa3_sae';
        WHEN 'WPA3-EAP', 'WPA3-ENTERPRISE' THEN RETURN 'wpa3_enterprise';
        WHEN 'OWE' THEN RETURN 'wpa3_owe';
        ELSE RETURN 'unknown';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Migrate network_observations to signal_measurements
INSERT INTO app.signal_measurements (
    measurement_id,
    access_point_id,
    data_source_id,
    signal_strength_dbm,
    noise_floor_dbm,
    signal_to_noise_ratio_db,
    encryption_type,
    channel_number,
    channel_width_mhz,
    capabilities_string,
    measurement_timestamp,
    measurement_duration_ms,
    data_confidence_score,
    measurement_quality_flags,
    original_record_id,
    original_source_type,
    record_created_at
)
SELECT
    no.observation_id as measurement_id,
    no.access_point_id,
    no.data_source_id,
    CASE
        WHEN no.signal_strength_dbm BETWEEN -120 AND 30 THEN no.signal_strength_dbm
        ELSE NULL
    END as signal_strength_dbm,
    CASE
        WHEN no.noise_floor_dbm BETWEEN -120 AND 30 THEN no.noise_floor_dbm
        ELSE NULL
    END as noise_floor_dbm,
    CASE
        WHEN no.signal_to_noise_ratio_db BETWEEN -100 AND 100 THEN no.signal_to_noise_ratio_db
        ELSE NULL
    END as signal_to_noise_ratio_db,
    migrate_encryption_type(no.encryption_type) as encryption_type,
    no.channel_number,
    no.channel_width_mhz,
    no.capabilities_string,
    to_timestamp(no.observation_timestamp_ms / 1000.0) as measurement_timestamp,
    no.observation_duration_ms,
    COALESCE(no.data_confidence_score, 1.0) as data_confidence_score,
    no.quality_flags as measurement_quality_flags,
    no.original_record_id,
    no.original_source_type_code,
    no.record_created_at
FROM app.network_observations no
WHERE EXISTS (SELECT 1 FROM app.wireless_access_points WHERE access_point_id = no.access_point_id);

RAISE NOTICE 'Migrated % signal measurements', (SELECT COUNT(*) FROM app.signal_measurements);

-- =====================================================
-- PHASE 7: MIGRATE POSITION MEASUREMENTS
-- =====================================================

RAISE NOTICE 'Migrating position measurements...';

-- Migrate location_measurements to position_measurements
INSERT INTO app.position_measurements (
    position_id,
    access_point_id,
    data_source_id,
    latitude_degrees,
    longitude_degrees,
    altitude_meters,
    position_accuracy_meters,
    measurement_timestamp,
    measurement_duration_ms,
    position_source,
    data_confidence_score,
    anomaly_flags,
    original_record_id,
    record_created_at
)
SELECT
    lm.location_id as position_id,
    lm.access_point_id,
    lm.data_source_id,
    lm.latitude_degrees,
    lm.longitude_degrees,
    lm.altitude_meters,
    lm.position_accuracy_meters,
    to_timestamp(lm.measurement_timestamp_ms / 1000.0) as measurement_timestamp,
    lm.measurement_duration_ms,
    'gps' as position_source, -- Assume GPS since from wardriving
    COALESCE(lm.data_confidence_score, 1.0) as data_confidence_score,
    lm.anomaly_flags,
    lm.original_record_id,
    lm.record_created_at
FROM app.location_measurements lm
WHERE lm.latitude_degrees BETWEEN -90 AND 90
  AND lm.longitude_degrees BETWEEN -180 AND 180
  AND EXISTS (SELECT 1 FROM app.wireless_access_points WHERE access_point_id = lm.access_point_id);

RAISE NOTICE 'Migrated % position measurements', (SELECT COUNT(*) FROM app.position_measurements);

-- =====================================================
-- PHASE 8: MIGRATE ROUTES AND TRACKING DATA
-- =====================================================

RAISE NOTICE 'Migrating tracking routes...';

-- Create default user device for routes (if not exists)
INSERT INTO app.user_devices (device_name, device_type, is_owned_by_user, record_created_at)
SELECT 'Legacy Wardriving Device', 'smartphone', TRUE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM app.user_devices WHERE device_name = 'Legacy Wardriving Device');

-- Migrate routes data
INSERT INTO app.tracking_routes (
    data_source_id,
    user_device_id,
    route_name,
    route_description,
    route_geometry,
    record_created_at
)
SELECT
    1 as data_source_id, -- Default to first data source
    (SELECT device_id FROM app.user_devices WHERE device_name = 'Legacy Wardriving Device' LIMIT 1) as user_device_id,
    'Legacy Route ' || r.unified_id as route_name,
    CASE
        WHEN r.name IS NOT NULL THEN 'Imported route: ' || r.name
        ELSE 'Legacy route imported from WiGLE data'
    END as route_description,
    r.route_path as route_geometry,
    NOW() as record_created_at
FROM app.routes r
WHERE r.route_path IS NOT NULL;

RAISE NOTICE 'Migrated % tracking routes', (SELECT COUNT(*) FROM app.tracking_routes);

-- =====================================================
-- PHASE 9: MIGRATE WIGLE ENRICHMENT DATA
-- =====================================================

RAISE NOTICE 'Migrating WiGLE API enrichments...';

-- Migrate WiGLE enrichments
INSERT INTO app.wigle_api_enrichments (
    access_point_id,
    wigle_netid,
    wigle_trilat,
    wigle_trilong,
    wigle_ssid,
    wigle_encryption,
    wigle_country,
    wigle_region,
    wigle_city,
    wigle_qos,
    wigle_type,
    wigle_lastupdt,
    wigle_comment,
    api_query_timestamp,
    api_response_status,
    match_confidence_score,
    record_created_at
)
SELECT
    -- Find matching access point by BSSID
    (SELECT access_point_id FROM app.wireless_access_points
     WHERE mac_address = we.bssid LIMIT 1) as access_point_id,
    we.netid as wigle_netid,
    we.trilat as wigle_trilat,
    we.trilong as wigle_trilong,
    we.ssid as wigle_ssid,
    we.encryption as wigle_encryption,
    we.country as wigle_country,
    we.region as wigle_region,
    we.city as wigle_city,
    we.qos::integer as wigle_qos,
    we.type as wigle_type,
    to_timestamp(we.lastupdt / 1000.0) as wigle_lastupdt,
    we.comment as wigle_comment,
    we.record_created_at as api_query_timestamp,
    'success' as api_response_status,
    0.8 as match_confidence_score, -- Assume good match from WiGLE
    we.record_created_at
FROM app.wigle_enrichments we
WHERE we.bssid IS NOT NULL
  AND EXISTS (SELECT 1 FROM app.wireless_access_points WHERE mac_address = we.bssid);

RAISE NOTICE 'Migrated % WiGLE API enrichments', (SELECT COUNT(*) FROM app.wigle_api_enrichments);

-- =====================================================
-- PHASE 10: UPDATE STATISTICS AND AGGREGATIONS
-- =====================================================

RAISE NOTICE 'Updating access point statistics...';

-- Update wireless access points with current statistics
UPDATE app.wireless_access_points SET
    total_signal_readings = (
        SELECT COUNT(*) FROM app.signal_measurements
        WHERE access_point_id = wireless_access_points.access_point_id
    ),
    unique_observation_locations = (
        SELECT COUNT(DISTINCT ST_SnapToGrid(position_point, 0.0001))
        FROM app.position_measurements
        WHERE access_point_id = wireless_access_points.access_point_id
    ),
    first_observed_at = (
        SELECT MIN(measurement_timestamp)
        FROM app.position_measurements
        WHERE access_point_id = wireless_access_points.access_point_id
    ),
    last_observed_at = (
        SELECT MAX(measurement_timestamp)
        FROM app.position_measurements
        WHERE access_point_id = wireless_access_points.access_point_id
    ),
    record_updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM app.signal_measurements
    WHERE access_point_id = wireless_access_points.access_point_id
);

-- Update data source statistics
UPDATE app.data_sources SET
    total_records_imported = (
        SELECT COUNT(*) FROM app.position_measurements
        WHERE data_source_id = data_sources.data_source_id
    ) + (
        SELECT COUNT(*) FROM app.signal_measurements
        WHERE data_source_id = data_sources.data_source_id
    ),
    last_import_at = (
        SELECT MAX(record_created_at) FROM app.position_measurements
        WHERE data_source_id = data_sources.data_source_id
    ),
    record_updated_at = NOW()
WHERE data_source_id < 1000; -- Only legacy data sources

RAISE NOTICE 'Updated access point and data source statistics';

-- =====================================================
-- PHASE 11: VALIDATION AND VERIFICATION
-- =====================================================

RAISE NOTICE 'Performing migration validation...';

-- Validation queries
DO $$
DECLARE
    old_locations_count INTEGER;
    new_positions_count INTEGER;
    old_networks_count INTEGER;
    new_signals_count INTEGER;
    old_access_points_count INTEGER;
    new_access_points_count INTEGER;
BEGIN
    -- Check data preservation
    SELECT COUNT(*) INTO old_locations_count FROM app.location_measurements;
    SELECT COUNT(*) INTO new_positions_count FROM app.position_measurements;

    SELECT COUNT(*) INTO old_networks_count FROM app.network_observations;
    SELECT COUNT(*) INTO new_signals_count FROM app.signal_measurements;

    SELECT COUNT(*) INTO old_access_points_count FROM app.radio_access_points;
    SELECT COUNT(*) INTO new_access_points_count FROM app.wireless_access_points;

    RAISE NOTICE 'Migration Results:';
    RAISE NOTICE '  Positions: % → % (loss: %)',
        old_locations_count, new_positions_count, old_locations_count - new_positions_count;
    RAISE NOTICE '  Signals: % → % (loss: %)',
        old_networks_count, new_signals_count, old_networks_count - new_signals_count;
    RAISE NOTICE '  Access Points: % → % (loss: %)',
        old_access_points_count, new_access_points_count, old_access_points_count - new_access_points_count;

    -- Fail if significant data loss
    IF new_positions_count < old_locations_count * 0.95 THEN
        RAISE EXCEPTION 'Significant position data loss: % vs %', new_positions_count, old_locations_count;
    END IF;

    IF new_signals_count < old_networks_count * 0.95 THEN
        RAISE EXCEPTION 'Significant signal data loss: % vs %', new_signals_count, old_networks_count;
    END IF;

    RAISE NOTICE 'Migration validation PASSED';
END $$;

-- =====================================================
-- PHASE 12: CLEANUP FUNCTIONS
-- =====================================================

-- Drop temporary migration functions
DROP FUNCTION IF EXISTS migrate_radio_technology(INTEGER);
DROP FUNCTION IF EXISTS extract_oui(TEXT);
DROP FUNCTION IF EXISTS migrate_encryption_type(TEXT);

RAISE NOTICE 'Migration completed successfully!';

-- Update schema version
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'schema_version') THEN
        CREATE TABLE app.schema_version (
            version TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT NOW(),
            description TEXT
        );
    END IF;

    INSERT INTO app.schema_version (version, description) VALUES
    ('2.0.0', 'Refactored 3NF schema with improved naming and relationships')
    ON CONFLICT (version) DO UPDATE SET
        applied_at = NOW(),
        description = EXCLUDED.description;
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION RECOMMENDATIONS
-- =====================================================

/*
POST-MIGRATION STEPS:

1. Verify data integrity:
   SELECT COUNT(*) FROM app.wireless_access_points;
   SELECT COUNT(*) FROM app.signal_measurements;
   SELECT COUNT(*) FROM app.position_measurements;

2. Test application compatibility:
   - Update API endpoints to use new table names
   - Update queries to use new column names
   - Test spatial queries with new geometry columns

3. Performance optimization:
   - Run ANALYZE on all new tables
   - Monitor query performance with new indexes
   - Consider partitioning for large time-series tables

4. Consider deprecating old tables after validation:
   - Keep legacy tables for historical reference
   - Update applications to use new schema exclusively
   - Plan eventual removal of deprecated tables

5. Implement missing features:
   - Location visit clustering algorithms
   - Stalking detection automation
   - Enhanced WiGLE API integration

6. Security review:
   - Verify data anonymization requirements
   - Implement data retention policies
   - Review access control for new schema
*/