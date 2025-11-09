-- Query most common capability strings from networks_legacy
SELECT
  capabilities,
  COUNT(*) as network_count
FROM app.networks_legacy
WHERE capabilities IS NOT NULL
  AND capabilities != ''
GROUP BY capabilities
ORDER BY network_count DESC
LIMIT 30;
