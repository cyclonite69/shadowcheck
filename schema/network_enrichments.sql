/**
 * Network Enrichments Schema
 *
 * Computed metadata fields for network classification and analysis.
 * Sidecar table that enriches networks_legacy without modifying it.
 */

-- ============================================================================
-- ENRICHMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.network_enrichments (
  bssid TEXT PRIMARY KEY,

  -- Technology classification
  technology_resolved TEXT CHECK (technology_resolved IN (
    'Wi-Fi',
    'Cellular (LTE)',
    'Cellular (GSM/UMTS)',
    'Undetermined'
  )),

  -- Security risk assessment
  security_risk_level TEXT CHECK (security_risk_level IN (
    'Insecure (Deprecated)',      -- WEP, outdated protocols
    'Vulnerable (WPS Enabled)',   -- WPA/WPA2 with WPS
    'Robust (Modern Standard)',   -- WPA2/WPA3 without WPS
    'Unsecured (Open)',           -- No encryption
    'Ambiguous/Obscured'          -- Hidden/unknown
  )),

  -- Infrastructure classification
  infrastructure_type TEXT CHECK (infrastructure_type IN (
    'Personal/Consumer',          -- Home networks, personal hotspots
    'Corporate/Commercial',       -- Business, enterprise networks
    'Specialized/Mobile Asset'    -- Vehicles, portable devices
  )),

  -- Data freshness indicator
  is_stale BOOLEAN DEFAULT FALSE,

  -- Location data quality
  location_confidence TEXT CHECK (location_confidence IN (
    'High Confidence',    -- 5+ observations, consistent location
    'Medium Confidence',  -- 2-4 observations, some variation
    'Low Confidence'      -- Single observation or high variance
  )),

  -- Metadata
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_network_enrichments_technology ON app.network_enrichments(technology_resolved);
CREATE INDEX idx_network_enrichments_security ON app.network_enrichments(security_risk_level);
CREATE INDEX idx_network_enrichments_infrastructure ON app.network_enrichments(infrastructure_type);
CREATE INDEX idx_network_enrichments_stale ON app.network_enrichments(is_stale);
CREATE INDEX idx_network_enrichments_location_confidence ON app.network_enrichments(location_confidence);

COMMENT ON TABLE app.network_enrichments IS 'Computed classification metadata for networks';
COMMENT ON COLUMN app.network_enrichments.technology_resolved IS 'Wireless technology type determined from frequency and other characteristics';
COMMENT ON COLUMN app.network_enrichments.security_risk_level IS 'Security posture assessment based on encryption and capabilities';
COMMENT ON COLUMN app.network_enrichments.infrastructure_type IS 'Infrastructure classification based on SSID patterns and behavior';
COMMENT ON COLUMN app.network_enrichments.is_stale IS 'True if last observation is older than 18 months';
COMMENT ON COLUMN app.network_enrichments.location_confidence IS 'Quality assessment of location data based on observation count and consistency';


-- ============================================================================
-- COMPUTATION FUNCTIONS
-- ============================================================================

/**
 * Compute technology_resolved from frequency
 */
CREATE OR REPLACE FUNCTION app.resolve_network_technology(
  p_frequency INTEGER,
  p_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  -- Wi-Fi frequency bands
  IF p_frequency BETWEEN 2400 AND 2500 THEN
    RETURN 'Wi-Fi';
  ELSIF p_frequency BETWEEN 5000 AND 6000 THEN
    RETURN 'Wi-Fi';
  ELSIF p_frequency BETWEEN 6000 AND 7125 THEN
    RETURN 'Wi-Fi';

  -- Cellular LTE bands
  ELSIF p_frequency BETWEEN 600 AND 900 THEN
    RETURN 'Cellular (LTE)';
  ELSIF p_frequency BETWEEN 1700 AND 2200 THEN
    RETURN 'Cellular (LTE)';
  ELSIF p_frequency BETWEEN 2500 AND 2700 THEN
    RETURN 'Cellular (LTE)';

  -- GSM/UMTS bands
  ELSIF p_frequency BETWEEN 850 AND 960 THEN
    RETURN 'Cellular (GSM/UMTS)';
  ELSIF p_frequency BETWEEN 1800 AND 1900 THEN
    RETURN 'Cellular (GSM/UMTS)';

  -- Check type field if frequency is unknown
  ELSIF p_type IN ('wifi', 'Wi-Fi', 'WiFi') THEN
    RETURN 'Wi-Fi';

  ELSE
    RETURN 'Undetermined';
  END IF;
END;
$$;

/**
 * Compute security_risk_level from capabilities string
 */
CREATE OR REPLACE FUNCTION app.assess_security_risk(
  p_capabilities TEXT
)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  caps TEXT;
BEGIN
  IF p_capabilities IS NULL OR p_capabilities = '' THEN
    RETURN 'Ambiguous/Obscured';
  END IF;

  -- Normalize to lowercase for case-insensitive matching
  caps := LOWER(p_capabilities);

  -- Open network (no encryption)
  IF caps ~ '\\[ess\\]' AND NOT (caps ~ 'wpa|wep|psk') THEN
    RETURN 'Unsecured (Open)';
  END IF;

  -- WEP (deprecated/insecure)
  IF caps ~ 'wep' THEN
    RETURN 'Insecure (Deprecated)';
  END IF;

  -- WPS enabled (vulnerable to PIN attacks)
  IF caps ~ 'wps' THEN
    RETURN 'Vulnerable (WPS Enabled)';
  END IF;

  -- WPA3 (modern, robust)
  IF caps ~ 'wpa3|sae' THEN
    RETURN 'Robust (Modern Standard)';
  END IF;

  -- WPA2 without WPS (secure)
  IF caps ~ 'wpa2|ccmp' THEN
    RETURN 'Robust (Modern Standard)';
  END IF;

  -- WPA (older but acceptable)
  IF caps ~ 'wpa' THEN
    RETURN 'Robust (Modern Standard)';
  END IF;

  -- Unknown/hidden
  RETURN 'Ambiguous/Obscured';
END;
$$;

/**
 * Compute infrastructure_type from SSID, manufacturer, and patterns
 */
CREATE OR REPLACE FUNCTION app.classify_infrastructure(
  p_ssid TEXT,
  p_bssid TEXT,
  p_capabilities TEXT
)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  ssid_lower TEXT;
  second_octet TEXT;
BEGIN
  IF p_ssid IS NULL OR p_ssid = '' THEN
    -- Hidden SSID - default to personal (most common)
    RETURN 'Personal/Consumer';
  END IF;

  ssid_lower := LOWER(p_ssid);

  -- Corporate/Commercial indicators
  IF ssid_lower ~ '(corp|enterprise|office|business|company|guest|visitor|public|attwifi|xfinitywifi|optimumwifi)' THEN
    RETURN 'Corporate/Commercial';
  END IF;

  -- Mobile hotspot indicators (SSID patterns)
  IF ssid_lower ~ '(iphone|android|galaxy|pixel|hotspot|mobile|tether)' THEN
    RETURN 'Specialized/Mobile Asset';
  END IF;

  -- Vehicle indicators
  IF ssid_lower ~ '(tesla|bmw|audi|mercedes|ford|chevy|honda|toyota|vehicle|car|auto)' THEN
    RETURN 'Specialized/Mobile Asset';
  END IF;

  -- Mobile hotspot indicators (MAC patterns)
  -- Check if second octet has locally administered bit set (bit 1 of first byte)
  IF p_bssid IS NOT NULL AND LENGTH(p_bssid) >= 5 THEN
    second_octet := SUBSTRING(p_bssid, 1, 2);
    -- Locally administered addresses often indicate tethering/hotspots
    IF second_octet ~ '^[0-9A-Fa-f][2367AaBbEeFf]$' THEN
      RETURN 'Specialized/Mobile Asset';
    END IF;
  END IF;

  -- Enterprise security (802.1X/RADIUS) indicates corporate
  IF p_capabilities IS NOT NULL AND LOWER(p_capabilities) ~ '(eap|radius|802.1x|enterprise)' THEN
    RETURN 'Corporate/Commercial';
  END IF;

  -- Default to personal/consumer
  RETURN 'Personal/Consumer';
END;
$$;

/**
 * Check if network data is stale (> 18 months old)
 */
CREATE OR REPLACE FUNCTION app.is_network_stale(
  p_lasttime BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  last_seen TIMESTAMPTZ;
  eighteen_months_ago TIMESTAMPTZ;
BEGIN
  IF p_lasttime IS NULL THEN
    RETURN TRUE; -- No timestamp = stale
  END IF;

  -- Convert Unix timestamp (seconds) to timestamptz
  last_seen := TO_TIMESTAMP(p_lasttime);
  eighteen_months_ago := NOW() - INTERVAL '18 months';

  RETURN last_seen < eighteen_months_ago;
END;
$$;

/**
 * Assess location confidence based on observation count and variance
 */
CREATE OR REPLACE FUNCTION app.assess_location_confidence(
  p_bssid TEXT
)
RETURNS TEXT
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  observation_count INTEGER;
  location_variance NUMERIC;
BEGIN
  -- Count total observations from all location sources
  SELECT COUNT(*) INTO observation_count
  FROM (
    SELECT bssid FROM app.locations_legacy WHERE bssid = p_bssid
    UNION ALL
    SELECT bssid FROM app.kml_locations_staging WHERE bssid = p_bssid
  ) AS all_observations;

  IF observation_count = 0 THEN
    RETURN 'Low Confidence';
  END IF;

  -- Calculate location variance (standard deviation of coordinates)
  SELECT
    COALESCE(
      STDDEV(lat) + STDDEV(lon),
      0
    ) INTO location_variance
  FROM (
    SELECT lat, lon FROM app.locations_legacy WHERE bssid = p_bssid
    UNION ALL
    SELECT lat, lon FROM app.kml_locations_staging WHERE bssid = p_bssid
  ) AS all_locations;

  -- High confidence: 5+ observations with low variance
  IF observation_count >= 5 AND location_variance < 0.001 THEN
    RETURN 'High Confidence';
  END IF;

  -- Medium confidence: 2-4 observations or moderate variance
  IF observation_count >= 2 AND observation_count < 5 THEN
    RETURN 'Medium Confidence';
  END IF;

  IF observation_count >= 5 AND location_variance >= 0.001 AND location_variance < 0.01 THEN
    RETURN 'Medium Confidence';
  END IF;

  -- Low confidence: single observation or high variance
  RETURN 'Low Confidence';
END;
$$;


-- ============================================================================
-- BATCH ENRICHMENT FUNCTION
-- ============================================================================

/**
 * Compute and store enrichments for a single BSSID
 */
CREATE OR REPLACE FUNCTION app.enrich_network(
  p_bssid TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_network RECORD;
BEGIN
  -- Get network data
  SELECT * INTO v_network
  FROM app.networks_legacy
  WHERE bssid = p_bssid
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE NOTICE 'BSSID % not found in networks_legacy', p_bssid;
    RETURN;
  END IF;

  -- Insert or update enrichment
  INSERT INTO app.network_enrichments (
    bssid,
    technology_resolved,
    security_risk_level,
    infrastructure_type,
    is_stale,
    location_confidence,
    computed_at,
    last_updated
  ) VALUES (
    p_bssid,
    app.resolve_network_technology(v_network.frequency, v_network.type),
    app.assess_security_risk(v_network.capabilities),
    app.classify_infrastructure(v_network.ssid, v_network.bssid, v_network.capabilities),
    app.is_network_stale(v_network.lasttime),
    app.assess_location_confidence(p_bssid),
    NOW(),
    NOW()
  )
  ON CONFLICT (bssid) DO UPDATE SET
    technology_resolved = EXCLUDED.technology_resolved,
    security_risk_level = EXCLUDED.security_risk_level,
    infrastructure_type = EXCLUDED.infrastructure_type,
    is_stale = EXCLUDED.is_stale,
    location_confidence = EXCLUDED.location_confidence,
    last_updated = NOW();
END;
$$;

/**
 * Batch enrich all networks (or specific subset)
 */
CREATE OR REPLACE FUNCTION app.enrich_all_networks(
  p_limit INTEGER DEFAULT NULL
)
RETURNS TABLE(
  bssid TEXT,
  status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_bssid TEXT;
  v_count INTEGER := 0;
BEGIN
  FOR v_bssid IN
    SELECT n.bssid
    FROM app.networks_legacy n
    LEFT JOIN app.network_enrichments e ON e.bssid = n.bssid
    WHERE e.bssid IS NULL OR e.last_updated < NOW() - INTERVAL '7 days'
    LIMIT p_limit
  LOOP
    BEGIN
      PERFORM app.enrich_network(v_bssid);
      v_count := v_count + 1;

      bssid := v_bssid;
      status := 'enriched';
      RETURN NEXT;

      -- Progress indicator every 1000 records
      IF v_count % 1000 = 0 THEN
        RAISE NOTICE 'Enriched % networks...', v_count;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      bssid := v_bssid;
      status := 'error: ' || SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;

  RAISE NOTICE 'Enrichment complete: % networks processed', v_count;
END;
$$;


-- ============================================================================
-- ENRICHED NETWORKS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW app.networks_enriched AS
SELECT
  n.*,
  e.technology_resolved,
  e.security_risk_level,
  e.infrastructure_type,
  e.is_stale,
  e.location_confidence,
  e.computed_at AS enrichment_computed_at,
  e.last_updated AS enrichment_last_updated
FROM app.networks_legacy n
LEFT JOIN app.network_enrichments e ON e.bssid = n.bssid;

COMMENT ON VIEW app.networks_enriched IS 'Networks with computed enrichment metadata';


-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

/*
-- Enrich a single network
SELECT app.enrich_network('AA:BB:CC:DD:EE:FF');

-- Enrich 100 networks
SELECT * FROM app.enrich_all_networks(100);

-- Get enriched network data
SELECT bssid, ssid, technology_resolved, security_risk_level, infrastructure_type, is_stale, location_confidence
FROM app.networks_enriched
WHERE bssid = 'AA:BB:CC:DD:EE:FF';

-- Find all insecure networks
SELECT bssid, ssid, security_risk_level
FROM app.networks_enriched
WHERE security_risk_level IN ('Insecure (Deprecated)', 'Unsecured (Open)');

-- Find all stale data
SELECT bssid, ssid, is_stale
FROM app.networks_enriched
WHERE is_stale = TRUE;

-- Network breakdown by technology
SELECT technology_resolved, COUNT(*) as count
FROM app.networks_enriched
GROUP BY technology_resolved
ORDER BY count DESC;

-- Security risk distribution
SELECT security_risk_level, COUNT(*) as count
FROM app.networks_enriched
GROUP BY security_risk_level
ORDER BY count DESC;

-- Infrastructure type breakdown
SELECT infrastructure_type, COUNT(*) as count
FROM app.networks_enriched
GROUP BY infrastructure_type
ORDER BY count DESC;
*/
