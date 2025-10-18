-- =====================================================
-- Step 2: Rename WiGLE source tables with _legacy suffix
-- These are the ongoing data pipeline tables, not one-time imports
-- =====================================================

-- Core WiGLE data pipeline tables
ALTER TABLE app.networks RENAME TO networks_legacy;
ALTER TABLE app.locations RENAME TO locations_legacy;
ALTER TABLE app.routes RENAME TO routes_legacy;
ALTER TABLE app.provenance RENAME TO provenance_legacy;

-- IEEE OUI registry data (reference tables)
ALTER TABLE app.ieee_ouis RENAME TO ieee_ouis_legacy;
ALTER TABLE app.ieee_ouis_clean RENAME TO ieee_ouis_clean_legacy;
ALTER TABLE app.ieee_ouis_corrupt RENAME TO ieee_ouis_corrupt_legacy;