-- Comprehensive whitespace prevention triggers for all text columns
-- in networks_legacy and locations_legacy tables

BEGIN;

-- ============================================================================
-- NETWORKS_LEGACY TABLE - Comprehensive text trimming
-- ============================================================================

-- Create comprehensive trim function for networks_legacy
CREATE OR REPLACE FUNCTION app.trim_networks_legacy_text_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim all text fields
  IF NEW.bssid IS NOT NULL THEN
    NEW.bssid = TRIM(NEW.bssid);
  END IF;

  IF NEW.ssid IS NOT NULL THEN
    NEW.ssid = TRIM(NEW.ssid);
  END IF;

  IF NEW.capabilities IS NOT NULL THEN
    NEW.capabilities = TRIM(NEW.capabilities);
  END IF;

  IF NEW.type IS NOT NULL THEN
    NEW.type = TRIM(NEW.type);
  END IF;

  IF NEW.rcois IS NOT NULL THEN
    NEW.rcois = TRIM(NEW.rcois);
  END IF;

  IF NEW.service IS NOT NULL THEN
    NEW.service = TRIM(NEW.service);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old SSID-only trigger and create comprehensive one
DROP TRIGGER IF EXISTS trim_ssid_trigger ON app.networks_legacy;
DROP TRIGGER IF EXISTS trim_all_text_trigger ON app.networks_legacy;

CREATE TRIGGER trim_all_text_trigger
  BEFORE INSERT OR UPDATE
  ON app.networks_legacy
  FOR EACH ROW
  EXECUTE FUNCTION app.trim_networks_legacy_text_fields();

-- ============================================================================
-- LOCATIONS_LEGACY TABLE - Trim BSSID
-- ============================================================================

-- Create trim function for locations_legacy
CREATE OR REPLACE FUNCTION app.trim_locations_legacy_text_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim BSSID field
  IF NEW.bssid IS NOT NULL THEN
    NEW.bssid = TRIM(NEW.bssid);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on locations_legacy
DROP TRIGGER IF EXISTS trim_text_trigger ON app.locations_legacy;

CREATE TRIGGER trim_text_trigger
  BEFORE INSERT OR UPDATE
  ON app.locations_legacy
  FOR EACH ROW
  EXECUTE FUNCTION app.trim_locations_legacy_text_fields();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify triggers were created
SELECT
  nsp.nspname AS schema_name,
  cls.relname AS table_name,
  trg.tgname AS trigger_name
FROM pg_trigger trg
JOIN pg_class cls ON trg.tgrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'app'
  AND cls.relname IN ('networks_legacy', 'locations_legacy')
  AND trg.tgname LIKE '%trim%'
ORDER BY cls.relname, trg.tgname;

COMMIT;
