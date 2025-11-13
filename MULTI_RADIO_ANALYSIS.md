# Multi-Radio Observation System Analysis
## Critical Design Flaw Investigation

**Date:** 2025-10-27
**System:** ShadowCheck SIGINT Forensics Platform
**Issue:** WiFi-centric schema causing multi-radio data misinterpretation

---

## Executive Summary

The ShadowCheck platform currently forces all radio observations (WiFi, LTE, Bluetooth, LoRa, GSM) into a WiFi-centric schema, causing systematic data misinterpretation. This analysis identifies the root causes, documents the data flow, and proposes an architectural fix.

### Key Findings

1. **Missing Critical View**: Backend queries `app.location_details_enriched` which **DOES NOT EXIST** in the database
2. **Single-Character Type Codes**: Radio types stored as single chars ('W', 'B', 'E', 'L', 'G') lose semantic meaning
3. **WiFi-Focused Column Names**: `ssid`, `capabilities`, `frequency` columns imply WiFi, causing confusion for cellular/BT data
4. **Frequency-Only Type Detection**: Current detection relies primarily on frequency ranges, ignoring data structure validation
5. **No Type-Specific Validation**: System allows SSID for LTE, BSSID for cell towers without validation

---

## Current Data Model Architecture

### Legacy Tables (Source of Truth - DO NOT MODIFY)

#### `app.locations_legacy`
Primary observation table - **436,000+ rows**

```sql
CREATE TABLE app.locations_legacy (
    unified_id BIGSERIAL PRIMARY KEY,
    source_id INTEGER,
    _id BIGINT,
    bssid TEXT,                -- WiFi MAC OR Cell Tower ID OR BT address
    level INTEGER,             -- Signal strength (dBm)
    lat DOUBLE PRECISION,      -- GPS latitude
    lon DOUBLE PRECISION,      -- GPS longitude
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    time BIGINT,               -- Unix milliseconds
    external INTEGER,
    mfgrid INTEGER
);
```

**Critical Issue**: This table has NO `type` field - type must be inferred via JOIN with `networks_legacy`

#### `app.networks_legacy`
Network metadata table

```sql
CREATE TABLE app.networks_legacy (
    unified_id BIGSERIAL PRIMARY KEY,
    source_id INTEGER,
    bssid TEXT,                -- Primary key for observations
    ssid TEXT,                 -- WiFi SSID OR Bluetooth name OR NULL for cellular
    frequency INTEGER,         -- Frequency in MHz
    capabilities TEXT,         -- WiFi capabilities OR BT services OR cellular info
    type TEXT,                 -- Single-char: 'W', 'B', 'E', 'L', 'G'
    lasttime BIGINT,
    lastlat DOUBLE PRECISION,
    lastlon DOUBLE PRECISION,
    bestlevel INTEGER,
    service TEXT               -- Additional metadata
);
```

**Type Field Values**:
- `'W'` = WiFi
- `'B'` = Bluetooth
- `'E'` = LTE/Cellular
- `'L'` = LoRa
- `'G'` = GSM

### Supplementary Tables

#### KML Import Tables
- `app.kml_networks_staging` - Networks from WiGLE KML exports
- `app.kml_locations_staging` - Observations from KML files
- Field: `network_type` (can be various formats)

#### Kismet Integration Tables
- `app.kismet_devices_staging` - Devices from Kismet captures
- `app.kismet_packets_staging` - Packet-level observations
- Field: `phyname` (e.g., 'IEEE80211', 'BTLE', 'CellularLTE')

#### WiGLE API Enrichment Tables
- `app.wigle_api_networks_staging` - Networks from WiGLE API
- `app.wigle_api_locations_staging` - API-sourced observations
- **Policy**: NEVER merged to legacy tables (data provenance)

---

## Data Flow Analysis

### 1. Data Ingestion Layer

#### KML Parser (`pipelines/kml/kml_parser.py`)

**Input**: WiGLE KML export files

**Type Detection**:
```python
metadata = parse_description(description)
network = {
    'bssid': metadata.get('bssid'),
    'ssid': metadata.get('ssid'),
    'frequency': metadata.get('frequency'),
    'capabilities': metadata.get('capabilities'),
    'network_type': metadata.get('type')  # <- Extracted from KML
}
```

**Issues**:
- Type extracted from KML description field (varies by export version)
- No validation that SSID is appropriate for network type
- No frequency-based fallback if type missing

#### WiGLE SQLite Parser (`pipelines/wigle/wigle_sqlite_parser.py`)

**Input**: WiGLE Android app SQLite database

**Type Detection**:
- Reads `type` directly from SQLite `network.type` column
- Usually single-character codes ('W', 'B', etc.)
- No multi-factor validation

#### Kismet Parser (`pipelines/kismet/kismet_parser.py`)

**Input**: Kismet .kismet SQLite files

**Type Detection**:
```python
device = {
    'phyname': record['phyname'],      # 'IEEE80211', 'BTLE', 'CellularLTE'
    'type_string': device_json['kismet.device.base.type'],
    'basic_type_string': device_json['kismet.device.base.basictype']
}
```

**Issues**:
- Kismet uses verbose PHY names, but these aren't mapped to single-char codes
- No standardization with legacy 'W'/'B'/'E' codes

### 2. Type Resolution Functions

#### `app.resolve_network_technology(frequency, type)`
Location: `schema/network_enrichments.sql`

```sql
CREATE OR REPLACE FUNCTION app.resolve_network_technology(
  p_frequency INTEGER,
  p_type TEXT
)
RETURNS TEXT AS $$
BEGIN
  -- WiFi frequency bands
  IF p_frequency BETWEEN 2400 AND 2500 THEN RETURN 'Wi-Fi';
  ELSIF p_frequency BETWEEN 5000 AND 6000 THEN RETURN 'Wi-Fi';
  ELSIF p_frequency BETWEEN 6000 AND 7125 THEN RETURN 'Wi-Fi';

  -- Cellular LTE bands
  ELSIF p_frequency BETWEEN 600 AND 900 THEN RETURN 'Cellular (LTE)';
  ELSIF p_frequency BETWEEN 1700 AND 2200 THEN RETURN 'Cellular (LTE)';
  ELSIF p_frequency BETWEEN 2500 AND 2700 THEN RETURN 'Cellular (LTE)';

  -- GSM/UMTS bands
  ELSIF p_frequency BETWEEN 850 AND 960 THEN RETURN 'Cellular (GSM/UMTS)';
  ELSIF p_frequency BETWEEN 1800 AND 1900 THEN RETURN 'Cellular (GSM/UMTS)';

  -- Fallback to type field
  ELSIF p_type IN ('wifi', 'Wi-Fi', 'WiFi') THEN RETURN 'Wi-Fi';

  ELSE RETURN 'Undetermined';
  END IF;
END;
$$;
```

**Issues**:
- Frequency ranges can overlap (e.g., 2.4GHz used by WiFi, BT, Zigbee)
- No consideration of data structure (presence of SSID, BSSID format)
- Type field used only as fallback, not as primary signal

---

## Backend API Layer

### Critical Issue: Non-Existent View

**Files**:
- `server/routes/networks.ts:112`
- `server/routes/within.ts:39`
- `server/routes/metrics.ts` (likely)

**Query Pattern**:
```typescript
const sql = `
  SELECT
    d.id, d.bssid, d.level, d.lat, d.lon,
    d.radio_short,           -- Radio type abbreviation
    d.security_short,        -- Security type
    d.frequency_mhz,         -- Frequency in MHz
    d.channel,               -- Channel number
    d.band,                  -- Frequency band
    d.cell_mcc,              -- Cellular: Mobile Country Code
    d.cell_mnc,              -- Cellular: Mobile Network Code
    d.cell_cid,              -- Cellular: Cell ID
    d.ble_services           -- Bluetooth: Service UUIDs
  FROM app.location_details_enriched d  -- <- VIEW DOES NOT EXIST!
  WHERE ...
`;
```

**Database Check Result**:
```
shadowcheck=# \d app.location_details_enriched
Did not find any relation named "app.location_details_enriched".
```

**Impact**:
- API calls to `/api/v1/networks` likely **FAIL**
- API calls to `/api/v1/within` likely **FAIL**
- Frontend cannot load observations
- System appears broken or returns empty data

### Cellular-Specific Parsing

When `radio_short` indicates cellular ('Cell%'), backend attempts to parse BSSID as `MCC_MNC_CID`:

```typescript
CASE WHEN d.radio_short LIKE 'Cell%'
      AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
     THEN split_part(d.bssid, '_', 1)::int ELSE NULL END AS cell_mcc,
```

**Issues**:
- Assumes cellular BSSID format is `MCC_MNC_CID` (underscore-separated)
- No validation in ingestion layer
- WiFi MAC addresses (colon-separated) won't match, causing NULL values

### Bluetooth-Specific Parsing

Extracts service UUIDs from capabilities field:

```typescript
CASE WHEN d.radio_short = 'BT' THEN (
  SELECT array_agg(DISTINCT m[1])::text[]
  FROM regexp_matches(coalesce(d.capabilities_at_time,''),
       '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'gi') m
) ELSE NULL END AS ble_services
```

**Issues**:
- Assumes BT capabilities contain UUID strings
- No standardized format for Bluetooth metadata

---

## Frontend Display Layer

### Component: `NetworkObservationsTableView.tsx`

**Type Label Conversion**:
```typescript
function getRadioTypeLabel(type: string): string {
  switch (type?.toUpperCase()) {
    case 'W': return 'WiFi';
    case 'B': return 'BT';
    case 'E': return 'LTE';
    case 'L': return 'LoRa';
    case 'G': return 'GSM';
    default: return type || '-';
  }
}
```

**Column Rendering**:
- SSID column shows `obs.ssid || <Hidden>` for ALL types
- Frequency shown for ALL types (appropriate for WiFi, less so for BT)
- Security/Encryption shown for ALL types (WiFi-specific concept)
- No type-specific column logic

**Example Misrendering**:
```typescript
// For LTE observation:
<td>
  <span>{obs.ssid || <Hidden>}</span>  // Shows "Hidden" - LTE has no SSID!
</td>
<td>
  <code>{obs.bssid}</code>  // Shows "310_260_12345" - not a MAC address!
</td>
<td>
  <span>{obs.encryption}</span>  // Shows "Misc" - cellular has no WiFi encryption!
</td>
```

**Type-Specific Rendering Needed**:
- **WiFi**: SSID, BSSID (MAC), Channel, Band, Security, Capabilities
- **LTE/Cellular**: MCC, MNC, Cell ID, Band, EARFCN, PCI
- **Bluetooth**: Device Name, MAC Address, Class, Services, RSSI
- **LoRa**: DevAddr, Frequency, Data Rate, Spreading Factor

---

## Root Cause Analysis

### 1. Historical WiFi-First Design

The system was originally designed for WiFi wardriving, then extended to support other radios without refactoring the core schema.

**Evidence**:
- Column names (`ssid`, `capabilities`) are WiFi-specific
- Frequency resolution function prioritizes WiFi bands
- UI components assume WiFi data structure

### 2. Type Detection is Monolithic

Current approach: **Single source of truth** (either `type` field OR frequency)

**Problems**:
- Frequency alone is ambiguous (2.4 GHz = WiFi, BT, Zigbee, Thread)
- Type field alone can be wrong (mislabeled imports)
- No validation that data structure matches declared type

### 3. Missing View Layer

The `location_details_enriched` view that backend queries **doesn't exist**, suggesting:
- Incomplete migration from old schema
- Missing deployment step
- Code written for planned feature not yet implemented

### 4. No Data Structure Validation

System allows semantically invalid combinations:
- LTE observations with SSID fields populated
- WiFi networks with cell tower IDs in BSSID
- Bluetooth devices with encryption types

---

## Proposed Architectural Fix

### Phase 1: Restore Functionality - Create Missing View

**Priority**: CRITICAL - System currently broken

Create `app.location_details_enriched` as a view over `locations_legacy` + `networks_legacy`:

```sql
CREATE OR REPLACE VIEW app.location_details_enriched AS
SELECT
    l.unified_id AS id,
    l.bssid,
    l.level,
    l.lat,
    l.lon,
    l.altitude,
    l.accuracy,
    l.time,

    -- Network metadata (from join)
    n.ssid AS ssid_at_time,
    n.frequency AS frequency_at_time,
    n.capabilities AS capabilities_at_time,
    n.type,

    -- Computed fields
    CASE
        WHEN n.frequency BETWEEN 2400 AND 2500 THEN n.frequency
        WHEN n.frequency BETWEEN 5000 AND 6000 THEN n.frequency
        ELSE NULL
    END AS frequency_mhz,

    CASE
        WHEN n.frequency BETWEEN 2412 AND 2484 THEN ((n.frequency - 2407) / 5)::int
        WHEN n.frequency BETWEEN 5000 AND 6000 THEN ((n.frequency - 5000) / 5)::int
        ELSE NULL
    END AS channel,

    CASE
        WHEN n.frequency BETWEEN 2400 AND 2500 THEN '2.4GHz'
        WHEN n.frequency BETWEEN 5000 AND 6000 THEN '5GHz'
        WHEN n.frequency BETWEEN 6000 AND 7125 THEN '6GHz'
        ELSE NULL
    END AS band,

    -- Radio type short code
    CASE n.type
        WHEN 'W' THEN 'WiFi'
        WHEN 'B' THEN 'BT'
        WHEN 'E' THEN 'LTE'
        WHEN 'L' THEN 'LoRa'
        WHEN 'G' THEN 'GSM'
        ELSE COALESCE(n.type, 'Unknown')
    END AS radio_short,

    -- Security extraction (WiFi-specific)
    -- TODO: Proper parsing of capabilities string
    SUBSTRING(n.capabilities FROM 1 FOR 20) AS security_short,
    NULL::text AS cipher_short,
    NULL::text AS flags_short

FROM app.locations_legacy l
LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
WHERE l.lat IS NOT NULL
  AND l.lon IS NOT NULL
  AND l.lat BETWEEN -90 AND 90
  AND l.lon BETWEEN -180 AND 180
  AND NOT (l.lat = 0 AND l.lon = 0);  -- Exclude Null Island
```

**Outcome**: Restores API functionality, provides immediate relief

---

### Phase 2: Multi-Signal Type Detection

**Problem**: Current detection relies on single signal (frequency OR type field)

**Solution**: Implement multi-factor radio type detection function

```sql
CREATE OR REPLACE FUNCTION app.detect_radio_type_multifactor(
    p_bssid TEXT,
    p_ssid TEXT,
    p_frequency INTEGER,
    p_capabilities TEXT,
    p_declared_type TEXT
)
RETURNS TABLE(
    detected_type TEXT,
    confidence_score NUMERIC,
    detection_method TEXT,
    validation_warnings TEXT[]
) AS $$
DECLARE
    warnings TEXT[] := ARRAY[]::TEXT[];
    score NUMERIC := 0.0;
    detected TEXT := 'Unknown';
    method TEXT := 'unknown';
BEGIN
    -- Signal 1: BSSID format analysis
    IF p_bssid ~ '^[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}$' THEN
        -- MAC address format (WiFi or Bluetooth)
        IF p_frequency BETWEEN 2400 AND 7125 THEN
            detected := 'WiFi';
            score := 0.8;
            method := 'mac_format_and_frequency';
        ELSIF p_frequency BETWEEN 2400 AND 2500 AND p_capabilities ~ 'BLE|Bluetooth' THEN
            detected := 'Bluetooth';
            score := 0.9;
            method := 'mac_format_and_bt_indicators';
        END IF;
    ELSIF p_bssid ~ '^[0-9]+_[0-9]+_[0-9]+$' THEN
        -- Cellular format (MCC_MNC_CID)
        detected := 'Cellular';
        score := 0.95;
        method := 'cellular_id_format';

        -- Validate: cellular should NOT have SSID
        IF p_ssid IS NOT NULL AND p_ssid != '' THEN
            warnings := array_append(warnings, 'Cellular network has SSID field populated');
            score := score - 0.2;
        END IF;
    END IF;

    -- Signal 2: Presence of WiFi-specific fields
    IF p_ssid IS NOT NULL AND p_ssid != '' THEN
        IF detected = 'WiFi' THEN
            score := score + 0.1;  -- Confirms WiFi
        ELSIF detected = 'Cellular' THEN
            score := score - 0.3;  -- Contradicts cellular
            warnings := array_append(warnings, 'SSID present but BSSID suggests cellular');
        ELSIF detected = 'Unknown' THEN
            detected := 'WiFi';
            score := 0.6;
            method := 'ssid_presence';
        END IF;
    END IF;

    -- Signal 3: Frequency band validation
    IF p_frequency IS NOT NULL THEN
        CASE
            WHEN p_frequency BETWEEN 2400 AND 2500 AND detected = 'WiFi' THEN
                score := score + 0.05;  -- WiFi 2.4GHz
            WHEN p_frequency BETWEEN 5000 AND 6000 AND detected = 'WiFi' THEN
                score := score + 0.1;   -- WiFi 5GHz (highly specific)
            WHEN p_frequency BETWEEN 600 AND 3000 AND detected = 'Cellular' THEN
                score := score + 0.1;   -- Cellular bands
            WHEN p_frequency BETWEEN 2400 AND 2500 AND detected = 'Bluetooth' THEN
                score := score + 0.05;  -- BT uses 2.4GHz
            ELSE
                warnings := array_append(warnings,
                    'Frequency ' || p_frequency || ' MHz unusual for detected type ' || detected);
                score := GREATEST(score - 0.1, 0);
        END CASE;
    END IF;

    -- Signal 4: Capabilities string patterns
    IF p_capabilities IS NOT NULL THEN
        IF p_capabilities ~ 'WPA|WEP|PSK|ESS' AND detected = 'WiFi' THEN
            score := LEAST(score + 0.1, 1.0);
        ELSIF p_capabilities ~ 'UUID|BLE|Service' AND detected = 'Bluetooth' THEN
            score := LEAST(score + 0.1, 1.0);
        ELSIF p_capabilities ~ 'LTE|EARFCN|PCI' AND detected = 'Cellular' THEN
            score := LEAST(score + 0.1, 1.0);
        END IF;
    END IF;

    -- Signal 5: Cross-check with declared type
    IF p_declared_type IS NOT NULL THEN
        CASE p_declared_type
            WHEN 'W', 'wifi', 'WiFi' THEN
                IF detected = 'WiFi' THEN score := LEAST(score + 0.05, 1.0);
                ELSE warnings := array_append(warnings, 'Declared type WiFi contradicts detection: ' || detected);
                END IF;
            WHEN 'E', 'LTE', 'cellular' THEN
                IF detected = 'Cellular' THEN score := LEAST(score + 0.05, 1.0);
                ELSE warnings := array_append(warnings, 'Declared type Cellular contradicts detection: ' || detected);
                END IF;
            WHEN 'B', 'BT', 'bluetooth' THEN
                IF detected = 'Bluetooth' THEN score := LEAST(score + 0.05, 1.0);
                ELSE warnings := array_append(warnings, 'Declared type Bluetooth contradicts detection: ' || detected);
                END IF;
        END CASE;
    END IF;

    RETURN QUERY SELECT detected, score, method, warnings;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Usage**:
```sql
SELECT * FROM app.detect_radio_type_multifactor(
    '00:11:22:33:44:55',  -- BSSID
    'MyNetwork',           -- SSID
    2437,                  -- Frequency
    '[WPA2-PSK-CCMP]',    -- Capabilities
    'W'                    -- Declared type
);

-- Result:
-- detected_type | confidence_score | detection_method | validation_warnings
-- WiFi          | 1.05            | mac_format_and_frequency | {}
```

---

### Phase 3: Polymorphic Observation Tables

**Problem**: Single table forces all radio types into same columns

**Solution**: Type-specific extension tables (WITHOUT modifying legacy tables)

```sql
-- WiFi-specific metadata (supplements locations_legacy)
CREATE TABLE IF NOT EXISTS app.wifi_observation_metadata (
    observation_id BIGINT PRIMARY KEY,  -- References locations_legacy.unified_id
    ssid TEXT,
    bssid_mac_address MACADDR,          -- Validated MAC address
    channel_number SMALLINT CHECK (channel_number BETWEEN 1 AND 196),
    channel_width_mhz SMALLINT CHECK (channel_width_mhz IN (20, 40, 80, 160)),
    frequency_band TEXT CHECK (frequency_band IN ('2.4GHz', '5GHz', '6GHz')),
    security_protocol TEXT,
    encryption_cipher TEXT,
    wps_enabled BOOLEAN,
    is_hidden_ssid BOOLEAN,
    beacon_interval_ms SMALLINT,
    capabilities_parsed JSONB,          -- Structured capabilities
    CONSTRAINT fk_wifi_obs_location FOREIGN KEY (observation_id)
        REFERENCES app.locations_legacy(unified_id) ON DELETE CASCADE
);

-- Cellular-specific metadata
CREATE TABLE IF NOT EXISTS app.cellular_observation_metadata (
    observation_id BIGINT PRIMARY KEY,
    mobile_country_code SMALLINT NOT NULL CHECK (mobile_country_code BETWEEN 100 AND 999),
    mobile_network_code SMALLINT NOT NULL CHECK (mobile_network_code BETWEEN 0 AND 999),
    cell_id BIGINT NOT NULL,
    cell_identity TEXT,                 -- MCC_MNC_CID string
    technology_generation TEXT CHECK (technology_generation IN ('2G', '3G', '4G', '5G')),
    frequency_band_name TEXT,           -- 'Band 2', 'Band 12', etc.
    earfcn INTEGER,                     -- E-UTRA Absolute Radio Frequency Channel Number
    physical_cell_id SMALLINT,          -- PCI
    tracking_area_code INTEGER,         -- TAC
    signal_quality_rsrq NUMERIC,        -- Reference Signal Received Quality
    signal_quality_rsrp NUMERIC,        -- Reference Signal Received Power
    serving_cell BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_cellular_obs_location FOREIGN KEY (observation_id)
        REFERENCES app.locations_legacy(unified_id) ON DELETE CASCADE
);

-- Bluetooth-specific metadata
CREATE TABLE IF NOT EXISTS app.bluetooth_observation_metadata (
    observation_id BIGINT PRIMARY KEY,
    device_address MACADDR NOT NULL,
    device_name TEXT,
    device_class INTEGER,              -- Bluetooth device class
    device_type TEXT,                  -- 'Classic', 'LE', 'Dual'
    manufacturer_id SMALLINT,
    service_uuids UUID[],              -- Array of service UUIDs
    service_data JSONB,                -- Service-specific data
    is_connectable BOOLEAN,
    is_random_address BOOLEAN,
    tx_power_dbm SMALLINT,
    CONSTRAINT fk_bluetooth_obs_location FOREIGN KEY (observation_id)
        REFERENCES app.locations_legacy(unified_id) ON DELETE CASCADE
);
```

**Unified Query Pattern**:
```sql
CREATE OR REPLACE VIEW app.observations_unified AS
SELECT
    l.unified_id,
    l.bssid,
    l.lat,
    l.lon,
    l.level,
    l.time,
    n.type AS radio_type,

    -- WiFi-specific (NULL for non-WiFi)
    w.ssid,
    w.channel_number,
    w.security_protocol,

    -- Cellular-specific (NULL for non-cellular)
    c.mobile_country_code,
    c.mobile_network_code,
    c.cell_id,
    c.technology_generation,

    -- Bluetooth-specific (NULL for non-BT)
    b.device_name,
    b.device_class,
    b.service_uuids

FROM app.locations_legacy l
LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
LEFT JOIN app.wifi_observation_metadata w ON l.unified_id = w.observation_id
LEFT JOIN app.cellular_observation_metadata c ON l.unified_id = c.observation_id
LEFT JOIN app.bluetooth_observation_metadata b ON l.unified_id = b.observation_id;
```

**Benefits**:
- Type-specific columns with appropriate data types
- Validation constraints prevent invalid data
- Legacy tables remain unchanged
- Backward compatible - can query legacy tables directly

---

### Phase 4: Type-Aware Display Layer

**Problem**: UI renders all observations identically

**Solution**: Type-specific rendering components

```typescript
// Type-specific column definitions
const COLUMN_CONFIGS = {
  WiFi: [
    { id: 'ssid', label: 'SSID', render: (obs) => obs.ssid || '<Hidden>' },
    { id: 'bssid', label: 'BSSID', render: (obs) => obs.bssid.toUpperCase() },
    { id: 'channel', label: 'Channel', render: (obs) => `${obs.channel} (${obs.band})` },
    { id: 'security', label: 'Security', render: (obs) => obs.security_protocol },
    { id: 'signal', label: 'Signal', render: (obs) => `${obs.signal_strength} dBm` },
  ],

  Cellular: [
    { id: 'cell_id', label: 'Cell ID', render: (obs) => `${obs.mcc}-${obs.mnc}-${obs.cid}` },
    { id: 'operator', label: 'Operator', render: (obs) => getMNOName(obs.mcc, obs.mnc) },
    { id: 'technology', label: 'Tech', render: (obs) => obs.technology_generation },
    { id: 'band', label: 'Band', render: (obs) => obs.frequency_band_name },
    { id: 'pci', label: 'PCI', render: (obs) => obs.physical_cell_id },
    { id: 'rsrp', label: 'RSRP', render: (obs) => `${obs.rsrp} dBm` },
  ],

  Bluetooth: [
    { id: 'name', label: 'Device Name', render: (obs) => obs.device_name || '<Unknown>' },
    { id: 'address', label: 'Address', render: (obs) => obs.device_address },
    { id: 'class', label: 'Class', render: (obs) => getBluetoothClassName(obs.device_class) },
    { id: 'services', label: 'Services', render: (obs) => obs.service_uuids?.join(', ') },
    { id: 'rssi', label: 'RSSI', render: (obs) => `${obs.signal_strength} dBm` },
  ]
};

// Dynamic column rendering
function NetworkObservationsTable({ observations }: Props) {
  const groupedByType = useMemo(() => {
    return observations.reduce((acc, obs) => {
      const type = obs.radio_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(obs);
      return acc;
    }, {} as Record<string, Observation[]>);
  }, [observations]);

  return (
    <div>
      {Object.entries(groupedByType).map(([type, obs]) => (
        <TypedObservationTable
          key={type}
          type={type}
          observations={obs}
          columns={COLUMN_CONFIGS[type] || COLUMN_CONFIGS.WiFi}
        />
      ))}
    </div>
  );
}
```

---

## Implementation Roadmap

### Step 1: Emergency Fix (Immediate - 1 hour)

**Goal**: Restore broken API functionality

1. Create `app.location_details_enriched` view (see Phase 1 above)
2. Test API endpoints:
   - `GET /api/v1/networks`
   - `GET /api/v1/within`
3. Verify frontend loads observations

**Validation**:
```bash
curl -s http://localhost:5000/api/v1/networks?limit=10 | jq '.ok'
# Should return: true
```

### Step 2: Multi-Factor Type Detection (1-2 days)

**Goal**: Implement intelligent type detection

1. Create `app.detect_radio_type_multifactor()` function
2. Add validation warnings to API responses
3. Create migration script to detect and flag misclassified observations:
   ```sql
   SELECT bssid, ssid, type,
          (app.detect_radio_type_multifactor(bssid, ssid, frequency, capabilities, type)).*
   FROM app.networks_legacy
   WHERE (SELECT confidence_score FROM app.detect_radio_type_multifactor(...)) < 0.7;
   ```

**Validation**:
- Run detection on 1000 random observations
- Manual verification of flagged anomalies
- Confidence score distribution analysis

### Step 3: Type-Specific Metadata Tables (2-3 days)

**Goal**: Create structured storage for radio-specific data

1. Create WiFi/Cellular/Bluetooth metadata tables
2. Write population scripts from legacy data:
   ```sql
   -- Populate WiFi metadata
   INSERT INTO app.wifi_observation_metadata
   SELECT
       l.unified_id,
       n.ssid,
       n.bssid::macaddr,
       -- Extract channel from frequency
       CASE WHEN n.frequency BETWEEN 2412 AND 2484
            THEN ((n.frequency - 2407) / 5)::smallint
            ELSE NULL END,
       ...
   FROM app.locations_legacy l
   JOIN app.networks_legacy n ON l.bssid = n.bssid
   WHERE n.type = 'W';
   ```
3. Create indexes on new tables
4. Update `app.observations_unified` view

**Validation**:
- Row counts match between legacy and metadata tables
- NULL checks for type-specific fields
- Performance testing on unified view

### Step 4: API Response Enhancement (1 day)

**Goal**: Return type-specific fields in API

1. Update `/api/v1/networks` to query `observations_unified`
2. Add type-specific fields to response:
   ```json
   {
     "observation_id": 12345,
     "radio_type": "Cellular",
     "latitude": 37.7749,
     "longitude": -122.4194,
     "signal_strength": -85,
     "cellular": {
       "mcc": 310,
       "mnc": 260,
       "cell_id": 12345678,
       "technology": "4G",
       "band": "Band 12",
       "pci": 256
     },
     "wifi": null,
     "bluetooth": null
   }
   ```

### Step 5: Frontend Type-Aware Rendering (2-3 days)

**Goal**: Display observations correctly per radio type

1. Update TypeScript interfaces to include type-specific fields
2. Implement `TypedObservationTable` component
3. Create radio-specific detail views
4. Add type filter UI (WiFi/Cellular/BT/All)

**Validation**:
- Screenshot comparison: before/after for cellular observations
- Verify "Hidden" SSID no longer shown for LTE
- Confirm cell tower IDs displayed as MCC-MNC-CID format

### Step 6: Data Quality Audit (Ongoing)

**Goal**: Identify and fix historical misclassifications

1. Run type detection on all observations
2. Generate report of anomalies:
   - Cellular observations with SSIDs
   - WiFi observations with cell IDs
   - Frequency mismatches
3. Create cleanup scripts (DO NOT auto-apply to legacy tables)
4. Manual review and correction

---

## Migration Strategy for Existing Data

**Principle**: Legacy tables are read-only. All enhancements go in new tables.

### Populating Type-Specific Tables

```sql
-- WiFi metadata population
WITH wifi_observations AS (
    SELECT l.unified_id, l.bssid, n.ssid, n.frequency, n.capabilities, n.type
    FROM app.locations_legacy l
    JOIN app.networks_legacy n ON l.bssid = n.bssid
    WHERE n.type = 'W'
)
INSERT INTO app.wifi_observation_metadata (
    observation_id, ssid, bssid_mac_address, channel_number,
    frequency_band, security_protocol, capabilities_parsed
)
SELECT
    unified_id,
    ssid,
    bssid::macaddr,
    CASE
        WHEN frequency BETWEEN 2412 AND 2484 THEN ((frequency - 2407) / 5)::smallint
        WHEN frequency BETWEEN 5000 AND 6000 THEN ((frequency - 5000) / 5)::smallint
        ELSE NULL
    END,
    CASE
        WHEN frequency BETWEEN 2400 AND 2500 THEN '2.4GHz'
        WHEN frequency BETWEEN 5000 AND 6000 THEN '5GHz'
        WHEN frequency BETWEEN 6000 AND 7125 THEN '6GHz'
    END,
    -- Parse security from capabilities
    CASE
        WHEN capabilities ~ 'WPA3' THEN 'WPA3'
        WHEN capabilities ~ 'WPA2' THEN 'WPA2'
        WHEN capabilities ~ 'WPA' THEN 'WPA'
        WHEN capabilities ~ 'WEP' THEN 'WEP'
        ELSE 'Open'
    END,
    to_jsonb(capabilities)
FROM wifi_observations
ON CONFLICT (observation_id) DO NOTHING;
```

### Handling Future Imports

1. New observations go to `locations_legacy` (unchanged)
2. Trigger function runs type detection
3. Populate appropriate metadata table based on detected type
4. Log validation warnings

```sql
CREATE OR REPLACE FUNCTION app.enrich_new_observation()
RETURNS TRIGGER AS $$
DECLARE
    detection RECORD;
BEGIN
    -- Get network metadata
    SELECT * INTO detection
    FROM app.detect_radio_type_multifactor(
        NEW.bssid,
        (SELECT ssid FROM app.networks_legacy WHERE bssid = NEW.bssid),
        (SELECT frequency FROM app.networks_legacy WHERE bssid = NEW.bssid),
        (SELECT capabilities FROM app.networks_legacy WHERE bssid = NEW.bssid),
        (SELECT type FROM app.networks_legacy WHERE bssid = NEW.bssid)
    );

    -- Insert into appropriate metadata table
    IF detection.detected_type = 'WiFi' AND detection.confidence_score > 0.7 THEN
        INSERT INTO app.wifi_observation_metadata (observation_id, ...)
        VALUES (NEW.unified_id, ...);
    ELSIF detection.detected_type = 'Cellular' AND detection.confidence_score > 0.7 THEN
        INSERT INTO app.cellular_observation_metadata (observation_id, ...)
        VALUES (NEW.unified_id, ...);
    -- ... etc
    END IF;

    -- Log warnings if confidence is low
    IF detection.confidence_score < 0.7 OR array_length(detection.validation_warnings, 1) > 0 THEN
        INSERT INTO app.observation_quality_log (observation_id, warnings, confidence)
        VALUES (NEW.unified_id, detection.validation_warnings, detection.confidence_score);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER t_enrich_observation_after_insert
AFTER INSERT ON app.locations_legacy
FOR EACH ROW EXECUTE FUNCTION app.enrich_new_observation();
```

---

## Risk Assessment

### Low Risk
- Creating new views (read-only)
- Creating new metadata tables (additive)
- Adding type detection functions (pure functions)

### Medium Risk
- Updating API responses (may break frontend)
  - Mitigation: Add new fields, keep old fields for compatibility
- Changing frontend rendering (UI changes)
  - Mitigation: Feature flag, A/B test

### High Risk
- Modifying legacy tables (FORBIDDEN by requirements)
- Auto-correcting type field (data integrity)
  - Mitigation: Manual review only, no automated changes

---

## Success Metrics

1. **API Functionality**: `/api/v1/networks` returns 200 OK
2. **Type Detection Accuracy**: >95% confidence score on validation set
3. **Data Coverage**: >99% of observations have type-specific metadata
4. **UI Correctness**: 0 instances of "Hidden" SSID for cellular observations
5. **Performance**: API response time <500ms for 100 observations
6. **Data Integrity**: Legacy tables unchanged (verified by row count + checksum)

---

## Open Questions

1. **What creates `location_details_enriched`?**
   - Is there a setup script we're missing?
   - Was this planned but not implemented?
   - Should we create it as a view or materialized view?

2. **How are Bluetooth observations currently stored?**
   - Need sample data from `networks_legacy WHERE type = 'B'`
   - What format are service UUIDs in?

3. **Cellular tower databases**
   - Do we want to enrich with MCC/MNC lookups (operator names)?
   - Cell tower location databases (OpenCellID integration)?

4. **Backward compatibility**
   - Do external tools query the database directly?
   - Can we version the API to allow migration period?

---

## Conclusion

The ShadowCheck platform suffers from a WiFi-centric design that was extended to multi-radio without proper refactoring. The immediate priority is creating the missing `location_details_enriched` view to restore functionality. The long-term solution involves multi-factor type detection, polymorphic metadata tables, and type-aware rendering.

**Critical**: Legacy tables must remain unchanged. All enhancements should be additive (new tables, views, functions).

**Next Steps**:
1. Create emergency fix view (1 hour)
2. Validate API functionality (30 min)
3. Review this document with team
4. Approve implementation roadmap
5. Begin Phase 2 (multi-factor detection)
