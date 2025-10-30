-- ============================================================================
-- WIRELESS NETWORK CLASSIFICATION SYSTEM
-- ============================================================================
-- Non-destructive intelligence layer using materialized views
-- Classifies networks by technology, security, infrastructure type
-- Correlates different BSSIDs that represent the same physical network
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Extract frequency band from frequency (MHz)
CREATE OR REPLACE FUNCTION app.get_frequency_band(freq INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF freq IS NULL THEN
    RETURN 'Unknown';
  ELSIF freq BETWEEN 2400 AND 2500 THEN
    RETURN '2.4GHz';
  ELSIF freq BETWEEN 5000 AND 6000 THEN
    RETURN '5GHz';
  ELSIF freq BETWEEN 6000 AND 7200 THEN
    RETURN '6GHz';
  ELSIF freq BETWEEN 600 AND 1000 THEN
    RETURN 'Cellular-Low';
  ELSIF freq BETWEEN 1700 AND 2200 THEN
    RETURN 'Cellular-Mid';
  ELSIF freq BETWEEN 2300 AND 2700 THEN
    RETURN 'Cellular-High';
  ELSIF freq BETWEEN 3300 AND 5000 THEN
    RETURN 'Cellular-5G';
  ELSE
    RETURN 'Other';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate if BSSID is a proper MAC address (Wi-Fi indicator)
CREATE OR REPLACE FUNCTION app.is_valid_mac_address(bssid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if BSSID matches MAC address pattern (XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)
  RETURN bssid ~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Classify technology based on frequency, type, BSSID format, and patterns
CREATE OR REPLACE FUNCTION app.classify_technology(
  freq INTEGER,
  network_type TEXT,
  capabilities TEXT,
  ssid TEXT,
  bssid TEXT
)
RETURNS TEXT AS $$
DECLARE
  band TEXT;
  has_valid_mac BOOLEAN;
BEGIN
  band := app.get_frequency_band(freq);
  has_valid_mac := app.is_valid_mac_address(bssid);

  -- CRITICAL: If it has a valid MAC address, it's NOT cellular
  -- Cellular networks use IMSI/Cell IDs, not MAC addresses
  IF NOT has_valid_mac THEN
    RETURN 'Invalid/Non-Standard';
  END IF;

  -- Wi-Fi identification (has MAC + Wi-Fi frequency bands)
  IF band IN ('2.4GHz', '5GHz', '6GHz') THEN
    RETURN 'Wi-Fi';
  END IF;

  -- Bluetooth Low Energy (BLE) identification
  IF band = '2.4GHz' AND (
    network_type IN ('BLE', 'BTLE', 'Bluetooth LE', 'bluetooth-le')
    OR LOWER(network_type) LIKE '%ble%'
    OR LOWER(network_type) LIKE '%low energy%'
  ) THEN
    RETURN 'Bluetooth-LE';
  END IF;

  -- Classic Bluetooth identification (2.4 GHz + BT type)
  IF band = '2.4GHz' AND (
    network_type IN ('BT', 'bluetooth', 'Bluetooth')
    OR LOWER(network_type) LIKE '%bluetooth%'
  ) THEN
    RETURN 'Bluetooth-Classic';
  END IF;

  -- If frequency suggests cellular BUT has valid MAC, it's misclassified
  -- This is likely Wi-Fi on an unusual frequency or misreported data
  IF band LIKE 'Cellular%' THEN
    RETURN 'Wi-Fi (Misreported Frequency)';
  END IF;

  -- Check for explicit Wi-Fi indicators
  IF network_type IN ('wifi', 'Wi-Fi', 'infrastructure', 'AP') THEN
    RETURN 'Wi-Fi';
  END IF;

  -- Has capabilities string = Wi-Fi
  IF capabilities IS NOT NULL AND capabilities != '' THEN
    RETURN 'Wi-Fi';
  END IF;

  -- Has SSID = Wi-Fi
  IF ssid IS NOT NULL AND ssid != '' THEN
    RETURN 'Wi-Fi';
  END IF;

  -- Default for valid MAC
  RETURN 'Wi-Fi (Undetermined Band)';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Classify security risk level
CREATE OR REPLACE FUNCTION app.classify_security_risk(
  capabilities TEXT,
  encryption TEXT
)
RETURNS TEXT AS $$
DECLARE
  caps TEXT;
  enc TEXT;
BEGIN
  caps := LOWER(COALESCE(capabilities, ''));
  enc := LOWER(COALESCE(encryption, ''));

  -- Open networks
  IF caps = '' OR caps LIKE '%open%' OR caps = '[ess]' THEN
    RETURN 'Unsecured (Open)';
  END IF;

  -- WEP (deprecated)
  IF caps LIKE '%wep%' THEN
    RETURN 'Insecure (Deprecated - WEP)';
  END IF;

  -- WPA with WPS (vulnerable)
  IF (caps LIKE '%wpa%' AND NOT caps LIKE '%wpa2%' AND NOT caps LIKE '%wpa3%')
     OR caps LIKE '%wps%' THEN
    RETURN 'Vulnerable (WPA/WPS)';
  END IF;

  -- WPA3 (modern)
  IF caps LIKE '%wpa3%' THEN
    RETURN 'Robust (WPA3)';
  END IF;

  -- WPA2 (robust)
  IF caps LIKE '%wpa2%' THEN
    RETURN 'Robust (WPA2)';
  END IF;

  -- Enterprise (usually robust)
  IF caps LIKE '%eap%' OR caps LIKE '%enterprise%' THEN
    RETURN 'Robust (Enterprise)';
  END IF;

  -- Unknown/ambiguous
  RETURN 'Ambiguous/Obscured';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Classify infrastructure type based on SSID patterns
DROP FUNCTION IF EXISTS app.classify_infrastructure(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION app.classify_infrastructure(
  p_ssid TEXT,
  p_bssid TEXT,
  p_capabilities TEXT
)
RETURNS TEXT AS $$
DECLARE
  ssid_lower TEXT;
  oui TEXT;
BEGIN
  ssid_lower := LOWER(COALESCE(p_ssid, ''));
  oui := SUBSTRING(UPPER(p_bssid) FROM 1 FOR 8); -- First 3 octets

  -- Hidden SSID
  IF p_ssid IS NULL OR p_ssid = '' OR p_ssid LIKE '<hidden%' THEN
    RETURN 'Unknown (Hidden)';
  END IF;

  -- Corporate/Commercial patterns
  IF ssid_lower LIKE '%corp%'
     OR ssid_lower LIKE '%enterprise%'
     OR ssid_lower LIKE '%office%'
     OR ssid_lower LIKE '%guest%'
     OR ssid_lower LIKE '%public%'
     OR ssid_lower LIKE '%wifi%'
     OR ssid_lower LIKE '%conference%'
     OR p_capabilities LIKE '%Enterprise%' THEN
    RETURN 'Corporate/Commercial';
  END IF;

  -- Mobile/Vehicle patterns
  IF ssid_lower LIKE '%mobile%'
     OR ssid_lower LIKE '%car%'
     OR ssid_lower LIKE '%vehicle%'
     OR ssid_lower LIKE '%iphone%'
     OR ssid_lower LIKE '%android%'
     OR ssid_lower LIKE '%hotspot%'
     OR ssid_lower LIKE '%tether%' THEN
    RETURN 'Specialized/Mobile Asset';
  END IF;

  -- IoT/Specialized devices
  IF ssid_lower LIKE '%cam%'
     OR ssid_lower LIKE '%iot%'
     OR ssid_lower LIKE '%sensor%'
     OR ssid_lower LIKE '%smart%'
     OR ssid_lower LIKE '%ring%'
     OR ssid_lower LIKE '%nest%' THEN
    RETURN 'Specialized/IoT';
  END IF;

  -- Default to personal/consumer
  RETURN 'Personal/Consumer';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate location confidence
CREATE OR REPLACE FUNCTION app.calculate_location_confidence(
  observation_count INTEGER,
  max_distance_m NUMERIC,
  avg_accuracy_m NUMERIC
)
RETURNS TEXT AS $$
BEGIN
  -- High confidence: Multiple observations, close proximity, good accuracy
  IF observation_count >= 3 AND max_distance_m < 100 AND avg_accuracy_m < 10 THEN
    RETURN 'High Confidence';
  END IF;

  -- Medium confidence: Some observations with reasonable accuracy
  IF observation_count >= 2 AND max_distance_m < 500 AND avg_accuracy_m < 50 THEN
    RETURN 'Medium Confidence';
  END IF;

  -- Low confidence: Single observation or poor accuracy
  IF observation_count >= 1 THEN
    RETURN 'Low Confidence';
  END IF;

  RETURN 'No Location Data';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if network is stale (>18 months old)
CREATE OR REPLACE FUNCTION app.is_network_stale(last_seen TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  IF last_seen IS NULL THEN
    RETURN TRUE; -- No data = stale
  END IF;
  RETURN last_seen < (NOW() - INTERVAL '18 months');
END;
$$ LANGUAGE plpgsql STABLE; -- STABLE instead of IMMUTABLE because it uses NOW()

-- ============================================================================
-- MATERIALIZED VIEW: NETWORK CLASSIFICATIONS
-- ============================================================================
-- Primary classification view for all networks
CREATE MATERIALIZED VIEW IF NOT EXISTS app.mv_network_classifications AS
WITH location_centroids AS (
  -- Calculate centroid for each network
  SELECT
    bssid,
    ST_Centroid(ST_Collect(ST_SetSRID(ST_MakePoint(lon, lat), 4326)))::geography as centroid
  FROM app.locations_legacy
  WHERE lat IS NOT NULL AND lon IS NOT NULL
  GROUP BY bssid
),
location_stats AS (
  -- Calculate location statistics for each network
  SELECT
    l.bssid,
    COUNT(DISTINCT l._id) as observation_count,
    AVG(l.accuracy)::NUMERIC(10,2) as avg_accuracy_m,
    TO_TIMESTAMP(MIN(l.time) / 1000.0) as first_seen,
    TO_TIMESTAMP(MAX(l.time) / 1000.0) as last_seen,
    lc.centroid,
    MAX(ST_Distance(
      ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
      lc.centroid
    ))::NUMERIC(10,2) as max_distance_from_center_m
  FROM app.locations_legacy l
  JOIN location_centroids lc ON l.bssid = lc.bssid
  WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
  GROUP BY l.bssid, lc.centroid
),
wigle_location_stats AS (
  -- WiGLE API location statistics
  SELECT
    wl.bssid,
    COUNT(*) as wigle_observation_count,
    AVG(wl.accuracy)::NUMERIC(10,2) as wigle_avg_accuracy_m,
    MAX(wl.time) as wigle_last_seen
  FROM app.wigle_api_locations_staging wl
  GROUP BY wl.bssid
)
SELECT
  n.bssid,
  n.ssid,
  n.type as original_type,
  n.frequency,
  n.capabilities,
  TO_TIMESTAMP(n.lasttime / 1000.0) as lasttime,

  -- TECHNOLOGY CLASSIFICATION
  app.classify_technology(
    n.frequency,
    n.type,
    n.capabilities,
    n.ssid,
    n.bssid
  ) as technology_resolved,

  app.get_frequency_band(n.frequency) as frequency_band,

  -- SECURITY RISK CLASSIFICATION
  app.classify_security_risk(
    n.capabilities,
    NULL -- encryption info is in capabilities
  ) as security_risk_level,

  -- INFRASTRUCTURE TYPE CLASSIFICATION
  app.classify_infrastructure(
    n.ssid,
    n.bssid,
    n.capabilities
  ) as infrastructure_type,

  -- STALENESS CHECK
  app.is_network_stale(
    COALESCE(TO_TIMESTAMP(n.lasttime / 1000.0), ls.last_seen, wls.wigle_last_seen)
  ) as is_stale,

  -- LOCATION CONFIDENCE
  app.calculate_location_confidence(
    COALESCE(ls.observation_count, wls.wigle_observation_count, 0),
    COALESCE(ls.max_distance_from_center_m, 999999),
    COALESCE(ls.avg_accuracy_m, wls.wigle_avg_accuracy_m, 999999)
  ) as location_confidence,

  -- LOCATION STATISTICS
  COALESCE(ls.observation_count, 0) as local_observations,
  COALESCE(wls.wigle_observation_count, 0) as wigle_observations,
  COALESCE(ls.observation_count, 0) + COALESCE(wls.wigle_observation_count, 0) as total_observations,
  ls.avg_accuracy_m as avg_gps_accuracy_m,
  ls.max_distance_from_center_m as max_spread_m,
  ls.centroid,

  -- TEMPORAL DATA
  ls.first_seen as first_observed,
  GREATEST(TO_TIMESTAMP(n.lasttime / 1000.0), ls.last_seen, wls.wigle_last_seen) as last_observed,

  -- METADATA
  NOW() as classification_timestamp

FROM app.networks_legacy n
LEFT JOIN location_stats ls ON n.bssid = ls.bssid
LEFT JOIN wigle_location_stats wls ON n.bssid = wls.bssid;

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_netclass_bssid
  ON app.mv_network_classifications(bssid);

CREATE INDEX IF NOT EXISTS idx_mv_netclass_technology
  ON app.mv_network_classifications(technology_resolved);

CREATE INDEX IF NOT EXISTS idx_mv_netclass_security
  ON app.mv_network_classifications(security_risk_level);

CREATE INDEX IF NOT EXISTS idx_mv_netclass_infrastructure
  ON app.mv_network_classifications(infrastructure_type);

CREATE INDEX IF NOT EXISTS idx_mv_netclass_stale
  ON app.mv_network_classifications(is_stale) WHERE is_stale = true;

CREATE INDEX IF NOT EXISTS idx_mv_netclass_location_conf
  ON app.mv_network_classifications(location_confidence);

CREATE INDEX IF NOT EXISTS idx_mv_netclass_centroid
  ON app.mv_network_classifications USING GIST(centroid)
  WHERE centroid IS NOT NULL;

-- ============================================================================
-- MATERIALIZED VIEW: NETWORK CORRELATIONS
-- ============================================================================
-- Detects when different BSSIDs are actually the same physical network
-- Handles: Band steering, Multi-BSSID, Walked MACs, Mesh networks
CREATE MATERIALIZED VIEW IF NOT EXISTS app.mv_network_correlations AS
WITH network_pairs AS (
  -- Find potential same-network pairs
  SELECT
    nc1.bssid as bssid_1,
    nc2.bssid as bssid_2,
    nc1.ssid as ssid_1,
    nc2.ssid as ssid_2,
    nc1.frequency_band as band_1,
    nc2.frequency_band as band_2,
    nc1.capabilities as caps_1,
    nc2.capabilities as caps_2,
    nc1.infrastructure_type as infra_1,
    nc2.infrastructure_type as infra_2,
    nc1.centroid as centroid_1,
    nc2.centroid as centroid_2,

    -- Calculate similarity scores
    CASE
      WHEN nc1.ssid = nc2.ssid AND nc1.ssid IS NOT NULL THEN 100
      WHEN nc1.ssid IS NULL OR nc2.ssid IS NULL THEN 0
      ELSE 0
    END as ssid_match_score,

    CASE
      WHEN nc1.centroid IS NOT NULL AND nc2.centroid IS NOT NULL THEN
        CASE
          WHEN ST_Distance(nc1.centroid, nc2.centroid) < 10 THEN 100
          WHEN ST_Distance(nc1.centroid, nc2.centroid) < 50 THEN 80
          WHEN ST_Distance(nc1.centroid, nc2.centroid) < 100 THEN 60
          WHEN ST_Distance(nc1.centroid, nc2.centroid) < 200 THEN 40
          ELSE 0
        END
      ELSE 0
    END as proximity_score,

    CASE
      WHEN nc1.frequency_band != nc2.frequency_band AND nc1.frequency_band IN ('2.4GHz', '5GHz', '6GHz')
           AND nc2.frequency_band IN ('2.4GHz', '5GHz', '6GHz') THEN 90 -- Band steering
      WHEN nc1.frequency_band = nc2.frequency_band THEN 50
      ELSE 0
    END as band_score,

    CASE
      WHEN SUBSTRING(nc1.bssid FROM 1 FOR 8) = SUBSTRING(nc2.bssid FROM 1 FOR 8) THEN 70 -- Same OUI
      ELSE 0
    END as vendor_score,

    CASE
      WHEN nc1.capabilities = nc2.capabilities THEN 60
      WHEN (nc1.capabilities LIKE '%WPA2%' AND nc2.capabilities LIKE '%WPA2%')
           OR (nc1.capabilities LIKE '%WPA3%' AND nc2.capabilities LIKE '%WPA3%') THEN 40
      ELSE 0
    END as capability_score,

    ST_Distance(nc1.centroid, nc2.centroid) as distance_m

  FROM app.mv_network_classifications nc1
  CROSS JOIN app.mv_network_classifications nc2
  WHERE nc1.bssid < nc2.bssid -- Avoid duplicates and self-joins
    AND nc1.technology_resolved = 'Wi-Fi' -- Only correlate Wi-Fi for now
    AND nc2.technology_resolved = 'Wi-Fi'
    AND nc1.centroid IS NOT NULL
    AND nc2.centroid IS NOT NULL
    AND ST_Distance(nc1.centroid, nc2.centroid) < 200 -- Within 200m
)
SELECT
  bssid_1,
  bssid_2,
  ssid_1,
  ssid_2,
  band_1,
  band_2,
  distance_m,

  -- Total correlation score (0-100)
  (
    (ssid_match_score * 0.40) +      -- SSID match is most important (40%)
    (proximity_score * 0.25) +        -- Physical proximity (25%)
    (band_score * 0.15) +             -- Band relationship (15%)
    (vendor_score * 0.10) +           -- Same vendor (10%)
    (capability_score * 0.10)         -- Similar capabilities (10%)
  )::INTEGER as correlation_score,

  -- Correlation type
  CASE
    WHEN ssid_match_score = 100 AND band_1 != band_2 AND distance_m < 10 THEN 'Band Steering'
    WHEN ssid_match_score = 100 AND vendor_score = 70 AND distance_m < 50 THEN 'Multi-BSSID/Mesh'
    WHEN ssid_match_score = 100 AND distance_m BETWEEN 50 AND 200 THEN 'Walked MAC'
    WHEN ssid_match_score = 100 AND distance_m < 50 THEN 'Same Network'
    WHEN ssid_match_score = 0 AND vendor_score = 70 AND distance_m < 10 THEN 'Hidden SSID Pair'
    ELSE 'Potential Match'
  END as correlation_type,

  -- Confidence level
  CASE
    WHEN (ssid_match_score * 0.40 + proximity_score * 0.25 + band_score * 0.15 + vendor_score * 0.10 + capability_score * 0.10) >= 80 THEN 'High'
    WHEN (ssid_match_score * 0.40 + proximity_score * 0.25 + band_score * 0.15 + vendor_score * 0.10 + capability_score * 0.10) >= 60 THEN 'Medium'
    ELSE 'Low'
  END as confidence,

  NOW() as analyzed_at

FROM network_pairs
WHERE (ssid_match_score * 0.40 + proximity_score * 0.25 + band_score * 0.15 + vendor_score * 0.10 + capability_score * 0.10) >= 50 -- Only include likely matches
ORDER BY correlation_score DESC;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mv_netcorr_bssid1
  ON app.mv_network_correlations(bssid_1);

CREATE INDEX IF NOT EXISTS idx_mv_netcorr_bssid2
  ON app.mv_network_correlations(bssid_2);

CREATE INDEX IF NOT EXISTS idx_mv_netcorr_score
  ON app.mv_network_correlations(correlation_score DESC);

CREATE INDEX IF NOT EXISTS idx_mv_netcorr_type
  ON app.mv_network_correlations(correlation_type);

CREATE INDEX IF NOT EXISTS idx_mv_netcorr_confidence
  ON app.mv_network_correlations(confidence);

-- ============================================================================
-- MATERIALIZED VIEW: NETWORK CORRELATION GROUPS
-- ============================================================================
-- Groups correlated networks into network families
CREATE MATERIALIZED VIEW IF NOT EXISTS app.mv_network_groups AS
WITH RECURSIVE network_graph AS (
  -- Base case: Start with high-confidence correlations
  SELECT
    bssid_1 as bssid,
    bssid_1 as group_root,
    1 as depth,
    ARRAY[bssid_1] as path
  FROM app.mv_network_correlations
  WHERE confidence IN ('High', 'Medium')

  UNION

  SELECT
    bssid_2 as bssid,
    bssid_1 as group_root,
    1 as depth,
    ARRAY[bssid_2] as path
  FROM app.mv_network_correlations
  WHERE confidence IN ('High', 'Medium')

  UNION

  -- Recursive case: Follow the correlation graph
  SELECT
    nc.bssid_2 as bssid,
    ng.group_root,
    ng.depth + 1,
    ng.path || nc.bssid_2
  FROM network_graph ng
  JOIN app.mv_network_correlations nc ON ng.bssid = nc.bssid_1
  WHERE nc.confidence IN ('High', 'Medium')
    AND nc.bssid_2 != ALL(ng.path) -- Prevent cycles
    AND ng.depth < 5 -- Limit recursion depth
)
SELECT
  ROW_NUMBER() OVER (ORDER BY group_root, bssid) as group_id,
  group_root as primary_bssid,
  bssid as member_bssid,
  depth,
  (SELECT ssid FROM app.mv_network_classifications WHERE bssid = network_graph.group_root) as group_ssid,
  (SELECT COUNT(DISTINCT bssid) FROM network_graph ng2 WHERE ng2.group_root = network_graph.group_root) as group_size,
  NOW() as grouped_at
FROM network_graph;

CREATE INDEX IF NOT EXISTS idx_mv_netgroups_primary
  ON app.mv_network_groups(primary_bssid);

CREATE INDEX IF NOT EXISTS idx_mv_netgroups_member
  ON app.mv_network_groups(member_bssid);

CREATE INDEX IF NOT EXISTS idx_mv_netgroups_size
  ON app.mv_network_groups(group_size);

-- ============================================================================
-- REFRESH FUNCTIONS
-- ============================================================================

-- Refresh all classification materialized views
CREATE OR REPLACE FUNCTION app.refresh_network_classifications()
RETURNS TABLE(
  view_name TEXT,
  refresh_duration INTERVAL,
  row_count BIGINT
) AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
BEGIN
  -- Refresh classifications
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_network_classifications;
  end_time := clock_timestamp();

  view_name := 'mv_network_classifications';
  refresh_duration := end_time - start_time;
  SELECT COUNT(*) INTO row_count FROM app.mv_network_classifications;
  RETURN NEXT;

  -- Refresh correlations
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_network_correlations;
  end_time := clock_timestamp();

  view_name := 'mv_network_correlations';
  refresh_duration := end_time - start_time;
  SELECT COUNT(*) INTO row_count FROM app.mv_network_correlations;
  RETURN NEXT;

  -- Refresh groups
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_network_groups;
  end_time := clock_timestamp();

  view_name := 'mv_network_groups';
  refresh_duration := end_time - start_time;
  SELECT COUNT(*) INTO row_count FROM app.mv_network_groups;
  RETURN NEXT;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.refresh_network_classifications IS
'Refreshes all network classification materialized views and returns performance metrics';

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Summary statistics for classifications
CREATE OR REPLACE VIEW app.v_classification_summary AS
SELECT
  COUNT(*) as total_networks,
  COUNT(*) FILTER (WHERE technology_resolved = 'Wi-Fi') as wifi_count,
  COUNT(*) FILTER (WHERE technology_resolved LIKE 'Cellular%') as cellular_count,
  COUNT(*) FILTER (WHERE technology_resolved = 'Bluetooth') as bluetooth_count,
  COUNT(*) FILTER (WHERE technology_resolved = 'Undetermined') as undetermined_count,

  COUNT(*) FILTER (WHERE security_risk_level LIKE 'Insecure%') as insecure_count,
  COUNT(*) FILTER (WHERE security_risk_level LIKE 'Vulnerable%') as vulnerable_count,
  COUNT(*) FILTER (WHERE security_risk_level LIKE 'Robust%') as robust_count,
  COUNT(*) FILTER (WHERE security_risk_level LIKE 'Unsecured%') as unsecured_count,

  COUNT(*) FILTER (WHERE infrastructure_type = 'Corporate/Commercial') as corporate_count,
  COUNT(*) FILTER (WHERE infrastructure_type = 'Personal/Consumer') as personal_count,
  COUNT(*) FILTER (WHERE infrastructure_type LIKE 'Specialized%') as specialized_count,

  COUNT(*) FILTER (WHERE is_stale = true) as stale_count,
  COUNT(*) FILTER (WHERE location_confidence = 'High Confidence') as high_confidence_count,
  COUNT(*) FILTER (WHERE location_confidence = 'Medium Confidence') as medium_confidence_count,
  COUNT(*) FILTER (WHERE location_confidence = 'Low Confidence') as low_confidence_count,

  (SELECT COUNT(DISTINCT primary_bssid) FROM app.mv_network_groups) as network_families,
  (SELECT COUNT(*) FROM app.mv_network_correlations WHERE confidence = 'High') as high_confidence_correlations

FROM app.mv_network_classifications;

COMMENT ON VIEW app.v_classification_summary IS
'Summary statistics for network classifications and correlations';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON app.mv_network_classifications TO PUBLIC;
GRANT SELECT ON app.mv_network_correlations TO PUBLIC;
GRANT SELECT ON app.mv_network_groups TO PUBLIC;
GRANT SELECT ON app.v_classification_summary TO PUBLIC;
GRANT EXECUTE ON FUNCTION app.refresh_network_classifications() TO PUBLIC;

-- ============================================================================
-- INITIAL REFRESH
-- ============================================================================

-- Perform initial refresh
SELECT * FROM app.refresh_network_classifications();

-- ============================================================================
-- COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Network Classification System Installed Successfully';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Materialized Views Created:';
  RAISE NOTICE '  - app.mv_network_classifications (Primary classification data)';
  RAISE NOTICE '  - app.mv_network_correlations (Same-network detection)';
  RAISE NOTICE '  - app.mv_network_groups (Network families)';
  RAISE NOTICE '';
  RAISE NOTICE 'Helper Functions Created:';
  RAISE NOTICE '  - app.classify_technology()';
  RAISE NOTICE '  - app.classify_security_risk()';
  RAISE NOTICE '  - app.classify_infrastructure()';
  RAISE NOTICE '  - app.calculate_location_confidence()';
  RAISE NOTICE '';
  RAISE NOTICE 'To refresh classifications: SELECT * FROM app.refresh_network_classifications();';
  RAISE NOTICE '============================================================================';
END $$;
