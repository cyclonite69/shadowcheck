-- ============================================================================
-- WiGLE SQLite Staging Deduplication Script
-- ============================================================================
-- Creates a deduplicated production table from WiGLE SQLite staging data
--
-- STRATEGY: One network record per BSSID with "best" values for each column:
-- - ssid: Prefer non-null, then most common value
-- - frequency: Latest observation (most recent timestamp)
-- - capabilities: Longest/most detailed (most security info)
-- - bestlevel: MAX (strongest signal, least negative)
-- - lasttime: MAX (most recent observation)
-- - bestlat/bestlon: From row with strongest signal
-- - lastlat/lastlon: From row with latest timestamp
-- - source_files: Array of all contributing SQLite files
--
-- USAGE:
-- psql -U shadowcheck_user -d shadowcheck -f deduplicate_sqlite_staging.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Create Production Table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.wigle_sqlite_networks (
    network_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL UNIQUE,
    ssid TEXT,
    frequency INTEGER,
    capabilities TEXT,
    type TEXT,

    -- Signal strength info
    bestlevel INTEGER,  -- Strongest signal ever observed
    bestlat DOUBLE PRECISION,  -- Location where strongest signal was observed
    bestlon DOUBLE PRECISION,

    -- Temporal info
    first_seen TIMESTAMP WITH TIME ZONE,  -- Earliest observation across all sources
    last_seen TIMESTAMP WITH TIME ZONE,   -- Latest observation across all sources
    lastlat DOUBLE PRECISION,  -- Location of most recent observation
    lastlon DOUBLE PRECISION,

    -- Metadata
    source_files TEXT[],  -- Array of SQLite files that contributed data
    observation_count INTEGER,  -- Number of location observations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wigle_sqlite_networks_bssid ON app.wigle_sqlite_networks(bssid);
CREATE INDEX IF NOT EXISTS idx_wigle_sqlite_networks_ssid ON app.wigle_sqlite_networks(ssid) WHERE ssid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wigle_sqlite_networks_last_seen ON app.wigle_sqlite_networks(last_seen);

-- ============================================================================
-- STEP 2: Helper - Find Most Common SSID for Each BSSID
-- ============================================================================
-- When multiple SSIDs exist for same BSSID, pick the most frequently seen one

DROP TABLE IF EXISTS temp_most_common_ssid CASCADE;

CREATE TEMP TABLE temp_most_common_ssid AS
SELECT DISTINCT ON (bssid)
    bssid,
    ssid as preferred_ssid
FROM (
    SELECT
        bssid,
        ssid,
        COUNT(*) as ssid_count,
        MAX(lasttime) as latest_seen_with_this_ssid
    FROM app.wigle_sqlite_networks_staging
    WHERE ssid IS NOT NULL
    GROUP BY bssid, ssid
) ssid_counts
ORDER BY
    bssid,
    ssid_count DESC,              -- Most frequent SSID
    latest_seen_with_this_ssid DESC;  -- If tie, use most recently seen

-- ============================================================================
-- STEP 3: Helper - Find Row with Best Signal for Each BSSID
-- ============================================================================

DROP TABLE IF EXISTS temp_best_signal_location CASCADE;

CREATE TEMP TABLE temp_best_signal_location AS
SELECT DISTINCT ON (bssid)
    bssid,
    bestlevel,
    bestlat,
    bestlon
FROM app.wigle_sqlite_networks_staging
WHERE bestlevel IS NOT NULL
ORDER BY
    bssid,
    bestlevel DESC,  -- Strongest signal (least negative)
    lasttime DESC;   -- If tie, use most recent

-- ============================================================================
-- STEP 4: Helper - Find Row with Latest Observation for Each BSSID
-- ============================================================================

DROP TABLE IF EXISTS temp_latest_observation CASCADE;

CREATE TEMP TABLE temp_latest_observation AS
SELECT DISTINCT ON (bssid)
    bssid,
    frequency as latest_frequency,
    type as latest_type,
    lastlat as latest_lat,
    lastlon as latest_lon,
    lasttime
FROM app.wigle_sqlite_networks_staging
WHERE lasttime IS NOT NULL
ORDER BY
    bssid,
    lasttime DESC;

-- ============================================================================
-- STEP 5: Helper - Find Most Detailed Capabilities String for Each BSSID
-- ============================================================================

DROP TABLE IF EXISTS temp_best_capabilities CASCADE;

CREATE TEMP TABLE temp_best_capabilities AS
SELECT DISTINCT ON (bssid)
    bssid,
    capabilities
FROM app.wigle_sqlite_networks_staging
WHERE capabilities IS NOT NULL
ORDER BY
    bssid,
    LENGTH(capabilities) DESC,  -- Longest/most detailed
    lasttime DESC;              -- If tie, use most recent

-- ============================================================================
-- STEP 6: Aggregate Source Files and Observation Counts
-- ============================================================================

DROP TABLE IF EXISTS temp_metadata CASCADE;

CREATE TEMP TABLE temp_metadata AS
SELECT
    n.bssid,
    ARRAY_AGG(DISTINCT n.sqlite_filename ORDER BY n.sqlite_filename) as source_files,
    MIN(n.lasttime) as earliest_time,
    MAX(n.lasttime) as latest_time,
    COUNT(DISTINCT l.unified_id) as observation_count
FROM app.wigle_sqlite_networks_staging n
LEFT JOIN app.wigle_sqlite_locations_staging l ON n.bssid = l.bssid
GROUP BY n.bssid;

-- ============================================================================
-- STEP 7: Build Deduplicated Production Data
-- ============================================================================

DROP TABLE IF EXISTS temp_deduplicated_networks CASCADE;

CREATE TEMP TABLE temp_deduplicated_networks AS
SELECT
    n.bssid,

    -- SSID: Prefer non-null, then most common
    COALESCE(ssid_pref.preferred_ssid, n.ssid) as ssid,

    -- Frequency: Latest observation
    latest.latest_frequency as frequency,

    -- Capabilities: Most detailed (longest string)
    cap.capabilities,

    -- Type: Latest observation
    latest.latest_type as type,

    -- Best signal strength and its location
    sig.bestlevel,
    sig.bestlat,
    sig.bestlon,

    -- Temporal info
    to_timestamp(meta.earliest_time / 1000.0) as first_seen,
    to_timestamp(meta.latest_time / 1000.0) as last_seen,
    latest.latest_lat as lastlat,
    latest.latest_lon as lastlon,

    -- Metadata
    meta.source_files,
    COALESCE(meta.observation_count, 0) as observation_count,
    NOW() as created_at,
    NOW() as updated_at

FROM (
    -- Get distinct BSSIDs (only one row per BSSID)
    SELECT DISTINCT ON (bssid) bssid, ssid
    FROM app.wigle_sqlite_networks_staging
    ORDER BY bssid, (ssid IS NOT NULL) DESC, lasttime DESC
) n
LEFT JOIN temp_most_common_ssid ssid_pref ON n.bssid = ssid_pref.bssid
LEFT JOIN temp_best_signal_location sig ON n.bssid = sig.bssid
LEFT JOIN temp_latest_observation latest ON n.bssid = latest.bssid
LEFT JOIN temp_best_capabilities cap ON n.bssid = cap.bssid
LEFT JOIN temp_metadata meta ON n.bssid = meta.bssid;

-- ============================================================================
-- STEP 8: Insert or Update Production Table
-- ============================================================================

INSERT INTO app.wigle_sqlite_networks (
    bssid,
    ssid,
    frequency,
    capabilities,
    type,
    bestlevel,
    bestlat,
    bestlon,
    first_seen,
    last_seen,
    lastlat,
    lastlon,
    source_files,
    observation_count,
    created_at,
    updated_at
)
SELECT
    bssid,
    ssid,
    frequency,
    capabilities,
    type,
    bestlevel,
    bestlat,
    bestlon,
    first_seen,
    last_seen,
    lastlat,
    lastlon,
    source_files,
    observation_count,
    created_at,
    updated_at
FROM temp_deduplicated_networks
ON CONFLICT (bssid)
DO UPDATE SET
    -- Always update SSID if we have a better one (non-null preferred)
    ssid = CASE
        WHEN EXCLUDED.ssid IS NOT NULL THEN EXCLUDED.ssid
        ELSE wigle_sqlite_networks.ssid
    END,

    -- Update frequency if we have newer data
    frequency = CASE
        WHEN EXCLUDED.last_seen > wigle_sqlite_networks.last_seen THEN EXCLUDED.frequency
        ELSE wigle_sqlite_networks.frequency
    END,

    -- Update capabilities if we have more detailed info
    capabilities = CASE
        WHEN LENGTH(COALESCE(EXCLUDED.capabilities, '')) > LENGTH(COALESCE(wigle_sqlite_networks.capabilities, ''))
            THEN EXCLUDED.capabilities
        ELSE wigle_sqlite_networks.capabilities
    END,

    -- Update type from latest observation
    type = CASE
        WHEN EXCLUDED.last_seen > wigle_sqlite_networks.last_seen THEN EXCLUDED.type
        ELSE wigle_sqlite_networks.type
    END,

    -- Update best signal if we found a stronger one
    bestlevel = CASE
        WHEN COALESCE(EXCLUDED.bestlevel, -999) > COALESCE(wigle_sqlite_networks.bestlevel, -999)
            THEN EXCLUDED.bestlevel
        ELSE wigle_sqlite_networks.bestlevel
    END,
    bestlat = CASE
        WHEN COALESCE(EXCLUDED.bestlevel, -999) > COALESCE(wigle_sqlite_networks.bestlevel, -999)
            THEN EXCLUDED.bestlat
        ELSE wigle_sqlite_networks.bestlat
    END,
    bestlon = CASE
        WHEN COALESCE(EXCLUDED.bestlevel, -999) > COALESCE(wigle_sqlite_networks.bestlevel, -999)
            THEN EXCLUDED.bestlon
        ELSE wigle_sqlite_networks.bestlon
    END,

    -- Expand temporal range
    first_seen = LEAST(wigle_sqlite_networks.first_seen, EXCLUDED.first_seen),
    last_seen = GREATEST(wigle_sqlite_networks.last_seen, EXCLUDED.last_seen),

    -- Update last observation location
    lastlat = CASE
        WHEN EXCLUDED.last_seen > wigle_sqlite_networks.last_seen THEN EXCLUDED.lastlat
        ELSE wigle_sqlite_networks.lastlat
    END,
    lastlon = CASE
        WHEN EXCLUDED.last_seen > wigle_sqlite_networks.last_seen THEN EXCLUDED.lastlon
        ELSE wigle_sqlite_networks.lastlon
    END,

    -- Merge source files (union arrays)
    source_files = (
        SELECT ARRAY_AGG(DISTINCT f ORDER BY f)
        FROM unnest(wigle_sqlite_networks.source_files || EXCLUDED.source_files) AS f
    ),

    -- Add observation counts
    observation_count = wigle_sqlite_networks.observation_count + EXCLUDED.observation_count,

    updated_at = NOW();

-- ============================================================================
-- STEP 9: Report Statistics
-- ============================================================================

DO $$
DECLARE
    total_staging INTEGER;
    total_production INTEGER;
    duplicates_removed INTEGER;
    networks_with_ssid INTEGER;
    networks_hidden INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_staging FROM app.wigle_sqlite_networks_staging;
    SELECT COUNT(*) INTO total_production FROM app.wigle_sqlite_networks;
    duplicates_removed := total_staging - total_production;

    SELECT COUNT(*) INTO networks_with_ssid
    FROM app.wigle_sqlite_networks
    WHERE ssid IS NOT NULL;

    SELECT COUNT(*) INTO networks_hidden
    FROM app.wigle_sqlite_networks
    WHERE ssid IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'WiGLE SQLite Deduplication Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Staging records: %', total_staging;
    RAISE NOTICE 'Production networks: %', total_production;
    RAISE NOTICE 'Duplicates removed: %', duplicates_removed;
    RAISE NOTICE '';
    RAISE NOTICE 'Networks with SSID: %', networks_with_ssid;
    RAISE NOTICE 'Hidden networks: %', networks_hidden;
    RAISE NOTICE '';
    RAISE NOTICE 'Production table: app.wigle_sqlite_networks';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 10: Show Sample of Deduplicated Data
-- ============================================================================

SELECT
    bssid,
    ssid,
    frequency,
    bestlevel,
    observation_count,
    array_length(source_files, 1) as num_sources,
    first_seen::date,
    last_seen::date
FROM app.wigle_sqlite_networks
ORDER BY observation_count DESC
LIMIT 10;

COMMIT;

-- ============================================================================
-- DONE! Production table: app.wigle_sqlite_networks
-- ============================================================================
