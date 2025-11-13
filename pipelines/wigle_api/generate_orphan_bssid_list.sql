-- Generate list of orphan BSSIDs to query from WiGLE API
-- Prioritizes WiFi networks with good data quality for API enrichment

\copy (
SELECT
    n.bssid,
    n.ssid,
    n.bestlat as lat,
    n.bestlon as lon,
    n.observation_count_staging as obs_count,
    to_timestamp(n.lasttime / 1000) as last_seen,
    n.bestlevel as signal
FROM app.wigle_sqlite_networks_staging_deduped n
LEFT JOIN app.wigle_alpha_v3_networks api ON n.bssid = api.bssid
WHERE api.bssid IS NULL  -- Not yet in API data
  AND n.type = 'W'  -- WiFi only (not GSM, Bluetooth, etc.)
  AND n.bestlat IS NOT NULL
  AND n.bestlon IS NOT NULL
  AND n.observation_count_staging >= 3  -- At least 3 observations
  AND n.ssid IS NOT NULL
  AND n.ssid != ''
  AND n.ssid NOT LIKE '%\x00%'  -- No null bytes
  AND LENGTH(n.ssid) > 0
ORDER BY
    n.observation_count_staging DESC,  -- More observations = higher priority
    n.lasttime DESC  -- Recent activity = higher priority
LIMIT 10000  -- Cap at 10k for API quota management
) TO '/tmp/wigle_orphan_bssids.csv' WITH (FORMAT CSV, HEADER);

-- Summary statistics
SELECT
    'Total WiFi orphans' as metric,
    COUNT(*) as count
FROM app.wigle_sqlite_networks_staging_deduped n
LEFT JOIN app.wigle_alpha_v3_networks api ON n.bssid = api.bssid
WHERE api.bssid IS NULL
  AND n.type = 'W'
UNION ALL
SELECT
    'Quality WiFi orphans (3+ obs, SSID, GPS)',
    COUNT(*)
FROM app.wigle_sqlite_networks_staging_deduped n
LEFT JOIN app.wigle_alpha_v3_networks api ON n.bssid = api.bssid
WHERE api.bssid IS NULL
  AND n.type = 'W'
  AND n.bestlat IS NOT NULL
  AND n.bestlon IS NOT NULL
  AND n.observation_count_staging >= 3
  AND n.ssid IS NOT NULL
  AND n.ssid != '';
