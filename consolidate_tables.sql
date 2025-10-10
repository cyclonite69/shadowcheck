-- =====================================================
-- Consolidate Duplicate Tables as Directed
-- Move losers to public._backup tables
-- =====================================================

BEGIN;

-- Create backup tables in public schema for the "loser" tables
CREATE TABLE public.network_observations_backup AS SELECT * FROM app.network_observations;
CREATE TABLE public.location_measurements_backup AS SELECT * FROM app.location_measurements;

-- Drop the loser tables from app schema
DROP TABLE app.network_observations CASCADE;
DROP TABLE app.location_measurements CASCADE;

-- Verify our winners remain
-- signal_measurements: 264,690 rows (winner)
-- position_measurements: 375,267 rows (winner)

-- Add comments for clarity
COMMENT ON TABLE public.network_observations_backup IS 'Backup of app.network_observations - signal_measurements is the correct table';
COMMENT ON TABLE public.location_measurements_backup IS 'Backup of app.location_measurements - position_measurements is the correct table';
COMMENT ON TABLE app.signal_measurements IS 'Primary signal measurement table - correct implementation';
COMMENT ON TABLE app.position_measurements IS 'Primary position measurement table - correct implementation';

COMMIT;