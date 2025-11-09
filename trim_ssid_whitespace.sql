-- Trim whitespace from SSID fields in networks_legacy table
-- This fixes existing data and prevents future whitespace issues

BEGIN;

-- Step 1: Update existing SSIDs to remove leading/trailing whitespace
UPDATE app.networks_legacy
SET ssid = TRIM(ssid)
WHERE ssid IS NOT NULL
  AND ssid != TRIM(ssid);

-- Step 2: Create a trigger function to automatically trim SSIDs on insert/update
CREATE OR REPLACE FUNCTION app.trim_ssid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ssid IS NOT NULL THEN
    NEW.ssid = TRIM(NEW.ssid);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger on networks_legacy table
DROP TRIGGER IF EXISTS trim_ssid_trigger ON app.networks_legacy;
CREATE TRIGGER trim_ssid_trigger
  BEFORE INSERT OR UPDATE OF ssid
  ON app.networks_legacy
  FOR EACH ROW
  EXECUTE FUNCTION app.trim_ssid();

-- Verify the changes
SELECT
  COUNT(*) FILTER (WHERE LENGTH(ssid) != LENGTH(TRIM(ssid))) as ssids_with_whitespace,
  COUNT(*) FILTER (WHERE ssid IS NOT NULL) as total_ssids
FROM app.networks_legacy;

COMMIT;
