-- ShadowCheck Database Refactor - Phase 10: Performance Optimization
-- Advanced indexing, partitioning, and query optimization for high-volume SIGINT data

-- Table partitioning for time-series data (signal_measurements and position_measurements)
-- Partition by month for optimal query performance and maintenance

-- Enable constraint exclusion for partitioning
SET enable_partition_pruning = on;
SET constraint_exclusion = partition;

-- Convert signal_measurements to partitioned table
-- Note: This would require recreating the table in production
/*
CREATE TABLE app.signal_measurements_partitioned (
    LIKE app.signal_measurements INCLUDING ALL
) PARTITION BY RANGE (measurement_timestamp);

-- Create monthly partitions for current and future data
CREATE TABLE app.signal_measurements_2024_01 PARTITION OF app.signal_measurements_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE app.signal_measurements_2024_02 PARTITION OF app.signal_measurements_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for all months
*/

-- Advanced indexing strategy

-- BRIN indexes for time-series data (block range indexes - very efficient for timestamps)
CREATE INDEX CONCURRENTLY idx_signal_measurements_timestamp_brin
    ON app.signal_measurements USING BRIN (measurement_timestamp);

CREATE INDEX CONCURRENTLY idx_position_measurements_timestamp_brin
    ON app.position_measurements USING BRIN (measurement_timestamp);

-- Partial indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_signal_measurements_recent_strong
    ON app.signal_measurements (access_point_id, measurement_timestamp)
    WHERE measurement_timestamp >= NOW() - INTERVAL '7 days'
      AND signal_strength_dbm > -70;

CREATE INDEX CONCURRENTLY idx_signal_measurements_canonical_only
    ON app.signal_measurements (access_point_id, measurement_timestamp, signal_strength_dbm)
    WHERE is_canonical_observation = TRUE;

CREATE INDEX CONCURRENTLY idx_position_measurements_accurate_only
    ON app.position_measurements (measurement_timestamp, position_point)
    WHERE position_accuracy_meters < 20;

-- Composite indexes for common JOIN patterns
CREATE INDEX CONCURRENTLY idx_signal_position_correlation
    ON app.signal_measurements (access_point_id, measurement_timestamp, signal_strength_dbm);

CREATE INDEX CONCURRENTLY idx_position_temporal_spatial
    ON app.position_measurements (measurement_timestamp, access_point_id)
    INCLUDE (latitude_degrees, longitude_degrees);

-- Hash indexes for exact MAC address lookups (very fast for equality)
CREATE INDEX CONCURRENTLY idx_wireless_ap_mac_hash
    ON app.wireless_access_points USING HASH (mac_address);

-- Covering indexes (INCLUDE columns) for query optimization
CREATE INDEX CONCURRENTLY idx_wigle_enrichments_covering
    ON app.wigle_api_enrichments (access_point_id)
    INCLUDE (wigle_trilat, wigle_trilong, wigle_last_time, match_confidence_score);

-- Text search indexes for SSID and network name searches
CREATE INDEX CONCURRENTLY idx_wireless_ap_network_name_gin
    ON app.wireless_access_points USING GIN (to_tsvector('english', current_network_name))
    WHERE current_network_name IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_identity_history_ssid_gin
    ON app.network_identity_history USING GIN (to_tsvector('english', ssid_value))
    WHERE ssid_value IS NOT NULL;

-- Spatial indexes with different geometries for various use cases
CREATE INDEX CONCURRENTLY idx_triangulated_positions_spatial_high_conf
    ON app.network_triangulated_positions USING GIST (triangulated_point)
    WHERE position_confidence_score > 0.8;

-- JSONB indexes for WiGLE location observations
CREATE INDEX CONCURRENTLY idx_wigle_location_observations_gin
    ON app.wigle_api_enrichments USING GIN (wigle_location_observations)
    WHERE wigle_location_observations IS NOT NULL;

-- Functional indexes for computed values
CREATE INDEX CONCURRENTLY idx_signal_measurements_rssi_bucket
    ON app.signal_measurements ((signal_strength_dbm / 10));  -- 10 dBm buckets

CREATE INDEX CONCURRENTLY idx_position_measurements_hour_bucket
    ON app.position_measurements (date_trunc('hour', measurement_timestamp));

-- Multi-column indexes for deduplication queries
CREATE INDEX CONCURRENTLY idx_fingerprints_dedup_lookup
    ON app.observation_fingerprints (access_point_id, timestamp_window_start, timestamp_window_end, signal_range_low, signal_range_high);

-- Performance monitoring views

-- Query performance analysis view
CREATE OR REPLACE VIEW app.vw_query_performance AS
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE schemaname = 'app'
ORDER BY tablename, attname;

-- Index usage statistics view
CREATE OR REPLACE VIEW app.vw_index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_scan < 100 THEN 'Rarely used'
        WHEN idx_scan < 1000 THEN 'Moderately used'
        ELSE 'Frequently used'
    END as usage_category
FROM pg_stat_user_indexes
WHERE schemaname = 'app'
ORDER BY idx_scan DESC;

-- Table size and bloat analysis
CREATE OR REPLACE VIEW app.vw_table_sizes AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    CASE
        WHEN n_live_tup > 0
        THEN round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
        ELSE 0
    END as dead_row_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'app'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Materialized view refresh scheduling functions

-- Function to refresh materialized views intelligently
CREATE OR REPLACE FUNCTION app.refresh_materialized_views(p_force_refresh BOOLEAN DEFAULT FALSE)
RETURNS TEXT AS $$
DECLARE
    view_info RECORD;
    refresh_result TEXT := '';
    last_refresh TIMESTAMPTZ;
    should_refresh BOOLEAN;
BEGIN
    -- Check each materialized view and refresh if needed
    FOR view_info IN
        SELECT schemaname, matviewname
        FROM pg_matviews
        WHERE schemaname = 'app'
        ORDER BY matviewname
    LOOP
        -- Determine if refresh is needed based on data freshness
        EXECUTE format('SELECT MAX(record_created_at) FROM %I.%I',
                      view_info.schemaname,
                      CASE view_info.matviewname
                          WHEN 'mv_network_triangulation' THEN 'signal_measurements'
                          WHEN 'mv_location_clusters' THEN 'position_measurements'
                          WHEN 'mv_network_coverage' THEN 'signal_measurements'
                          WHEN 'mv_movement_routes' THEN 'position_measurements'
                          WHEN 'mv_colocation_patterns' THEN 'position_measurements'
                          ELSE 'signal_measurements'
                      END)
        INTO last_refresh;

        -- Get last refresh time of materialized view
        -- Note: This is a simplified check - in production, store refresh times in a separate table
        should_refresh := p_force_refresh OR
                         last_refresh > NOW() - INTERVAL '1 hour';

        IF should_refresh THEN
            EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I.%I',
                          view_info.schemaname, view_info.matviewname);
            refresh_result := refresh_result || view_info.matviewname || ' ';
        END IF;
    END LOOP;

    RETURN 'Refreshed: ' || refresh_result;
END;
$$ LANGUAGE plpgsql;

-- Automated maintenance functions

-- Vacuum and analyze function for optimal performance
CREATE OR REPLACE FUNCTION app.perform_maintenance()
RETURNS TEXT AS $$
DECLARE
    table_info RECORD;
    maintenance_result TEXT := '';
BEGIN
    -- Analyze tables for up-to-date statistics
    FOR table_info IN
        SELECT schemaname, tablename, n_dead_tup, n_live_tup
        FROM pg_stat_user_tables
        WHERE schemaname = 'app'
          AND (n_dead_tup > 1000 OR n_live_tup > 10000)  -- Only large or bloated tables
        ORDER BY n_dead_tup DESC
    LOOP
        -- Vacuum if significant dead tuples
        IF table_info.n_dead_tup > table_info.n_live_tup * 0.1 THEN  -- >10% dead tuples
            EXECUTE format('VACUUM (ANALYZE) %I.%I', table_info.schemaname, table_info.tablename);
            maintenance_result := maintenance_result || 'VACUUM ' || table_info.tablename || ' ';
        ELSE
            EXECUTE format('ANALYZE %I.%I', table_info.schemaname, table_info.tablename);
            maintenance_result := maintenance_result || 'ANALYZE ' || table_info.tablename || ' ';
        END IF;
    END LOOP;

    -- Refresh materialized views
    maintenance_result := maintenance_result || app.refresh_materialized_views(FALSE);

    RETURN maintenance_result;
END;
$$ LANGUAGE plpgsql;

-- Query optimization hints and prepared statements

-- Optimized query for recent network activity
PREPARE recent_network_activity (INTERVAL, INTEGER) AS
    SELECT
        ap.mac_address,
        ap.current_network_name,
        COUNT(*) as observation_count,
        MAX(sm.measurement_timestamp) as last_seen,
        AVG(sm.signal_strength_dbm) as avg_signal
    FROM app.wireless_access_points ap
    JOIN app.signal_measurements sm ON sm.access_point_id = ap.access_point_id
    WHERE sm.measurement_timestamp >= NOW() - $1
      AND sm.is_canonical_observation = TRUE
    GROUP BY ap.access_point_id, ap.mac_address, ap.current_network_name
    HAVING COUNT(*) >= $2
    ORDER BY last_seen DESC;

-- Optimized spatial query for nearby networks
PREPARE networks_near_point (NUMERIC, NUMERIC, NUMERIC) AS
    SELECT
        ap.mac_address,
        ap.current_network_name,
        ST_Distance(
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            nc.signal_weighted_center::geography
        ) as distance_meters,
        nc.coverage_quality_score
    FROM app.wireless_access_points ap
    JOIN app.mv_network_coverage nc ON nc.access_point_id = ap.access_point_id
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        nc.signal_weighted_center::geography,
        $3
    )
    ORDER BY distance_meters;

-- Memory and connection pool optimization settings

-- Function to set optimal PostgreSQL parameters for SIGINT workload
CREATE OR REPLACE FUNCTION app.optimize_database_settings()
RETURNS TEXT AS $$
BEGIN
    -- These would typically be set in postgresql.conf
    -- Shown here for documentation of optimal settings

    /*
    Recommended postgresql.conf settings for SIGINT workload:

    # Memory settings
    shared_buffers = '4GB'                    # 25% of RAM for large datasets
    effective_cache_size = '12GB'             # 75% of RAM
    work_mem = '256MB'                        # For spatial queries and sorting
    maintenance_work_mem = '1GB'              # For VACUUM and index creation

    # Query optimization
    random_page_cost = 1.1                    # Assume SSD storage
    effective_io_concurrency = 200            # SSD concurrent I/O
    max_worker_processes = 16                 # Parallel query processing
    max_parallel_workers_per_gather = 4       # Parallel execution
    max_parallel_workers = 16                 # Total parallel workers

    # WAL and checkpoints
    wal_buffers = '16MB'                      # WAL buffer size
    checkpoint_completion_target = 0.9        # Spread checkpoint I/O
    wal_compression = on                      # Compress WAL

    # PostGIS optimizations
    shared_preload_libraries = 'postgis'     # Preload PostGIS
    */

    RETURN 'Database optimization settings documented in function';
END;
$$ LANGUAGE plpgsql;

-- Connection pool configuration for application layer
CREATE OR REPLACE VIEW app.vw_connection_recommendations AS
SELECT
    'pgbouncer' as connection_pooler,
    'transaction' as pool_mode,
    100 as max_client_connections,
    20 as default_pool_size,
    25 as max_db_connections,
    '30s' as server_idle_timeout,
    'SIGINT workload with spatial queries' as notes
UNION ALL
SELECT
    'application_layer',
    'prepared_statements',
    NULL,
    NULL,
    NULL,
    NULL,
    'Use prepared statements for frequent queries (recent_network_activity, networks_near_point)'
;

-- Performance monitoring alerts
CREATE OR REPLACE FUNCTION app.check_performance_alerts()
RETURNS TABLE(
    alert_type TEXT,
    alert_message TEXT,
    severity TEXT,
    recommended_action TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check for unused indexes
    SELECT
        'unused_index'::TEXT,
        'Index ' || indexname || ' on ' || tablename || ' has not been used',
        'warning'::TEXT,
        'Consider dropping if consistently unused'::TEXT
    FROM app.vw_index_usage
    WHERE usage_category = 'Never used'
      AND indexname NOT LIKE '%_pkey';

    -- Check for high dead tuple percentage
    RETURN QUERY
    SELECT
        'table_bloat'::TEXT,
        'Table ' || tablename || ' has ' || dead_row_percentage || '% dead rows',
        CASE
            WHEN dead_row_percentage > 20 THEN 'critical'
            WHEN dead_row_percentage > 10 THEN 'warning'
            ELSE 'info'
        END::TEXT,
        'Run VACUUM on table'::TEXT
    FROM app.vw_table_sizes
    WHERE dead_row_percentage > 5;

    -- Check for missing indexes on foreign keys
    RETURN QUERY
    SELECT
        'missing_fk_index'::TEXT,
        'Foreign key constraint may need index for performance',
        'info'::TEXT,
        'Consider adding index if JOIN performance is poor'::TEXT
    WHERE EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'app'
          AND NOT EXISTS (
              SELECT 1 FROM pg_indexes
              WHERE schemaname = 'app'
                AND tablename = tc.table_name
                AND indexdef LIKE '%' || kcu.column_name || '%'
          )
    );
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION app.refresh_materialized_views(BOOLEAN) IS 'Intelligently refresh materialized views based on data freshness';
COMMENT ON FUNCTION app.perform_maintenance() IS 'Automated maintenance: VACUUM, ANALYZE, and materialized view refresh';
COMMENT ON FUNCTION app.optimize_database_settings() IS 'Documentation of optimal PostgreSQL settings for SIGINT workload';
COMMENT ON FUNCTION app.check_performance_alerts() IS 'Monitor database performance and identify optimization opportunities';
COMMENT ON VIEW app.vw_query_performance IS 'Column statistics for query optimization analysis';
COMMENT ON VIEW app.vw_index_usage IS 'Index usage statistics to identify unused indexes';
COMMENT ON VIEW app.vw_table_sizes IS 'Table size and bloat analysis for maintenance planning';

-- Create maintenance schedule (would be implemented via cron or pg_cron)
/*
Example cron schedule for maintenance:

# Daily maintenance at 2 AM
0 2 * * * psql -d shadowcheck -c "SELECT app.perform_maintenance();"

# Weekly deep maintenance on Sunday at 3 AM
0 3 * * 0 psql -d shadowcheck -c "VACUUM (ANALYZE, VERBOSE);"

# Materialized view refresh every hour during active hours
0 8-22 * * * psql -d shadowcheck -c "SELECT app.refresh_materialized_views(TRUE);"
*/