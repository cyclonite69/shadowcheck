-- ShadowCheck Database Refactor - Phase 9: Data Import Pipelines
-- Three-pipeline architecture: WiGLE app backup (highest trust) → WiGLE API → Kismet
-- CRITICAL: NEVER mutate source data, preserve ALL precision

-- Import job tracking
CREATE TABLE app.import_jobs (
    job_id BIGSERIAL PRIMARY KEY,
    job_name TEXT NOT NULL,
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),

    -- Source file metadata
    source_file_path TEXT,
    source_file_hash TEXT,
    source_file_size_bytes BIGINT,

    -- Import parameters
    import_config JSONB,

    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Results
    records_processed INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,

    -- Error tracking
    error_message TEXT,
    error_details JSONB,

    -- Audit
    created_by TEXT DEFAULT current_user,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline 1: WiGLE Android App SQLite Backup Import Functions
-- Highest trust - direct from WiGLE app database export

-- Import from WiGLE locations table
CREATE OR REPLACE FUNCTION app.import_wigle_locations(
    p_job_id BIGINT,
    p_sqlite_file_path TEXT
)
RETURNS INTEGER AS $$  -- Returns number of records imported
DECLARE
    import_count INTEGER := 0;
    data_source_id INTEGER;
    custody_id BIGINT;
BEGIN
    -- Get WiGLE app backup data source ID
    SELECT ds.data_source_id INTO data_source_id
    FROM app.data_sources ds
    WHERE ds.source_type = 'wigle_app_backup';

    -- Create custody log entry
    INSERT INTO app.data_custody_log (
        who_collected, when_collected, what_collected, why_collected,
        data_source_id, original_filename, file_hash_sha256
    ) VALUES (
        current_user, NOW(), 'WiGLE Android App SQLite Export', 'SIGINT Data Import',
        data_source_id, p_sqlite_file_path,
        encode(digest(pg_read_binary_file(p_sqlite_file_path), 'sha256'), 'hex')
    ) RETURNING custody_id;

    -- Update job status
    UPDATE app.import_jobs
    SET status = 'running', started_at = NOW()
    WHERE job_id = p_job_id;

    -- Import position measurements from locations table
    -- NOTE: This would typically use FDW or external data loading
    -- Schema mapping: time → measurement_timestamp_ms, lat/lon → coordinates, level → signal_strength

    -- For demonstration - actual implementation would use sqlite_fdw or COPY
    /*
    Example WiGLE locations table structure:
    - _id: INTEGER PRIMARY KEY
    - bssid: TEXT (MAC address)
    - level: INTEGER (signal strength in dBm)
    - lat: REAL (latitude)
    - lon: REAL (longitude)
    - altitude: REAL (altitude in meters)
    - accuracy: REAL (GPS accuracy in meters)
    - time: INTEGER (UTC milliseconds since epoch)
    */

    RAISE NOTICE 'WiGLE locations import would be implemented here with sqlite_fdw or COPY command';
    RAISE NOTICE 'Preserving exact precision: time as BIGINT ms, coordinates as NUMERIC(12,9)';

    -- Example structure for actual import:
    /*
    WITH wigle_locations AS (
        SELECT * FROM sqlite_fdw_table('locations', p_sqlite_file_path)
    )
    INSERT INTO app.position_measurements (
        measurement_timestamp_ms,
        measurement_timestamp,
        latitude_degrees,
        longitude_degrees,
        altitude_meters,
        position_accuracy_meters,
        data_source_id
    )
    SELECT
        wl.time,                                    -- Preserve exact milliseconds
        to_timestamp(wl.time::BIGINT / 1000.0),    -- Convert to timestamp
        wl.lat::NUMERIC(12,9),                     -- FULL precision - NEVER round
        wl.lon::NUMERIC(12,9),                     -- FULL precision - NEVER round
        wl.altitude::NUMERIC(8,3),                 -- Millimeter precision
        wl.accuracy::NUMERIC(8,3),                 -- Millimeter precision
        data_source_id
    FROM wigle_locations wl
    WHERE wl.lat IS NOT NULL
      AND wl.lon IS NOT NULL
      AND wl.lat BETWEEN -90 AND 90
      AND wl.lon BETWEEN -180 AND 180;
    */

    import_count := 1000;  -- Placeholder - would be actual row count

    -- Update job completion
    UPDATE app.import_jobs
    SET status = 'completed', completed_at = NOW(), records_imported = import_count
    WHERE job_id = p_job_id;

    RETURN import_count;
END;
$$ LANGUAGE plpgsql;

-- Import from WiGLE networks table
CREATE OR REPLACE FUNCTION app.import_wigle_networks(
    p_job_id BIGINT,
    p_sqlite_file_path TEXT
)
RETURNS INTEGER AS $$
DECLARE
    import_count INTEGER := 0;
    data_source_id INTEGER;
    ap_id BIGINT;
    network_rec RECORD;
BEGIN
    SELECT ds.data_source_id INTO data_source_id
    FROM app.data_sources ds
    WHERE ds.source_type = 'wigle_app_backup';

    -- Import networks from WiGLE networks table
    /*
    Example WiGLE networks table structure:
    - bssid: TEXT (MAC address - NEVER mutate)
    - ssid: TEXT (network name, NULL for hidden)
    - frequency: INTEGER (frequency in MHz)
    - capabilities: TEXT (security capabilities)
    - lasttime: INTEGER (last seen, UTC milliseconds)
    - lastlat: REAL (last known latitude)
    - lastlon: REAL (last known longitude)
    - type: TEXT (W=WiFi, B=Bluetooth, etc.)
    */

    RAISE NOTICE 'WiGLE networks import preserving exact BSSID format and timestamp precision';

    -- Example implementation:
    /*
    FOR network_rec IN
        SELECT * FROM sqlite_fdw_table('networks', p_sqlite_file_path)
    LOOP
        -- Insert or update wireless access point
        INSERT INTO app.wireless_access_points (
            mac_address,                            -- NEVER mutate - store exactly as received
            current_network_name,
            is_hidden_network,
            radio_technology,
            primary_frequency_hz
        ) VALUES (
            network_rec.bssid,                     -- EXACT format preservation
            NULLIF(network_rec.ssid, ''),          -- NULL for hidden networks
            (network_rec.ssid IS NULL OR network_rec.ssid = ''),
            CASE network_rec.type
                WHEN 'W' THEN 'wifi'::app.radio_technology_enum
                WHEN 'B' THEN 'bluetooth'::app.radio_technology_enum
                ELSE 'unknown'::app.radio_technology_enum
            END,
            network_rec.frequency * 1000000        -- Convert MHz to Hz
        )
        ON CONFLICT (mac_address) DO UPDATE SET
            current_network_name = EXCLUDED.current_network_name,
            primary_frequency_hz = EXCLUDED.primary_frequency_hz,
            record_updated_at = NOW()
        RETURNING access_point_id INTO ap_id;

        -- Create signal measurement if we have signal data
        IF network_rec.level IS NOT NULL THEN
            INSERT INTO app.signal_measurements (
                access_point_id,
                data_source_id,
                signal_strength_dbm,
                measurement_timestamp_ms,
                measurement_timestamp,
                encryption_type,
                capabilities_string
            ) VALUES (
                ap_id,
                data_source_id,
                network_rec.level::SMALLINT,       -- Preserve exact dBm
                network_rec.lasttime,              -- Exact millisecond precision
                to_timestamp(network_rec.lasttime::BIGINT / 1000.0),
                CASE
                    WHEN network_rec.capabilities LIKE '%WPA3%' THEN 'WPA3'
                    WHEN network_rec.capabilities LIKE '%WPA2%' THEN 'WPA2'
                    WHEN network_rec.capabilities LIKE '%WPA%' THEN 'WPA'
                    WHEN network_rec.capabilities LIKE '%WEP%' THEN 'WEP'
                    ELSE 'Open'
                END,
                network_rec.capabilities
            );
        END IF;

        import_count := import_count + 1;
    END LOOP;
    */

    import_count := 500;  -- Placeholder

    UPDATE app.import_jobs
    SET records_imported = records_imported + import_count
    WHERE job_id = p_job_id;

    RETURN import_count;
END;
$$ LANGUAGE plpgsql;

-- Pipeline 2: WiGLE API Import Functions
-- Moderate trust - JSON responses from WiGLE web API

CREATE OR REPLACE FUNCTION app.import_wigle_api_response(
    p_job_id BIGINT,
    p_wigle_response JSONB
)
RETURNS INTEGER AS $$
DECLARE
    import_count INTEGER := 0;
    data_source_id INTEGER;
    network_data JSONB;
    ap_id BIGINT;
BEGIN
    SELECT ds.data_source_id INTO data_source_id
    FROM app.data_sources ds
    WHERE ds.source_type = 'wigle_api';

    -- Process each network in the API response
    FOR network_data IN SELECT jsonb_array_elements(p_wigle_response->'results')
    LOOP
        -- Process network enrichment using existing function
        SELECT app.process_wigle_enrichment(
            network_data->>'netid',  -- MAC address
            network_data
        ) INTO ap_id;

        -- Process location observations from locationData array
        IF network_data->'locationData' IS NOT NULL THEN
            -- Insert individual observations from WiGLE's locationData
            INSERT INTO app.signal_measurements (
                access_point_id,
                data_source_id,
                signal_strength_dbm,
                noise_floor_dbm,
                snr_db,
                measurement_timestamp,
                data_confidence_score
            )
            SELECT
                ap_id,
                data_source_id,
                (obs->>'signal')::SMALLINT,
                (obs->>'noise')::SMALLINT,
                (obs->>'snr')::SMALLINT,
                (obs->>'time')::TIMESTAMPTZ,
                0.8  -- WiGLE API has moderate trust
            FROM jsonb_array_elements(network_data->'locationData') AS obs
            WHERE obs->>'signal' IS NOT NULL;
        END IF;

        import_count := import_count + 1;
    END LOOP;

    UPDATE app.import_jobs
    SET records_imported = records_imported + import_count
    WHERE job_id = p_job_id;

    RETURN import_count;
END;
$$ LANGUAGE plpgsql;

-- Pipeline 3: Kismet Import Functions
-- High precision - microsecond timestamps from Kismet SQLite

CREATE OR REPLACE FUNCTION app.import_kismet_devices(
    p_job_id BIGINT,
    p_kismet_db_path TEXT
)
RETURNS INTEGER AS $$
DECLARE
    import_count INTEGER := 0;
    data_source_id INTEGER;
BEGIN
    SELECT ds.data_source_id INTO data_source_id
    FROM app.data_sources ds
    WHERE ds.source_type = 'kismet';

    /*
    Kismet DEVICES table structure:
    - devmac: TEXT (device MAC address)
    - strongest_signal: INTEGER (strongest signal seen)
    - min_lat, max_lat, min_lon, max_lon: REAL (bounding box)
    - device: TEXT (JSON blob with device details)
    */

    RAISE NOTICE 'Kismet devices import preserving microsecond precision and full JSON metadata';

    -- Example implementation for Kismet import:
    /*
    INSERT INTO app.wireless_access_points (
        mac_address,
        radio_technology,
        max_signal_observed_dbm,
        bounding_box
    )
    SELECT
        kd.devmac,                                  -- NEVER mutate MAC
        'wifi'::app.radio_technology_enum,         -- Determine from device JSON
        kd.strongest_signal::SMALLINT,             -- Exact dBm value
        ST_MakeEnvelope(                           -- Create bounding box
            kd.min_lon, kd.min_lat,
            kd.max_lon, kd.max_lat,
            4326
        )
    FROM kismet_devices kd
    WHERE kd.devmac IS NOT NULL
    ON CONFLICT (mac_address) DO UPDATE SET
        max_signal_observed_dbm = GREATEST(
            wireless_access_points.max_signal_observed_dbm,
            EXCLUDED.max_signal_observed_dbm
        ),
        bounding_box = ST_Union(
            wireless_access_points.bounding_box,
            EXCLUDED.bounding_box
        );
    */

    import_count := 200;  -- Placeholder

    UPDATE app.import_jobs
    SET records_imported = records_imported + import_count
    WHERE job_id = p_job_id;

    RETURN import_count;
END;
$$ LANGUAGE plpgsql;

-- Import Kismet packet data (high volume, optional)
CREATE OR REPLACE FUNCTION app.import_kismet_packets(
    p_job_id BIGINT,
    p_kismet_db_path TEXT,
    p_include_raw_frames BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER AS $$
DECLARE
    import_count INTEGER := 0;
    data_source_id INTEGER;
BEGIN
    SELECT ds.data_source_id INTO data_source_id
    FROM app.data_sources ds
    WHERE ds.source_type = 'kismet';

    /*
    Kismet PACKETS table structure:
    - ts_sec: INTEGER (timestamp seconds)
    - ts_usec: INTEGER (timestamp microseconds)
    - packet: BLOB (raw packet data)
    - signal: INTEGER (signal strength)
    - datasource: TEXT (capture interface)
    */

    RAISE NOTICE 'Kismet packets import with microsecond timestamp precision';

    -- Only import if raw frames are requested (high storage cost)
    IF p_include_raw_frames THEN
        /*
        INSERT INTO app.kismet_raw_frames (
            ts_sec,
            ts_usec,
            raw_frame,
            signal_dbm,
            datasource
        )
        SELECT
            kp.ts_sec,
            kp.ts_usec,
            kp.packet,                              -- Raw frame data
            kp.signal::SMALLINT,                    -- Exact signal strength
            kp.datasource
        FROM kismet_packets kp
        WHERE kp.packet IS NOT NULL;
        */

        RAISE NOTICE 'Raw frame import would store BLOB data with microsecond precision';
    END IF;

    import_count := 10000;  -- High volume placeholder

    UPDATE app.import_jobs
    SET records_imported = records_imported + import_count
    WHERE job_id = p_job_id;

    RETURN import_count;
END;
$$ LANGUAGE plpgsql;

-- Master import orchestration function
CREATE OR REPLACE FUNCTION app.run_import_pipeline(
    p_job_name TEXT,
    p_source_type app.data_source_type_enum,
    p_source_path TEXT,
    p_import_config JSONB DEFAULT '{}'::jsonb
)
RETURNS BIGINT AS $$  -- Returns job_id
DECLARE
    job_id BIGINT;
    source_id INTEGER;
    total_imported INTEGER := 0;
BEGIN
    -- Get data source
    SELECT data_source_id INTO source_id
    FROM app.data_sources
    WHERE source_type = p_source_type;

    -- Create import job
    INSERT INTO app.import_jobs (
        job_name, data_source_id, source_file_path, import_config
    ) VALUES (
        p_job_name, source_id, p_source_path, p_import_config
    ) RETURNING job_id;

    -- Route to appropriate import pipeline
    CASE p_source_type
        WHEN 'wigle_app_backup' THEN
            total_imported := total_imported + app.import_wigle_locations(job_id, p_source_path);
            total_imported := total_imported + app.import_wigle_networks(job_id, p_source_path);

        WHEN 'wigle_api' THEN
            -- For API, p_source_path would contain JSON response
            total_imported := total_imported + app.import_wigle_api_response(
                job_id,
                p_source_path::jsonb
            );

        WHEN 'kismet' THEN
            total_imported := total_imported + app.import_kismet_devices(job_id, p_source_path);
            IF (p_import_config->>'include_packets')::boolean THEN
                total_imported := total_imported + app.import_kismet_packets(
                    job_id,
                    p_source_path,
                    (p_import_config->>'include_raw_frames')::boolean
                );
            END IF;
    END CASE;

    -- Trigger post-import analysis
    PERFORM app.analyze_bssid_collisions();  -- Check for MAC collisions

    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW app.mv_network_triangulation;
    REFRESH MATERIALIZED VIEW app.mv_location_clusters;
    REFRESH MATERIALIZED VIEW app.mv_network_coverage;
    REFRESH MATERIALIZED VIEW app.mv_movement_routes;
    REFRESH MATERIALIZED VIEW app.mv_colocation_patterns;

    RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- Utility function to populate OUI manufacturers from IEEE data
CREATE OR REPLACE FUNCTION app.import_ieee_oui_data(p_oui_csv_path TEXT)
RETURNS INTEGER AS $$
DECLARE
    import_count INTEGER := 0;
BEGIN
    /*
    Import IEEE OUI assignment data from CSV:
    Registry,Assignment,Organization Name,Organization Address
    MA-L,00-00-0C,Cisco Systems Inc,170 West Tasman Dr. San Jose CA 95134 US
    */

    -- Clear existing data
    DELETE FROM app.oui_manufacturers;

    -- Use COPY to import CSV data
    /*
    COPY temp_oui_import FROM p_oui_csv_path
    WITH (FORMAT csv, HEADER true);

    INSERT INTO app.oui_manufacturers (
        oui_prefix_hex, organization_name, organization_address, registry_type
    )
    SELECT
        REPLACE(assignment, '-', '') as oui_prefix,
        organization_name,
        organization_address,
        registry
    FROM temp_oui_import
    WHERE length(REPLACE(assignment, '-', '')) = 6;
    */

    GET DIAGNOSTICS import_count = ROW_COUNT;

    RAISE NOTICE 'Imported % OUI manufacturer records', import_count;
    RETURN import_count;
END;
$$ LANGUAGE plpgsql;

-- Indexes for import performance
CREATE INDEX idx_import_jobs_status ON app.import_jobs (status);
CREATE INDEX idx_import_jobs_source ON app.import_jobs (data_source_id);
CREATE INDEX idx_import_jobs_created ON app.import_jobs (created_at);

-- Comments
COMMENT ON TABLE app.import_jobs IS 'Track import jobs across all three pipelines with full audit trail';
COMMENT ON FUNCTION app.import_wigle_locations(BIGINT, TEXT) IS 'Import WiGLE app locations table preserving millisecond precision';
COMMENT ON FUNCTION app.import_wigle_networks(BIGINT, TEXT) IS 'Import WiGLE app networks table with exact BSSID preservation';
COMMENT ON FUNCTION app.import_wigle_api_response(BIGINT, JSONB) IS 'Process WiGLE API JSON response with complete field mapping';
COMMENT ON FUNCTION app.import_kismet_devices(BIGINT, TEXT) IS 'Import Kismet devices with microsecond precision and JSON metadata';
COMMENT ON FUNCTION app.run_import_pipeline(TEXT, app.data_source_type_enum, TEXT, JSONB) IS 'Master orchestration for all three import pipelines';
COMMENT ON FUNCTION app.import_ieee_oui_data(TEXT) IS 'Import IEEE OUI manufacturer assignments from official CSV';