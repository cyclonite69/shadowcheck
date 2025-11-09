-- Check for whitespace in all text columns across networks_legacy and locations_legacy

-- networks_legacy.bssid
SELECT
  'networks_legacy.bssid' as column_check,
  COUNT(*) FILTER (WHERE bssid IS NOT NULL AND bssid != TRIM(bssid)) as with_whitespace,
  COUNT(*) FILTER (WHERE bssid IS NOT NULL) as total
FROM app.networks_legacy

UNION ALL

-- networks_legacy.ssid (should be 0 now)
SELECT
  'networks_legacy.ssid',
  COUNT(*) FILTER (WHERE ssid IS NOT NULL AND ssid != TRIM(ssid)),
  COUNT(*) FILTER (WHERE ssid IS NOT NULL)
FROM app.networks_legacy

UNION ALL

-- networks_legacy.capabilities
SELECT
  'networks_legacy.capabilities',
  COUNT(*) FILTER (WHERE capabilities IS NOT NULL AND capabilities != TRIM(capabilities)),
  COUNT(*) FILTER (WHERE capabilities IS NOT NULL)
FROM app.networks_legacy

UNION ALL

-- networks_legacy.type
SELECT
  'networks_legacy.type',
  COUNT(*) FILTER (WHERE type IS NOT NULL AND type != TRIM(type)),
  COUNT(*) FILTER (WHERE type IS NOT NULL)
FROM app.networks_legacy

UNION ALL

-- networks_legacy.rcois
SELECT
  'networks_legacy.rcois',
  COUNT(*) FILTER (WHERE rcois IS NOT NULL AND rcois != TRIM(rcois)),
  COUNT(*) FILTER (WHERE rcois IS NOT NULL)
FROM app.networks_legacy

UNION ALL

-- networks_legacy.service
SELECT
  'networks_legacy.service',
  COUNT(*) FILTER (WHERE service IS NOT NULL AND service != TRIM(service)),
  COUNT(*) FILTER (WHERE service IS NOT NULL)
FROM app.networks_legacy

UNION ALL

-- locations_legacy.bssid
SELECT
  'locations_legacy.bssid',
  COUNT(*) FILTER (WHERE bssid IS NOT NULL AND bssid != TRIM(bssid)),
  COUNT(*) FILTER (WHERE bssid IS NOT NULL)
FROM app.locations_legacy

ORDER BY column_check;
