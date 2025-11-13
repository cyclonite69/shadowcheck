-- Deduplicate WiGLE SQLite Networks Staging Table
-- Strategy: Keep the most complete record for each BSSID
-- Scoring based on: data completeness, signal strength, recency

-- Create deduplicated table
DROP TABLE IF EXISTS app.wigle_sqlite_networks_staging_deduped CASCADE;

CREATE TABLE app.wigle_sqlite_networks_staging_deduped AS
WITH ranked_networks AS (
    SELECT
        *,
        -- Calculate completeness score (higher = more complete)
        (
            -- Core fields (mandatory, weighted higher)
            CASE WHEN ssid IS NOT NULL AND ssid != '' THEN 20 ELSE 0 END +
            CASE WHEN frequency IS NOT NULL AND frequency != 0 THEN 10 ELSE 0 END +
            CASE WHEN capabilities IS NOT NULL AND capabilities != '' THEN 10 ELSE 0 END +

            -- Location fields (important for positioning)
            CASE WHEN lastlat IS NOT NULL AND lastlon IS NOT NULL THEN 15 ELSE 0 END +
            CASE WHEN bestlat IS NOT NULL AND bestlon IS NOT NULL THEN 15 ELSE 0 END +

            -- Quality indicators
            CASE WHEN bestlevel IS NOT NULL THEN 10 ELSE 0 END +
            CASE WHEN lasttime IS NOT NULL THEN 10 ELSE 0 END +

            -- Optional enrichment fields
            CASE WHEN mfgrid IS NOT NULL THEN 5 ELSE 0 END +
            CASE WHEN rcois IS NOT NULL AND rcois != '' THEN 3 ELSE 0 END +
            CASE WHEN service IS NOT NULL AND service != '' THEN 2 ELSE 0 END
        ) as completeness_score,

        -- Rank by completeness, then signal strength, then recency
        ROW_NUMBER() OVER (
            PARTITION BY bssid
            ORDER BY
                -- Completeness first
                (
                    CASE WHEN ssid IS NOT NULL AND ssid != '' THEN 20 ELSE 0 END +
                    CASE WHEN frequency IS NOT NULL AND frequency != 0 THEN 10 ELSE 0 END +
                    CASE WHEN capabilities IS NOT NULL AND capabilities != '' THEN 10 ELSE 0 END +
                    CASE WHEN lastlat IS NOT NULL AND lastlon IS NOT NULL THEN 15 ELSE 0 END +
                    CASE WHEN bestlat IS NOT NULL AND bestlon IS NOT NULL THEN 15 ELSE 0 END +
                    CASE WHEN bestlevel IS NOT NULL THEN 10 ELSE 0 END +
                    CASE WHEN lasttime IS NOT NULL THEN 10 ELSE 0 END +
                    CASE WHEN mfgrid IS NOT NULL THEN 5 ELSE 0 END +
                    CASE WHEN rcois IS NOT NULL AND rcois != '' THEN 3 ELSE 0 END +
                    CASE WHEN service IS NOT NULL AND service != '' THEN 2 ELSE 0 END
                ) DESC,
                -- Best signal strength (closer to 0 is better)
                CASE WHEN bestlevel IS NOT NULL THEN bestlevel ELSE -999 END DESC,
                -- Most recent observation
                CASE WHEN lasttime IS NOT NULL THEN lasttime ELSE 0 END DESC
        ) as rank
    FROM app.wigle_sqlite_networks_staging
)
SELECT
    unified_id, source_id, bssid, ssid, frequency, capabilities,
    lasttime, lastlat, lastlon, type, bestlevel, bestlat, bestlon,
    rcois, mfgrid, service, sqlite_filename, imported_at,
    completeness_score
FROM ranked_networks
WHERE rank = 1;

-- Add primary key and indexes
ALTER TABLE app.wigle_sqlite_networks_staging_deduped
    ADD PRIMARY KEY (unified_id);

CREATE UNIQUE INDEX idx_deduped_networks_bssid
    ON app.wigle_sqlite_networks_staging_deduped(bssid);

CREATE INDEX idx_deduped_networks_type
    ON app.wigle_sqlite_networks_staging_deduped(type);

CREATE INDEX idx_deduped_networks_mfgrid
    ON app.wigle_sqlite_networks_staging_deduped(mfgrid)
    WHERE mfgrid IS NOT NULL;

CREATE INDEX idx_deduped_networks_filename
    ON app.wigle_sqlite_networks_staging_deduped(sqlite_filename);

CREATE INDEX idx_deduped_networks_time
    ON app.wigle_sqlite_networks_staging_deduped(lasttime);

-- Add comments
COMMENT ON TABLE app.wigle_sqlite_networks_staging_deduped IS
    'Deduplicated WiGLE networks - one record per BSSID, selected based on data completeness, signal strength, and recency';

COMMENT ON COLUMN app.wigle_sqlite_networks_staging_deduped.completeness_score IS
    'Data completeness score (0-100): higher means more complete record';

-- Statistics
SELECT
    'Original staging table' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT bssid) as unique_bssids
FROM app.wigle_sqlite_networks_staging
UNION ALL
SELECT
    'Deduplicated table' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT bssid) as unique_bssids
FROM app.wigle_sqlite_networks_staging_deduped;

-- Show completeness distribution
SELECT
    CASE
        WHEN completeness_score >= 90 THEN '90-100 (Excellent)'
        WHEN completeness_score >= 75 THEN '75-89 (Very Good)'
        WHEN completeness_score >= 60 THEN '60-74 (Good)'
        WHEN completeness_score >= 45 THEN '45-59 (Fair)'
        ELSE '0-44 (Poor)'
    END as completeness_range,
    COUNT(*) as count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM app.wigle_sqlite_networks_staging_deduped
GROUP BY
    CASE
        WHEN completeness_score >= 90 THEN '90-100 (Excellent)'
        WHEN completeness_score >= 75 THEN '75-89 (Very Good)'
        WHEN completeness_score >= 60 THEN '60-74 (Good)'
        WHEN completeness_score >= 45 THEN '45-59 (Fair)'
        ELSE '0-44 (Poor)'
    END
ORDER BY MIN(completeness_score) DESC;

-- Show mfgrid preservation
SELECT
    'Original' as source,
    COUNT(*) as total_networks,
    COUNT(mfgrid) as with_mfgrid,
    ROUND(100.0 * COUNT(mfgrid) / COUNT(*), 2) as percentage
FROM app.wigle_sqlite_networks_staging
UNION ALL
SELECT
    'Deduplicated' as source,
    COUNT(*) as total_networks,
    COUNT(mfgrid) as with_mfgrid,
    ROUND(100.0 * COUNT(mfgrid) / COUNT(*), 2) as percentage
FROM app.wigle_sqlite_networks_staging_deduped;

-- Show sample of duplicates that were resolved
WITH duplicate_bssids AS (
    SELECT bssid
    FROM app.wigle_sqlite_networks_staging
    GROUP BY bssid
    HAVING COUNT(*) > 1
    LIMIT 5
)
SELECT
    'BEFORE DEDUP' as status,
    s.bssid, s.ssid, s.frequency, s.bestlevel, s.mfgrid,
    s.sqlite_filename,
    (
        CASE WHEN s.ssid IS NOT NULL AND s.ssid != '' THEN 20 ELSE 0 END +
        CASE WHEN s.frequency IS NOT NULL AND s.frequency != 0 THEN 10 ELSE 0 END +
        CASE WHEN s.capabilities IS NOT NULL AND s.capabilities != '' THEN 10 ELSE 0 END +
        CASE WHEN s.lastlat IS NOT NULL AND s.lastlon IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN s.bestlat IS NOT NULL AND s.bestlon IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN s.bestlevel IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN s.lasttime IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN s.mfgrid IS NOT NULL THEN 5 ELSE 0 END +
        CASE WHEN s.rcois IS NOT NULL AND s.rcois != '' THEN 3 ELSE 0 END +
        CASE WHEN s.service IS NOT NULL AND s.service != '' THEN 2 ELSE 0 END
    ) as score
FROM app.wigle_sqlite_networks_staging s
WHERE s.bssid IN (SELECT bssid FROM duplicate_bssids)
ORDER BY s.bssid, score DESC;

SELECT
    'AFTER DEDUP (KEPT)' as status,
    d.bssid, d.ssid, d.frequency, d.bestlevel, d.mfgrid,
    d.sqlite_filename, d.completeness_score as score
FROM app.wigle_sqlite_networks_staging_deduped d
WHERE d.bssid IN (SELECT bssid FROM duplicate_bssids)
ORDER BY d.bssid;
