-- =====================================================
-- ShadowCheck Database Refactoring - Step by Step
-- Careful migration preserving existing data and relationships
-- =====================================================

-- Step 1: Create backup schema and move cruft tables
-- =====================================================

CREATE SCHEMA IF NOT EXISTS backup;

-- Move truly deprecated tables (broken design or obsolete)
ALTER TABLE IF EXISTS app.data_access_log SET SCHEMA backup;
ALTER TABLE IF EXISTS app.data_custody_log SET SCHEMA backup;
ALTER TABLE IF EXISTS app.device_colocation_events SET SCHEMA backup;
ALTER TABLE IF EXISTS app.device_relationships SET SCHEMA backup;
ALTER TABLE IF EXISTS app.government_infrastructure_correlations SET SCHEMA backup;
ALTER TABLE IF EXISTS app.network_change_events SET SCHEMA backup;
ALTER TABLE IF EXISTS app.wigle_enrichment_metadata SET SCHEMA backup;
ALTER TABLE IF EXISTS app.wigle_network_observations SET SCHEMA backup;