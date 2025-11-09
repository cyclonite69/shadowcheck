-- Test the trim triggers by inserting data with whitespace

BEGIN;

-- Test networks_legacy trigger
INSERT INTO app.networks_legacy (
  source_id, bssid, ssid, type, capabilities, service, rcois
) VALUES (
  1,
  '  AA:BB:CC:DD:EE:FF  ',  -- whitespace before/after
  '  TestNetwork  ',         -- whitespace before/after
  '  W  ',                   -- whitespace before/after
  '  [WPA2-PSK]  ',          -- whitespace before/after
  '  TestService  ',         -- whitespace before/after
  '  TestRCOI  '             -- whitespace before/after
)
RETURNING
  unified_id,
  LENGTH(bssid) as bssid_len,
  bssid,
  LENGTH(ssid) as ssid_len,
  ssid,
  LENGTH(type) as type_len,
  type,
  LENGTH(capabilities) as cap_len,
  capabilities,
  LENGTH(service) as service_len,
  service,
  LENGTH(rcois) as rcois_len,
  rcois;

-- Test locations_legacy trigger
INSERT INTO app.locations_legacy (
  source_id, bssid, level, lat, lon, time
) VALUES (
  1,
  '  11:22:33:44:55:66  ',  -- whitespace before/after
  -50,
  40.7128,
  -74.0060,
  1234567890000
)
RETURNING
  unified_id,
  LENGTH(bssid) as bssid_len,
  bssid;

ROLLBACK;  -- Don't actually save test data
