-- =====================================================
-- ShadowCheck Automated Surveillance Detection Scheduler
-- Background processing system for continuous threat monitoring
-- Real-time surveillance detection with configurable intervals
-- =====================================================

-- =====================================================
-- SURVEILLANCE DETECTION JOB CONFIGURATION
-- =====================================================

-- Job scheduler configuration for automated surveillance detection
CREATE TABLE app.surveillance_detection_jobs (
    job_id SERIAL PRIMARY KEY,
    job_name TEXT NOT NULL UNIQUE,
    job_type TEXT NOT NULL, -- 'full_scan', 'incremental', 'targeted', 'maintenance'

    -- Execution configuration
    is_enabled BOOLEAN DEFAULT TRUE,
    execution_interval_minutes INTEGER NOT NULL DEFAULT 15, -- Run every 15 minutes by default
    max_execution_time_minutes INTEGER DEFAULT 30,

    -- Detection parameters
    analysis_window_hours INTEGER DEFAULT 24,
    min_confidence_threshold NUMERIC(3,2) DEFAULT 0.5,
    target_device_ids BIGINT[], -- NULL = scan all devices

    -- Resource management
    max_concurrent_executions INTEGER DEFAULT 1,
    resource_priority INTEGER DEFAULT 5 CHECK (resource_priority BETWEEN 1 AND 10),

    -- Execution tracking
    last_execution_start TIMESTAMPTZ,
    last_execution_end TIMESTAMPTZ,
    last_execution_status TEXT DEFAULT 'pending', -- 'running', 'completed', 'failed', 'timeout'
    consecutive_failures INTEGER DEFAULT 0,

    -- Results tracking
    total_executions BIGINT DEFAULT 0,
    total_anomalies_detected BIGINT DEFAULT 0,
    total_alerts_generated BIGINT DEFAULT 0,

    -- Performance metrics
    avg_execution_time_seconds NUMERIC(8,2),
    last_error_message TEXT,
    last_performance_metrics JSONB,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default surveillance detection jobs
INSERT INTO app.surveillance_detection_jobs (
    job_name, job_type, execution_interval_minutes, analysis_window_hours, min_confidence_threshold
) VALUES
    ('realtime_surveillance_scan', 'incremental', 5, 2, 0.7),       -- High-frequency, high-confidence
    ('comprehensive_surveillance_scan', 'full_scan', 60, 24, 0.5),  -- Hourly comprehensive scan
    ('government_infrastructure_scan', 'targeted', 30, 72, 0.6),    -- Government pattern focus
    ('weekly_deep_analysis', 'full_scan', 10080, 168, 0.3),         -- Weekly deep dive (7 days)
    ('maintenance_cleanup', 'maintenance', 1440, 0, 0.0)            -- Daily cleanup
ON CONFLICT (job_name) DO NOTHING;

-- =====================================================
-- AUTOMATED SURVEILLANCE DETECTION ENGINE
-- =====================================================

-- Master function for automated surveillance detection execution
CREATE OR REPLACE FUNCTION app.execute_surveillance_detection_job(
    p_job_id INTEGER DEFAULT NULL,
    p_job_name TEXT DEFAULT NULL
)
RETURNS TABLE(
    execution_id UUID,
    job_executed TEXT,
    execution_status TEXT,
    anomalies_detected INTEGER,
    alerts_generated INTEGER,
    execution_time_seconds NUMERIC,
    performance_metrics JSONB
) AS $$
DECLARE
    job_config RECORD;
    execution_uuid UUID := gen_random_uuid();
    start_time TIMESTAMPTZ := NOW();
    end_time TIMESTAMPTZ;
    total_anomalies INTEGER := 0;
    total_alerts INTEGER := 0;
    performance_data JSONB;
    error_occurred BOOLEAN := FALSE;
    detection_results RECORD;
BEGIN
    -- Get job configuration
    SELECT * INTO job_config
    FROM app.surveillance_detection_jobs
    WHERE (p_job_id IS NOT NULL AND job_id = p_job_id)
       OR (p_job_name IS NOT NULL AND job_name = p_job_name)
       OR (p_job_id IS NULL AND p_job_name IS NULL AND job_name = 'comprehensive_surveillance_scan')
    ORDER BY CASE WHEN job_name = 'realtime_surveillance_scan' THEN 1 ELSE 2 END
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT execution_uuid, 'no_job_found', 'failed', 0, 0, 0.0, '{}'::JSONB;
        RETURN;
    END IF;

    -- Check if job is enabled and not already running
    IF NOT job_config.is_enabled THEN
        RETURN QUERY SELECT execution_uuid, job_config.job_name, 'disabled', 0, 0, 0.0, '{}'::JSONB;
        RETURN;
    END IF;

    -- Check for concurrent execution
    IF job_config.last_execution_status = 'running' AND
       job_config.last_execution_start > NOW() - (job_config.max_execution_time_minutes || ' minutes')::INTERVAL THEN
        RETURN QUERY SELECT execution_uuid, job_config.job_name, 'already_running', 0, 0, 0.0, '{}'::JSONB;
        RETURN;
    END IF;

    -- Update job status to running
    UPDATE app.surveillance_detection_jobs
    SET last_execution_start = start_time,
        last_execution_status = 'running'
    WHERE job_id = job_config.job_id;

    BEGIN
        -- Execute surveillance detection based on job type
        IF job_config.job_type = 'full_scan' THEN
            -- Comprehensive scan of all devices
            FOR detection_results IN
                SELECT * FROM app.run_comprehensive_surveillance_detection(
                    NULL, -- All devices
                    job_config.analysis_window_hours,
                    TRUE  -- Create anomaly records
                )
            LOOP
                total_anomalies := total_anomalies + detection_results.anomaly_count;
            END LOOP;

        ELSIF job_config.job_type = 'incremental' THEN
            -- Fast scan focusing on recent activity and high-confidence patterns
            FOR detection_results IN
                SELECT * FROM app.run_comprehensive_surveillance_detection(
                    NULL, -- All devices
                    job_config.analysis_window_hours,
                    TRUE  -- Create anomaly records
                )
                WHERE detection_results.max_confidence >= job_config.min_confidence_threshold
            LOOP
                total_anomalies := total_anomalies + detection_results.anomaly_count;
            END LOOP;

        ELSIF job_config.job_type = 'targeted' THEN
            -- Targeted scan of specific devices or government infrastructure
            IF job_config.target_device_ids IS NOT NULL THEN
                -- Scan specific devices
                FOR detection_results IN
                    SELECT * FROM app.run_comprehensive_surveillance_detection(
                        unnest(job_config.target_device_ids),
                        job_config.analysis_window_hours,
                        TRUE
                    )
                LOOP
                    total_anomalies := total_anomalies + detection_results.anomaly_count;
                END LOOP;
            ELSE
                -- Government infrastructure focus
                PERFORM app.process_sequential_mac_government_correlation();

                -- Enhanced government pattern detection
                FOR detection_results IN
                    SELECT 'sequential_mac_pattern' as anomaly_type,
                           COUNT(*) as anomaly_count,
                           MAX(government_confidence) as max_confidence,
                           AVG(government_confidence) as avg_confidence,
                           COUNT(*) FILTER (WHERE government_confidence >= 0.8) as critical_count
                    FROM app.process_sequential_mac_government_correlation()
                    WHERE government_confidence >= job_config.min_confidence_threshold
                LOOP
                    total_anomalies := total_anomalies + detection_results.anomaly_count;
                END LOOP;
            END IF;

        ELSIF job_config.job_type = 'maintenance' THEN
            -- System maintenance and cleanup
            PERFORM app.cleanup_old_surveillance_data();
            PERFORM app.optimize_surveillance_indexes();
            total_anomalies := 0; -- Maintenance doesn't generate anomalies
        END IF;

        -- Generate alerts for new high-confidence anomalies
        FOR detection_results IN
            SELECT sa.anomaly_id
            FROM app.surveillance_anomalies sa
            LEFT JOIN app.surveillance_alerts sal ON sa.anomaly_id = sal.anomaly_id
            WHERE sa.detection_timestamp >= start_time
              AND sa.confidence_score >= 0.6
              AND sal.alert_id IS NULL -- Not already alerted
        LOOP
            PERFORM app.generate_smart_surveillance_alert(detection_results.anomaly_id);
            total_alerts := total_alerts + 1;
        END LOOP;

        end_time := NOW();

        -- Calculate performance metrics
        performance_data := jsonb_build_object(
            'execution_uuid', execution_uuid,
            'start_time', start_time,
            'end_time', end_time,
            'execution_seconds', EXTRACT(EPOCH FROM (end_time - start_time)),
            'anomalies_detected', total_anomalies,
            'alerts_generated', total_alerts,
            'job_type', job_config.job_type,
            'analysis_window_hours', job_config.analysis_window_hours,
            'min_confidence_threshold', job_config.min_confidence_threshold,
            'memory_usage_estimate', total_anomalies * 1024, -- Rough estimate
            'detection_rate_per_minute',
                CASE WHEN EXTRACT(EPOCH FROM (end_time - start_time)) > 0
                     THEN total_anomalies::NUMERIC / (EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0)
                     ELSE 0 END
        );

        -- Update job completion status
        UPDATE app.surveillance_detection_jobs
        SET last_execution_end = end_time,
            last_execution_status = 'completed',
            consecutive_failures = 0,
            total_executions = total_executions + 1,
            total_anomalies_detected = total_anomalies_detected + total_anomalies,
            total_alerts_generated = total_alerts_generated + total_alerts,
            avg_execution_time_seconds =
                CASE WHEN total_executions = 0 THEN EXTRACT(EPOCH FROM (end_time - start_time))
                     ELSE (COALESCE(avg_execution_time_seconds, 0) * total_executions +
                           EXTRACT(EPOCH FROM (end_time - start_time))) / (total_executions + 1)
                END,
            last_performance_metrics = performance_data,
            record_updated_at = NOW()
        WHERE job_id = job_config.job_id;

    EXCEPTION WHEN OTHERS THEN
        error_occurred := TRUE;
        end_time := NOW();

        -- Update job failure status
        UPDATE app.surveillance_detection_jobs
        SET last_execution_end = end_time,
            last_execution_status = 'failed',
            consecutive_failures = consecutive_failures + 1,
            last_error_message = SQLERRM,
            record_updated_at = NOW()
        WHERE job_id = job_config.job_id;

        performance_data := jsonb_build_object(
            'execution_uuid', execution_uuid,
            'error', TRUE,
            'error_message', SQLERRM,
            'execution_time_seconds', EXTRACT(EPOCH FROM (end_time - start_time))
        );
    END;

    RETURN QUERY SELECT
        execution_uuid,
        job_config.job_name,
        CASE WHEN error_occurred THEN 'failed' ELSE 'completed' END,
        total_anomalies,
        total_alerts,
        EXTRACT(EPOCH FROM (end_time - start_time))::NUMERIC,
        performance_data;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MAINTENANCE AND OPTIMIZATION FUNCTIONS
-- =====================================================

-- Function to clean up old surveillance data
CREATE OR REPLACE FUNCTION app.cleanup_old_surveillance_data()
RETURNS TABLE(
    cleanup_type TEXT,
    records_cleaned INTEGER,
    space_freed_estimate_mb NUMERIC
) AS $$
DECLARE
    config_record RECORD;
    retention_days INTEGER := 365; -- Default retention
BEGIN
    -- Get retention configuration
    SELECT evidence_retention_days INTO retention_days
    FROM app.surveillance_alert_config
    WHERE user_identifier = 'default_user';

    -- Clean up old dismissed alerts
    WITH deleted_alerts AS (
        DELETE FROM app.surveillance_alerts
        WHERE alert_status = 'dismissed'
          AND is_false_positive = TRUE
          AND record_created_at < NOW() - (retention_days || ' days')::INTERVAL
        RETURNING alert_id
    )
    SELECT 'dismissed_alerts', COUNT(*)::INTEGER, (COUNT(*) * 2)::NUMERIC
    FROM deleted_alerts;

    -- Clean up old chain of custody records for dismissed anomalies
    WITH deleted_custody AS (
        DELETE FROM app.evidence_chain_of_custody ecc
        WHERE ecc.anomaly_id IN (
            SELECT sa.anomaly_id FROM app.surveillance_anomalies sa
            WHERE sa.investigation_status = 'dismissed'
              AND sa.record_created_at < NOW() - (retention_days || ' days')::INTERVAL
        )
        RETURNING custody_id
    )
    SELECT 'old_custody_records', COUNT(*)::INTEGER, (COUNT(*) * 1)::NUMERIC
    FROM deleted_custody;

    -- Archive old surveillance anomalies (instead of deleting for forensic preservation)
    UPDATE app.surveillance_anomalies
    SET investigation_status = 'archived'
    WHERE investigation_status IN ('dismissed', 'false_positive')
      AND record_created_at < NOW() - (retention_days || ' days')::INTERVAL;

    RETURN QUERY SELECT 'old_anomalies_archived',
                        (SELECT COUNT(*)::INTEGER FROM app.surveillance_anomalies
                         WHERE investigation_status = 'archived'),
                        0.0;
END;
$$ LANGUAGE plpgsql;

-- Function to optimize surveillance detection indexes
CREATE OR REPLACE FUNCTION app.optimize_surveillance_indexes()
RETURNS TEXT AS $$
BEGIN
    -- Analyze tables for better query planning
    ANALYZE app.surveillance_anomalies;
    ANALYZE app.surveillance_alerts;
    ANALYZE app.government_infrastructure_correlations;
    ANALYZE app.wireless_access_points;
    ANALYZE app.position_measurements;
    ANALYZE app.signal_measurements;

    -- Reindex spatial indexes if needed
    REINDEX INDEX CONCURRENTLY idx_surveillance_anomalies_locations_gist;
    REINDEX INDEX CONCURRENTLY idx_position_measurements_point;
    REINDEX INDEX CONCURRENTLY idx_safe_zones_polygon_gist;

    RETURN 'Surveillance detection indexes optimized successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATED JOB SCHEDULING VIEWS
-- =====================================================

-- View for monitoring job execution status
CREATE OR REPLACE VIEW app.surveillance_job_status AS
SELECT
    sdj.job_id,
    sdj.job_name,
    sdj.job_type,
    sdj.is_enabled,
    sdj.execution_interval_minutes,

    -- Execution timing
    sdj.last_execution_start,
    sdj.last_execution_end,
    EXTRACT(EPOCH FROM (sdj.last_execution_end - sdj.last_execution_start))/60.0 as last_execution_minutes,

    -- Next execution estimate
    sdj.last_execution_start + (sdj.execution_interval_minutes || ' minutes')::INTERVAL as next_execution_estimate,

    -- Status and health
    sdj.last_execution_status,
    sdj.consecutive_failures,
    sdj.consecutive_failures >= 3 as needs_attention,

    -- Performance metrics
    sdj.total_executions,
    sdj.total_anomalies_detected,
    sdj.total_alerts_generated,
    sdj.avg_execution_time_seconds,

    -- Efficiency calculations
    CASE WHEN sdj.total_executions > 0
         THEN sdj.total_anomalies_detected::NUMERIC / sdj.total_executions
         ELSE 0 END as avg_anomalies_per_execution,

    CASE WHEN sdj.total_anomalies_detected > 0
         THEN sdj.total_alerts_generated::NUMERIC / sdj.total_anomalies_detected
         ELSE 0 END as alert_generation_rate,

    -- Health assessment
    CASE
        WHEN sdj.consecutive_failures >= 5 THEN 'critical'
        WHEN sdj.consecutive_failures >= 3 THEN 'warning'
        WHEN sdj.last_execution_status = 'failed' THEN 'error'
        WHEN sdj.last_execution_start < NOW() - (sdj.execution_interval_minutes * 2 || ' minutes')::INTERVAL THEN 'overdue'
        ELSE 'healthy'
    END as health_status

FROM app.surveillance_detection_jobs sdj
ORDER BY sdj.resource_priority, sdj.job_name;

-- Function to manually trigger job execution
CREATE OR REPLACE FUNCTION app.trigger_surveillance_detection(
    p_job_name TEXT DEFAULT 'comprehensive_surveillance_scan'
)
RETURNS JSONB AS $$
DECLARE
    execution_result RECORD;
    result_json JSONB;
BEGIN
    SELECT * INTO execution_result
    FROM app.execute_surveillance_detection_job(NULL, p_job_name);

    result_json := jsonb_build_object(
        'triggered_at', NOW(),
        'job_name', execution_result.job_executed,
        'status', execution_result.execution_status,
        'anomalies_detected', execution_result.anomalies_detected,
        'alerts_generated', execution_result.alerts_generated,
        'execution_time_seconds', execution_result.execution_time_seconds,
        'performance_metrics', execution_result.performance_metrics
    );

    RETURN result_json;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SYSTEM HEALTH MONITORING
-- =====================================================

-- Function to check surveillance detection system health
CREATE OR REPLACE FUNCTION app.surveillance_system_health_check()
RETURNS TABLE(
    component TEXT,
    status TEXT,
    details JSONB,
    last_check TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH health_checks AS (
        -- Job scheduler health
        SELECT
            'job_scheduler' as component,
            CASE
                WHEN COUNT(*) FILTER (WHERE health_status = 'critical') > 0 THEN 'critical'
                WHEN COUNT(*) FILTER (WHERE health_status = 'warning') > 0 THEN 'warning'
                WHEN COUNT(*) FILTER (WHERE health_status = 'error') > 0 THEN 'error'
                ELSE 'healthy'
            END as status,
            jsonb_build_object(
                'total_jobs', COUNT(*),
                'healthy_jobs', COUNT(*) FILTER (WHERE health_status = 'healthy'),
                'failed_jobs', COUNT(*) FILTER (WHERE health_status IN ('error', 'critical')),
                'overdue_jobs', COUNT(*) FILTER (WHERE health_status = 'overdue'),
                'disabled_jobs', COUNT(*) FILTER (WHERE NOT is_enabled)
            ) as details,
            NOW() as check_time
        FROM app.surveillance_job_status

        UNION ALL

        -- Database performance
        SELECT
            'database_performance' as component,
            CASE
                WHEN COUNT(*) FILTER (WHERE schemaname = 'app' AND n_tup_ins + n_tup_upd + n_tup_del > 100000) > 5 THEN 'warning'
                ELSE 'healthy'
            END as status,
            jsonb_build_object(
                'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
                'surveillance_table_activity', (
                    SELECT jsonb_object_agg(relname, n_tup_ins + n_tup_upd + n_tup_del)
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'app'
                      AND relname LIKE '%surveillance%'
                ),
                'index_usage', (
                    SELECT ROUND(AVG(idx_scan::NUMERIC / GREATEST(seq_scan + idx_scan, 1)) * 100, 2)
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'app'
                )
            ) as details,
            NOW() as check_time
        FROM pg_stat_user_tables
        WHERE schemaname = 'app'

        UNION ALL

        -- Recent detection activity
        SELECT
            'detection_activity' as component,
            CASE
                WHEN COUNT(*) FILTER (WHERE record_created_at >= NOW() - INTERVAL '1 hour') = 0 THEN 'warning'
                WHEN COUNT(*) FILTER (WHERE confidence_score >= 0.8) > 10 THEN 'elevated'
                ELSE 'normal'
            END as status,
            jsonb_build_object(
                'anomalies_last_hour', COUNT(*) FILTER (WHERE record_created_at >= NOW() - INTERVAL '1 hour'),
                'anomalies_last_24h', COUNT(*) FILTER (WHERE record_created_at >= NOW() - INTERVAL '24 hours'),
                'high_confidence_anomalies', COUNT(*) FILTER (WHERE confidence_score >= 0.8),
                'active_alerts', (SELECT COUNT(*) FROM app.surveillance_alerts WHERE alert_status = 'active')
            ) as details,
            NOW() as check_time
        FROM app.surveillance_anomalies
        WHERE record_created_at >= NOW() - INTERVAL '24 hours'
    )
    SELECT hc.component, hc.status, hc.details, hc.check_time FROM health_checks hc;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE app.surveillance_detection_jobs IS 'Automated surveillance detection job scheduler configuration';
COMMENT ON FUNCTION app.execute_surveillance_detection_job IS 'Master automated surveillance detection execution engine';
COMMENT ON FUNCTION app.cleanup_old_surveillance_data IS 'Maintenance function to clean up old surveillance detection data';
COMMENT ON FUNCTION app.optimize_surveillance_indexes IS 'Optimization function for surveillance detection database indexes';
COMMENT ON VIEW app.surveillance_job_status IS 'Real-time monitoring view for surveillance detection job execution';
COMMENT ON FUNCTION app.trigger_surveillance_detection IS 'Manual trigger function for surveillance detection jobs';
COMMENT ON FUNCTION app.surveillance_system_health_check IS 'Comprehensive system health monitoring for surveillance detection';