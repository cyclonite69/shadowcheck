-- =====================================================
-- Populate radio_manufacturers with correct column names
-- =====================================================

-- Populate radio_manufacturers from IEEE OUI data (correct column names)
INSERT INTO app.radio_manufacturers (
    ieee_registry_type,
    oui_assignment_hex,
    organization_name,
    organization_address
)
SELECT DISTINCT
    COALESCE(registry, 'MA-L') as ieee_registry_type,
    UPPER(REPLACE(assignment, ':', '')) as oui_assignment_hex,
    organization_name,
    COALESCE(organization_address, '') as organization_address
FROM app.ieee_ouis_clean_legacy
WHERE organization_name IS NOT NULL
    AND organization_name != ''
    AND assignment IS NOT NULL
    AND LENGTH(REPLACE(assignment, ':', '')) >= 6
ON CONFLICT (ieee_registry_type, oui_assignment_hex) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    organization_address = EXCLUDED.organization_address;

-- Show results
SELECT
    COUNT(*) as manufacturers_populated,
    COUNT(DISTINCT organization_name) as unique_organizations
FROM app.radio_manufacturers;