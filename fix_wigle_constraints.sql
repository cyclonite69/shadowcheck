-- Fix WiGLE Alpha v3 table constraints
-- Networks: unique on (bssid, ssid) from WiGLE data
-- Observations: unique on all WiGLE data columns (exclude query_timestamp)

BEGIN;

-- Fix networks table: unique on bssid + ssid (WiGLE data)
ALTER TABLE app.wigle_alpha_v3_networks DROP CONSTRAINT IF EXISTS unique_bssid_query;
ALTER TABLE app.wigle_alpha_v3_networks ADD CONSTRAINT unique_bssid_ssid UNIQUE(bssid, ssid);

-- Fix observations table: unique on all WiGLE data columns
-- This prevents exact duplicate observations from being inserted
ALTER TABLE app.wigle_alpha_v3_observations DROP CONSTRAINT IF EXISTS unique_observation;
ALTER TABLE app.wigle_alpha_v3_observations ADD CONSTRAINT unique_observation UNIQUE(
  bssid,
  lat,
  lon,
  observation_time,
  ssid,
  signal_dbm,
  channel,
  frequency
);

COMMIT;

\echo 'Constraints updated successfully!'
\echo 'Networks: unique on (bssid, ssid)'
\echo 'Observations: unique on all WiGLE data columns'
