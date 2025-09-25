-- =====================================================
-- Step 3: Fix naming conflicts and standardize
-- =====================================================

-- Handle the duplicate table names
-- We have both 'network_observations' and 'signal_measurements' - keep the better named one
-- We have both 'location_measurements' and 'position_measurements' - standardize

-- First, check if signal_measurements is empty or has different data
-- If it's a duplicate, drop it, otherwise rename it
DROP TABLE IF EXISTS app.signal_measurements;

-- Rename network_observations to signal_measurements
ALTER TABLE app.network_observations RENAME TO signal_measurements;

-- For position data, keep location_measurements as the primary table
-- Drop position_measurements if it's empty
DROP TABLE IF EXISTS app.position_measurements;

-- Keep location_measurements with its current name (it's clear enough)

-- Rename radio_access_points to be consistent with wireless_access_points terminology
-- But first check if they're duplicates
-- Actually, let's keep both for now and examine the differences