# ShadowCheck Database Schema

**Target**: PostgreSQL 15+ with PostGIS • **Primary schema**: `app`  
**Source**: WiGLE Android app export → PostgreSQL migration

> This is a summary. Canonical source: SQL migrations in `/server/sql/`

---

## Core Tables

### app.location (85 MB, ~millions of rows)
Core observation records - one row per WiFi/network sighting with location data.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | Primary key |
| bssid | text | WiFi MAC address (NOT NULL) |
| level | integer | Signal strength in dBm (NOT NULL) |
| lat | double precision | Latitude (NOT NULL) |
| lon | double precision | Longitude (NOT NULL) |
| altitude | double precision | Elevation in meters (NOT NULL) |
| accuracy | double precision | GPS accuracy in meters (NOT NULL) |
| time | bigint | Timestamp (epoch milliseconds) (NOT NULL) |
| external | integer | External flag (default: 0) |
| mfgrid | integer | Manufacturing grid flag (default: 0) |

**Example data**: Signal observations with coordinates around 43.02°N, -83.69°W

### app.network (38 MB)
Network metadata - aggregated information per BSSID.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | bigint | auto-increment | Primary key |
| bssid | text | - | WiFi MAC address (NOT NULL) |
| ssid | text | - | Network name (NOT NULL) |
| frequency | integer | - | Channel frequency (NOT NULL) |
| capabilities | text | - | Security capabilities string (NOT NULL) |
| lasttime | bigint | - | Last seen timestamp (NOT NULL) |
| lastlat | double precision | - | Last known latitude (NOT NULL) |
| lastlon | double precision | - | Last known longitude (NOT NULL) |
| type | text | 'W' | Network type |
| bestlevel | integer | 0 | Best signal strength seen |
| bestlat | double precision | 0 | Best signal location lat |
| bestlon | double precision | 0 | Best signal location lon |
| rcois | text | '' | RCOI identifiers |
| mfgrid | integer | 0 | Manufacturing grid |
| service | text | '' | Service identifier |

### app.location_details_asof (View/Table)
Enriched location data with security parsing and metadata.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | References location.id |
| bssid | text | WiFi MAC address |
| level | integer | Signal strength |
| lat, lon | double precision | Coordinates |
| altitude, accuracy | double precision | GPS metadata |
| time | bigint | Observation timestamp |
| external, mfgrid | integer | Flags |
| **ssid_at_time** | text | Network name when observed |
| **frequency_at_time** | integer | Channel when observed |
| **capabilities_at_time** | text | Raw security string |
| **ssid_lasttime** | bigint | Last SSID update time |
| **radio_short** | text | Radio type ('WiFi', 'Cell', 'BT') |
| **security_short** | text | Parsed security ('WPA2', 'Open', etc.) |
| **cipher_short** | text | Encryption cipher |
| **flags_short** | text | Additional capability flags |

---

## Supporting Tables

### app.route (1.8 MB)
Movement tracking with device visibility counts.

| Column | Type | Notes |
|--------|------|-------|
| _id | bigint | Primary key |
| run_id | integer | Collection run identifier |
| wifi_visible | integer | WiFi networks seen (default: 0) |
| cell_visible | integer | Cell towers seen (default: 0) |
| bt_visible | integer | Bluetooth devices seen (default: 0) |
| lat, lon | double precision | GPS coordinates |
| altitude, accuracy | double precision | GPS metadata |
| time | bigint | Timestamp |

### Audit & Provenance Tables

- **app.audit_location_updates** - Change tracking for location records
- **app.audit_network_updates** - Change tracking for network records  
- **app.provenance** - Data source tracking (network_rows, location_rows, loaded_at)
- **app.load_runs** - ETL batch processing metadata
- **app.event_log** - System events with JSONB payloads

### Backup Tables (2025-09-02)
- **app.location_bak_2025_09_02** (131 MB) - Location backup with extra_json field
- **app.network_bak_2025_09_02** (22 MB) - Network backup with PostGIS geometry column

### Raw Data Tables
- **app.location_unified_raw** (53 MB) - Raw location import data
- **app.network_unified_raw** (28 MB) - Raw network import data  
- **app.route_unified_raw** (1.8 MB) - Raw route import data

---

## PostGIS Integration

**Spatial columns found**:
- `app.network_bak_2025_09_02.geom` - `geometry(Point, 4326)` (SRID: 4326, 2D points)

**Missing spatial optimization**: Main tables (`location`, `network`) use separate `lat`/`lon` columns instead of PostGIS geometry. Consider adding:
```sql
-- Add spatial columns for performance
ALTER TABLE app.location ADD COLUMN geom geometry(Point, 4326);
UPDATE app.location SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326);
CREATE INDEX idx_location_geom ON app.location USING GIST (geom);
```

---

## Sample Queries

### Recent WiFi observations
```sql
SELECT bssid, level, lat, lon, time 
FROM app.location 
ORDER BY time DESC 
LIMIT 10;
```

### Networks by signal strength
```sql
SELECT n.ssid, n.bssid, n.bestlevel, n.frequency
FROM app.network n 
WHERE n.bestlevel > -50 
ORDER BY n.bestlevel DESC;
```

### Enriched location details
```sql
SELECT radio_short, security_short, ssid_at_time, level
FROM app.location_details_asof 
WHERE radio_short = 'WiFi' 
ORDER BY time DESC 
LIMIT 5;
```

### Spatial proximity (requires geometry column)
```sql
-- Example for future PostGIS implementation
SELECT bssid, ssid, ST_Distance(geom, ST_SetSRID(ST_MakePoint(-83.697, 43.023), 4326)) as distance_m
FROM app.network 
WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(-83.697, 43.023), 4326), 1000)
ORDER BY distance_m;
```

---

## Data Provenance

**WiGLE → PostgreSQL Migration Process**:
1. Export SQLite database from WiGLE Android app
2. Custom ETL scripts normalize radio-specific fields into unified schema
3. Security capabilities parsed into `*_short` fields for UI consumption
4. Audit trails track data lineage and changes
5. Backup tables preserve original import state

**Dataset Size**: ~400MB total across all tables and indexes  
**Time Range**: Based on `time` field values (epoch milliseconds)  
**Geographic Scope**: Sample data shows Michigan area (43.02°N, -83.69°W)

---

## Schema Evolution

### Current State
- Separate `lat`/`lon` columns (legacy WiGLE format)
- Rich audit and provenance tracking
- Backup strategies with timestamped tables
- Unified raw data preservation

### Recommended Enhancements  
- Add PostGIS geometry columns to main tables
- Implement spatial indexes for performance
- Consider partitioning large tables by time/geography
- Add foreign key constraints for referential integrity
