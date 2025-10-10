-- =====================================================
-- Step 3: Rename current tables to better semantic names
-- =====================================================

-- Better naming for current normalized tables
ALTER TABLE app.network_observations RENAME TO signal_measurements;
ALTER TABLE app.location_measurements RENAME TO position_measurements;
-- Note: wireless_access_points already has good naming, keep as-is

-- Better naming for reference tables
ALTER TABLE app.oui_manufacturers RENAME TO manufacturer_registry;
ALTER TABLE app.data_sources RENAME TO data_import_sources;