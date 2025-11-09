-- Update import function to use correct ON CONFLICT clauses
-- matching the new unique constraints

CREATE OR REPLACE FUNCTION app.import_wigle_alpha_v3_response(
    p_bssid TEXT,
    p_alpha_v3_json JSONB
)
RETURNS TABLE(networks_imported INTEGER, observations_imported INTEGER) AS $$
DECLARE
    v_network_id BIGINT;
    v_networks_imported INTEGER := 0;
    v_observations_imported INTEGER := 0;
    v_cluster JSONB;
    v_location JSONB;
BEGIN
    -- Insert network metadata with ON CONFLICT on (bssid, ssid)
    INSERT INTO app.wigle_alpha_v3_networks (
        bssid,
        ssid,
        name,
        type,
        encryption,
        channel,
        frequency,
        bcninterval,
        trilaterated_lat,
        trilaterated_lon,
        best_cluster_qos,
        first_seen,
        last_seen,
        last_update,
        street_address,
        freenet,
        dhcp,
        paynet,
        comment,
        query_timestamp
    ) VALUES (
        p_bssid,
        p_alpha_v3_json->>'name',
        p_alpha_v3_json->>'name',
        p_alpha_v3_json->>'type',
        p_alpha_v3_json->>'encryption',
        (p_alpha_v3_json->>'channel')::INTEGER,
        (p_alpha_v3_json->>'frequency')::INTEGER,
        (p_alpha_v3_json->>'bcninterval')::INTEGER,
        (p_alpha_v3_json->>'trilateratedLatitude')::DOUBLE PRECISION,
        (p_alpha_v3_json->>'trilateratedLongitude')::DOUBLE PRECISION,
        (p_alpha_v3_json->>'bestClusterWiGLEQoS')::INTEGER,
        (p_alpha_v3_json->>'firstSeen')::TIMESTAMP,
        (p_alpha_v3_json->>'lastSeen')::TIMESTAMP,
        (p_alpha_v3_json->>'lastUpdate')::TIMESTAMP,
        p_alpha_v3_json->'streetAddress',
        p_alpha_v3_json->>'freenet',
        p_alpha_v3_json->>'dhcp',
        p_alpha_v3_json->>'paynet',
        p_alpha_v3_json->>'comment',
        NOW()
    )
    ON CONFLICT (bssid, ssid) DO UPDATE SET
        last_seen = GREATEST(EXCLUDED.last_seen, app.wigle_alpha_v3_networks.last_seen),
        last_update = GREATEST(EXCLUDED.last_update, app.wigle_alpha_v3_networks.last_update),
        trilaterated_lat = COALESCE(EXCLUDED.trilaterated_lat, app.wigle_alpha_v3_networks.trilaterated_lat),
        trilaterated_lon = COALESCE(EXCLUDED.trilaterated_lon, app.wigle_alpha_v3_networks.trilaterated_lon)
    RETURNING wigle_network_id INTO v_network_id;

    v_networks_imported := 1;

    -- Flatten ALL observations from ALL clusters into individual rows
    FOR v_cluster IN SELECT * FROM jsonb_array_elements(p_alpha_v3_json->'locationClusters')
    LOOP
        FOR v_location IN SELECT * FROM jsonb_array_elements(v_cluster->'locations')
        LOOP
            -- Insert observation with ON CONFLICT DO NOTHING (prevent exact duplicates)
            INSERT INTO app.wigle_alpha_v3_observations (
                bssid,
                lat,
                lon,
                altitude,
                accuracy,
                observation_time,
                last_update,
                month_bucket,
                ssid,
                name,
                signal_dbm,
                noise,
                snr,
                channel,
                frequency,
                encryption_value,
                wep,
                wigle_net_id,
                query_timestamp
            ) VALUES (
                p_bssid,
                (v_location->>'latitude')::DOUBLE PRECISION,
                (v_location->>'longitude')::DOUBLE PRECISION,
                (v_location->>'alt')::DOUBLE PRECISION,
                (v_location->>'accuracy')::DOUBLE PRECISION,
                (v_location->>'time')::TIMESTAMP,
                (v_location->>'lastupdt')::TIMESTAMP,
                v_location->>'month',
                v_location->>'ssid',
                v_location->>'name',
                (v_location->>'signal')::INTEGER,
                (v_location->>'noise')::INTEGER,
                (v_location->>'snr')::INTEGER,
                (v_location->>'channel')::INTEGER,
                (v_location->>'frequency')::INTEGER,
                v_location->>'encryptionValue',
                v_location->>'wep',
                v_location->>'netId',
                NOW()
            )
            ON CONFLICT (bssid, lat, lon, observation_time, ssid, signal_dbm, channel, frequency) DO NOTHING;

            v_observations_imported := v_observations_imported + 1;
        END LOOP;
    END LOOP;

    -- Update enrichment queue
    UPDATE app.bssid_enrichment_queue
    SET status = 'completed',
        processed_at = NOW(),
        wigle_records_found = v_networks_imported,
        wigle_locations_found = v_observations_imported
    WHERE bssid = p_bssid
      AND status IN ('pending', 'processing');

    RETURN QUERY SELECT v_networks_imported, v_observations_imported;
END;
$$ LANGUAGE plpgsql;
