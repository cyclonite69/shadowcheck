-- Fix broken trigger function and clean up SSID whitespace
BEGIN;

-- Step 1: Fix the broken trigger function (uses wrong column name)
CREATE OR REPLACE FUNCTION app.process_new_network_sighting_alert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    analysis_result record;
    -- Define a default target user ID (assuming your device is ID 1)
    v_target_user_id CONSTANT BIGINT := 1;
    v_access_point_id BIGINT;
    v_threat_level TEXT;
BEGIN
    -- Get the Foreign Key (FK) for the stalker network
    -- FIX: Changed 'bssid' to 'bssid_identifier' to match actual column name
    SELECT access_point_id INTO v_access_point_id
    FROM app.radio_access_points
    WHERE bssid_identifier = NEW.bssid::radio_identifier
    LIMIT 1;

    -- If no corresponding Access Point exists in the FK table, we can't create an incident.
    IF v_access_point_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 1. Run the existing, correct analysis function
    SELECT * INTO analysis_result
    FROM app.analyze_individual_network_sightings(p_analysis_days := 7, p_home_radius_meters := 500)
    WHERE bssid = NEW.bssid;

    -- 2. Map risk score (0.0 to 1.0) to your defined THREAT_LEVEL text
    IF analysis_result.stalking_risk_score >= 0.95 THEN
        v_threat_level := 'CRITICAL';
    ELSIF analysis_result.stalking_risk_score >= 0.8 THEN
        v_threat_level := 'HIGH';
    ELSIF analysis_result.stalking_risk_score >= 0.6 THEN
        v_threat_level := 'MEDIUM';
    ELSE
        v_threat_level := 'LOW';
    END IF;

    -- 3. Incident Creation/Update Logic (only for high/critical)
    IF v_threat_level IN ('HIGH', 'CRITICAL') THEN
        INSERT INTO app.correlation_incidents (
            target_user_device_id,
            stalker_access_point_id,
            incident_type,
            shared_location_count,
            correlation_percentage,
            min_distance_feet,
            threat_level,
            confidence_score,
            first_incident_timestamp_ms,
            last_incident_timestamp_ms,
            notes
        )
        VALUES (
            v_target_user_id,
            v_access_point_id, -- Use the pre-fetched FK
            'LOCATION_FOLLOWING',
            analysis_result.total_sightings,
            analysis_result.stalking_risk_score * 100,
            (analysis_result.min_distance_from_home_km * 3280.84), -- Convert km to feet
            v_threat_level,
            analysis_result.stalking_risk_score,
            EXTRACT(EPOCH FROM analysis_result.first_seen_timestamp) * 1000,
            EXTRACT(EPOCH FROM analysis_result.last_seen_timestamp) * 1000,
            'Proactive trigger. Max distance: ' || ROUND(analysis_result.max_distance_from_home_km::numeric, 2) || ' km.'
        )
        ON CONFLICT (target_user_device_id, stalker_access_point_id) DO UPDATE SET
            threat_level = EXCLUDED.threat_level,
            correlation_percentage = EXCLUDED.correlation_percentage,
            last_incident_timestamp_ms = EXCLUDED.last_incident_timestamp_ms,
            notes = EXCLUDED.notes || ' (UPDATED)';
    END IF;

    RETURN NEW;
END;
$function$;

-- Step 2: Update existing SSIDs to remove leading/trailing whitespace
UPDATE app.networks_legacy
SET ssid = TRIM(ssid)
WHERE ssid IS NOT NULL
  AND ssid != TRIM(ssid);

-- Step 3: Create a trigger function to automatically trim SSIDs on insert/update
CREATE OR REPLACE FUNCTION app.trim_ssid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ssid IS NOT NULL THEN
    NEW.ssid = TRIM(NEW.ssid);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger on networks_legacy table
DROP TRIGGER IF EXISTS trim_ssid_trigger ON app.networks_legacy;
CREATE TRIGGER trim_ssid_trigger
  BEFORE INSERT OR UPDATE OF ssid
  ON app.networks_legacy
  FOR EACH ROW
  EXECUTE FUNCTION app.trim_ssid();

-- Verify the changes
SELECT
  COUNT(*) FILTER (WHERE LENGTH(ssid) != LENGTH(TRIM(ssid))) as ssids_with_whitespace,
  COUNT(*) FILTER (WHERE ssid IS NOT NULL) as total_ssids
FROM app.networks_legacy;

COMMIT;
