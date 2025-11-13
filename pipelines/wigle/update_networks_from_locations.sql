-- Update WiGLE Networks Staging with Best Data from Locations
-- Strategy: Update lasttime, lastlat, lastlon, bestlevel, bestlat, bestlon based on location observations

-- ========================================
-- STEP 1: Update lasttime, lastlat, lastlon
-- Use the MOST RECENT observation for each network
-- ========================================

WITH most_recent_locations AS (
    SELECT DISTINCT ON (bssid)
        bssid,
        time as most_recent_time,
        lat as most_recent_lat,
        lon as most_recent_lon
    FROM app.wigle_sqlite_locations_staging
    WHERE lat IS NOT NULL
      AND lon IS NOT NULL
      AND lat BETWEEN -90 AND 90
      AND lon BETWEEN -180 AND 180
    ORDER BY bssid, time DESC NULLS LAST
)
UPDATE app.wigle_sqlite_networks_staging_deduped n
SET
    lasttime = COALESCE(r.most_recent_time, n.lasttime),
    lastlat = COALESCE(r.most_recent_lat, n.lastlat),
    lastlon = COALESCE(r.most_recent_lon, n.lastlon)
FROM most_recent_locations r
WHERE n.bssid = r.bssid
  AND (
      n.lasttime IS NULL OR
      n.lastlat IS NULL OR
      n.lastlon IS NULL OR
      r.most_recent_time > n.lasttime
  );

SELECT 'Step 1: lasttime/lastlat/lastlon updated' as status;

-- ========================================
-- STEP 2: Update bestlevel, bestlat, bestlon
-- Use the STRONGEST SIGNAL observation for each network
-- ========================================

WITH strongest_signal_locations AS (
    SELECT DISTINCT ON (bssid)
        bssid,
        level as best_level,
        lat as best_lat,
        lon as best_lon
    FROM app.wigle_sqlite_locations_staging
    WHERE lat IS NOT NULL
      AND lon IS NOT NULL
      AND lat BETWEEN -90 AND 90
      AND lon BETWEEN -180 AND 180
      AND level IS NOT NULL
    ORDER BY bssid, level DESC NULLS LAST, time DESC NULLS LAST
)
UPDATE app.wigle_sqlite_networks_staging_deduped n
SET
    bestlevel = COALESCE(s.best_level, n.bestlevel),
    bestlat = COALESCE(s.best_lat, n.bestlat),
    bestlon = COALESCE(s.best_lon, n.bestlon)
FROM strongest_signal_locations s
WHERE n.bssid = s.bssid
  AND (
      n.bestlevel IS NULL OR
      n.bestlat IS NULL OR
      n.bestlon IS NULL OR
      s.best_level > n.bestlevel
  );

SELECT 'Step 2: bestlevel/bestlat/bestlon updated' as status;

-- ========================================
-- VERIFICATION & STATISTICS
-- ========================================

SELECT
    'AFTER UPDATES' as status,
    COUNT(*) as total_networks,
    COUNT(lasttime) as with_lasttime,
    COUNT(lastlat) as with_lastlat,
    COUNT(lastlon) as with_lastlon,
    COUNT(bestlevel) as with_bestlevel,
    COUNT(bestlat) as with_bestlat,
    COUNT(bestlon) as with_bestlon,
    ROUND(100.0 * COUNT(lasttime) / COUNT(*), 2) as pct_lasttime,
    ROUND(100.0 * COUNT(bestlevel) / COUNT(*), 2) as pct_bestlevel
FROM app.wigle_sqlite_networks_staging_deduped;
