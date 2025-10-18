-- =====================================================
-- Fix Missing Coordinates - Data Recovery
-- Restore the 15,746 missing coordinates using unified_id join
-- =====================================================

SELECT '=== COORDINATE RECOVERY OPERATION ===' as operation_header;

-- Show current state
SELECT
    'BEFORE FIX' as status,
    COUNT(*) as total_networks,
    COUNT(*) FILTER (WHERE lastlat = 0 AND lastlon = 0) as networks_with_zero_coords,
    COUNT(*) FILTER (WHERE lastlat != 0 OR lastlon != 0) as networks_with_good_coords
FROM app.networks_legacy;

-- Update networks_legacy with recovered coordinates using unified_id join
UPDATE app.networks_legacy n
SET
    lastlat = l.lat,
    lastlon = l.lon
FROM app.locations_legacy l
WHERE n.unified_id = l.unified_id
    AND n.lastlat = 0
    AND n.lastlon = 0;

-- Show results after fix
SELECT
    'AFTER FIX' as status,
    COUNT(*) as total_networks,
    COUNT(*) FILTER (WHERE lastlat = 0 AND lastlon = 0) as networks_with_zero_coords,
    COUNT(*) FILTER (WHERE lastlat != 0 OR lastlon != 0) as networks_with_good_coords
FROM app.networks_legacy;

-- Verify coordinate recovery success
SELECT
    'RECOVERY VERIFICATION' as verification,
    'Coordinate Recovery Success Rate: ' ||
    ROUND(
        (1.0 - (COUNT(*) FILTER (WHERE lastlat = 0 AND lastlon = 0)::numeric / 15746)) * 100,
        2
    ) || '%' as success_rate
FROM app.networks_legacy;

-- Show sample of recovered coordinates
SELECT '=== SAMPLE OF RECOVERED COORDINATES ===' as sample_header;

SELECT
    bssid,
    ssid,
    ROUND(lastlat::numeric, 6) as latitude,
    ROUND(lastlon::numeric, 6) as longitude,
    source_id,
    unified_id
FROM app.networks_legacy
WHERE unified_id IN (1273, 1280, 1282, 1284, 1285)  -- From our test sample
ORDER BY unified_id;