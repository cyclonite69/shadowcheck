#!/bin/bash
# WiGLE Queue Status Checker

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}WiGLE Enrichment Queue Status${NC}"
echo -e "${YELLOW}=============================${NC}"
echo ""

# Get queue statistics
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck << 'EOF'
-- Queue summary
SELECT
    status,
    COUNT(*) as count
FROM app.bssid_enrichment_queue
GROUP BY status
ORDER BY
    CASE status
        WHEN 'pending' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'failed' THEN 4
    END;

\echo ''
\echo 'Recent Failed BSSIDs (last 10):'
\echo '================================'

-- Recent failures
SELECT
    bssid,
    LEFT(error_message, 80) as error
FROM app.bssid_enrichment_queue
WHERE status = 'failed'
ORDER BY tagged_at DESC
LIMIT 10;

\echo ''
\echo 'Next Pending BSSIDs (top 10 by priority):'
\echo '=========================================='

-- Next pending
SELECT
    bssid,
    priority,
    tagged_at
FROM app.bssid_enrichment_queue
WHERE status = 'pending'
ORDER BY priority DESC, tagged_at ASC
LIMIT 10;
EOF
