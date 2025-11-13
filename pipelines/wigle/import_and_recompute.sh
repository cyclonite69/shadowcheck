#!/usr/bin/env bash
#
# Seamless WiGLE Data Import and Recompute Script
#
# This script:
# 1. Imports new WiGLE SQLite backup data
# 2. Merges into staging tables
# 3. Recomputes all statistics
# 4. Backfills SSIDs between tables
# 5. Updates computed fields automatically
#
# Usage:
#   ./import_and_recompute.sh <sqlite_file>
#

set -e  # Exit on error

SQLITE_FILE="$1"
DB_HOST="${PGHOST:-127.0.0.1}"
DB_PORT="${PGPORT:-5432}"
DB_NAME="${PGDATABASE:-shadowcheck}"
DB_USER="${PGUSER:-shadowcheck_user}"
DB_PASS="${PGPASSWORD:-DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=}"

if [ -z "$SQLITE_FILE" ]; then
    echo "Usage: $0 <sqlite_file>"
    exit 1
fi

if [ ! -f "$SQLITE_FILE" ]; then
    echo "Error: File not found: $SQLITE_FILE"
    exit 1
fi

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  WiGLE Data Import & Recompute                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "SQLite file: $SQLITE_FILE"
echo "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo ""

# 1. Import SQLite data using wigle_sqlite_parser.py
echo "=== Phase 1: Import SQLite Data ==="
python3 "$(dirname "$0")/wigle_sqlite_parser.py" "$SQLITE_FILE"

# 2. Recompute observation counts
echo ""
echo "=== Phase 2: Recompute Observation Counts ==="
docker exec shadowcheck_postgres_18 psql -U postgres -d "$DB_NAME" <<'SQL'
UPDATE app.wigle_sqlite_networks_staging_deduped n
SET
    observation_count_staging = counts.staging_count,
    observation_count_api = COALESCE(counts.api_count, n.observation_count_api)
FROM (
    SELECT
        bssid,
        COUNT(*) FILTER (WHERE observation_source = 'sqlite') as staging_count,
        COUNT(*) FILTER (WHERE observation_source = 'wigle_api') as api_count
    FROM app.wigle_sqlite_locations_staging
    GROUP BY bssid
) counts
WHERE n.bssid = counts.bssid;

SELECT 'Updated observation counts for ' || COUNT(*) || ' networks'
FROM app.wigle_sqlite_networks_staging_deduped
WHERE observation_count_staging > 0;
SQL

# 3. Update first_seen/last_seen timestamps
echo ""
echo "=== Phase 3: Update Timestamps ==="
docker exec shadowcheck_postgres_18 psql -U postgres -d "$DB_NAME" <<'SQL'
UPDATE app.wigle_sqlite_networks_staging_deduped n
SET
    first_seen = CASE
        WHEN n.first_seen IS NULL THEN times.first_obs
        ELSE LEAST(n.first_seen, times.first_obs)
    END,
    last_seen = CASE
        WHEN n.last_seen IS NULL THEN times.last_obs
        ELSE GREATEST(n.last_seen, times.last_obs)
    END
FROM (
    SELECT
        bssid,
        MIN(to_timestamp(time / 1000)) as first_obs,
        MAX(to_timestamp(time / 1000)) as last_obs
    FROM app.wigle_sqlite_locations_staging
    WHERE time IS NOT NULL AND time > 0
    GROUP BY bssid
) times
WHERE n.bssid = times.bssid;

SELECT 'Updated timestamps for ' || COUNT(*) || ' networks'
FROM app.wigle_sqlite_networks_staging_deduped
WHERE first_seen IS NOT NULL;
SQL

# 4. Recompute signal statistics
echo ""
echo "=== Phase 4: Recompute Signal Statistics ==="
docker exec shadowcheck_postgres_18 psql -U postgres -d "$DB_NAME" <<'SQL'
UPDATE app.wigle_sqlite_networks_staging_deduped n
SET
    signal_min = stats.min_signal,
    signal_max = stats.max_signal,
    signal_avg = ROUND(stats.avg_signal::numeric, 2),
    signal_stddev = ROUND(stats.stddev_signal::numeric, 2)
FROM (
    SELECT
        bssid,
        MIN(COALESCE(signal_dbm, level)) as min_signal,
        MAX(COALESCE(signal_dbm, level)) as max_signal,
        AVG(COALESCE(signal_dbm, level)) as avg_signal,
        STDDEV(COALESCE(signal_dbm, level)) as stddev_signal
    FROM app.wigle_sqlite_locations_staging
    WHERE COALESCE(signal_dbm, level) IS NOT NULL
    GROUP BY bssid
) stats
WHERE n.bssid = stats.bssid;

SELECT 'Updated signal stats for ' || COUNT(*) || ' networks'
FROM app.wigle_sqlite_networks_staging_deduped
WHERE signal_avg IS NOT NULL;
SQL

# 5. Backfill SSIDs from networks to locations
echo ""
echo "=== Phase 5: Backfill SSIDs ==="
docker exec shadowcheck_postgres_18 psql -U postgres -d "$DB_NAME" <<'SQL'
-- Networks to locations
UPDATE app.wigle_sqlite_locations_staging loc
SET ssid = net.ssid
FROM app.wigle_sqlite_networks_staging_deduped net
WHERE loc.bssid = net.bssid
  AND loc.ssid IS NULL
  AND net.ssid IS NOT NULL
  AND net.ssid != '';

SELECT 'Backfilled SSIDs to ' || COUNT(*) || ' observations'
FROM app.wigle_sqlite_locations_staging
WHERE ssid IS NOT NULL;
SQL

# 6. Generate summary report
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Import Complete - Summary Statistics                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
docker exec shadowcheck_postgres_18 psql -U postgres -d "$DB_NAME" <<'SQL'
SELECT
    'Total networks' as metric,
    COUNT(*)::text as value
FROM app.wigle_sqlite_networks_staging_deduped
UNION ALL
SELECT
    '  - WiFi networks',
    COUNT(*)::text
FROM app.wigle_sqlite_networks_staging_deduped
WHERE type = 'W'
UNION ALL
SELECT
    '  - API enriched',
    COUNT(*)::text
FROM app.wigle_sqlite_networks_staging_deduped
WHERE api_enriched = TRUE
UNION ALL
SELECT
    'Total observations',
    COUNT(*)::text
FROM app.wigle_sqlite_locations_staging
UNION ALL
SELECT
    '  - With SSID',
    COUNT(*)::text
FROM app.wigle_sqlite_locations_staging
WHERE ssid IS NOT NULL
UNION ALL
SELECT
    '  - From SQLite',
    COUNT(*)::text
FROM app.wigle_sqlite_locations_staging
WHERE observation_source = 'sqlite'
UNION ALL
SELECT
    '  - From WiGLE API',
    COUNT(*)::text
FROM app.wigle_sqlite_locations_staging
WHERE observation_source = 'wigle_api';
SQL

echo ""
echo "✓ Import and recompute complete!"
echo ""
