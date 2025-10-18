-- =====================================================
-- Step 4: Consolidate duplicate tables - keep better designed ones
-- =====================================================

BEGIN;

-- Drop the simpler table structures and keep the enhanced ones
-- network_observations is simpler -> keep signal_measurements
DROP TABLE app.network_observations CASCADE;

-- location_measurements uses custom domains -> keep position_measurements (more standard)
DROP TABLE app.location_measurements CASCADE;

-- Now let's populate the empty radio_manufacturers table from IEEE OUI data
-- This should have been populated but is empty (0 rows)
INSERT INTO app.radio_manufacturers (manufacturer_name, oui_prefix, website)
SELECT DISTINCT
    organization_name as manufacturer_name,
    LEFT(oui, 6) as oui_prefix,
    NULL as website
FROM app.ieee_ouis_clean_legacy
WHERE organization_name IS NOT NULL
    AND organization_name != ''
    AND oui IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;