-- Test how actual capability strings will be parsed into security types

WITH sample_caps AS (
  SELECT DISTINCT
    capabilities,
    COUNT(*) OVER (PARTITION BY capabilities) as network_count,
    -- Determine security type based on parsing logic
    CASE
      -- WPA3 detection
      WHEN capabilities ILIKE '%SAE%' AND capabilities ILIKE '%EAP%' THEN 'WPA3-Enterprise'
      WHEN capabilities ILIKE '%SAE%' THEN 'WPA3-Personal'

      -- WPA2 detection
      WHEN (capabilities ILIKE '%WPA2%' OR capabilities ILIKE '%RSN%') AND capabilities ILIKE '%EAP%' THEN 'WPA2-Enterprise'
      WHEN (capabilities ILIKE '%WPA2%' OR capabilities ILIKE '%RSN%') AND capabilities ILIKE '%PSK%' THEN 'WPA2-Personal'
      WHEN (capabilities ILIKE '%WPA2%' OR capabilities ILIKE '%RSN%') THEN 'WPA2-Personal'

      -- WPA (legacy) detection
      WHEN capabilities ILIKE '%WPA%' AND NOT capabilities ILIKE '%WPA2%' AND NOT capabilities ILIKE '%WPA3%' AND capabilities ILIKE '%EAP%' THEN 'WPA-Enterprise'
      WHEN capabilities ILIKE '%WPA%' AND NOT capabilities ILIKE '%WPA2%' AND NOT capabilities ILIKE '%WPA3%' THEN 'WPA-Personal'

      -- WEP detection
      WHEN capabilities ILIKE '%WEP%' THEN 'WEP'

      -- OWE detection
      WHEN capabilities ILIKE '%OWE%' THEN 'OWE'

      -- Open network detection
      WHEN capabilities = '[ESS]' OR capabilities IS NULL OR capabilities = '' THEN 'Open'

      -- Non-WiFi (Bluetooth, etc.)
      ELSE 'Other (Non-WiFi)'
    END as parsed_security_type
  FROM app.networks_legacy
  WHERE capabilities IS NOT NULL
)
SELECT
  parsed_security_type,
  SUM(network_count) as total_networks
FROM sample_caps
GROUP BY parsed_security_type
ORDER BY total_networks DESC;
