# ShadowCheck Database Schema (Current)
**Target**: PostgreSQL 15+ with PostGIS • **Primary schema**: `app`  
**Status**: Normalized relational schema with foreign key integrity  
**Migration**: Completed from legacy flat schema to normalized structure  

---

## Current Production Schema

### app.networks (WiFi Network Registry)
Normalized table storing unique WiFi networks with temporal tracking.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigserial | PRIMARY KEY | Auto-incrementing unique identifier |
| bssid | text | NOT NULL, UNIQUE | WiFi MAC address |
| first_seen_at | timestamptz | NOT NULL | First observation timestamp |
| last_seen_at | timestamptz | NOT NULL | Most recent observation |
| current_ssid | text | | Current network name |
| current_frequency | integer | | Current WiFi frequency |
| current_capabilities | text | | Security capabilities string |
| created_at | timestamptz | DEFAULT NOW() | Record creation time |
| updated_at | timestamptz | DEFAULT NOW() | Last modification time |

**Indexes**: 
- `networks_pkey` (PRIMARY KEY on id)
- `networks_bssid_key` (UNIQUE on bssid)
- `idx_networks_bssid` (btree on bssid)
- `idx_networks_last_seen` (btree on last_seen_at DESC)

### app.locations (GPS Scan Locations)
Normalized table storing GPS coordinates where scans occurred.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigserial | PRIMARY KEY | Auto-incrementing unique identifier |
| latitude | decimal(10,8) | NOT NULL | GPS latitude coordinate |
| longitude | decimal(11,8) | NOT NULL | GPS longitude coordinate |
| altitude | decimal(8,2) | | Elevation in meters |
| accuracy | decimal(6,2) | | GPS accuracy in meters |
| observed_at | timestamptz | NOT NULL | Observation timestamp |
| device_id | text | DEFAULT 'termux_import' | Scanner device identifier |
| created_at | timestamptz | DEFAULT NOW() | Record creation time |

**Constraints**:
- `UNIQUE(latitude, longitude, observed_at)` - Prevents duplicate location/time combinations

### app.network_observations (Junction Table)
Links networks to locations, maintaining referential integrity.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigserial | PRIMARY KEY | Auto-incrementing unique identifier |
| network_id | bigint | NOT NULL, FK → networks(id) | References networks table |
| location_id | bigint | NOT NULL, FK → locations(id) | References locations table |
| signal_strength | integer | | Signal level in dBm |
| observed_at | timestamptz | NOT NULL | Observation timestamp |
| frequency_at_time | integer | | Frequency when observed |
| capabilities_at_time | text | | Security capabilities when observed |
| created_at | timestamptz | DEFAULT NOW() | Record creation time |

**Foreign Keys**:
- `network_observations_network_id_fkey`: network_id → networks(id) ON DELETE CASCADE
- `network_observations_location_id_fkey`: location_id → locations(id) ON DELETE CASCADE

### app.routes (GPS Tracking Data)
Independent GPS tracking with visibility counts.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| _id | bigint | PRIMARY KEY | Identity column |
| run_id | integer | NOT NULL | Tracking session identifier |
| wifi_visible | integer | NOT NULL, DEFAULT 0 | WiFi networks visible count |
| cell_visible | integer | NOT NULL, DEFAULT 0 | Cellular networks visible count |
| bt_visible | integer | NOT NULL, DEFAULT 0 | Bluetooth devices visible count |
| lat | double precision | NOT NULL | GPS latitude |
| lon | double precision | NOT NULL | GPS longitude |
| altitude | double precision | NOT NULL | Elevation |
| accuracy | double precision | NOT NULL | GPS accuracy |
| time | bigint | NOT NULL | Unix timestamp |

### app.ieee_ouis (MAC Vendor Lookup)
IEEE OUI (Organizationally Unique Identifier) registry for MAC address vendor identification.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| assignment | text | PRIMARY KEY | OUI assignment identifier |
| organization_name | text | | Vendor/organization name |
| organization_address | text | | Vendor address |

---

## Relationships and Integrity

### Foreign Key Relationships
```
networks (1) ←→ (many) network_observations
locations (1) ←→ (many) network_observations
```

### Referential Integrity Benefits
- **Data consistency**: No orphaned observations
- **Cascade deletes**: Removing a network removes its observations
- **Query optimization**: Database can optimize JOINs
- **Data validation**: Invalid references prevented at database level

---

## Common Queries

### Networks with Observation Counts
```sql
SELECT 
    n.bssid,
    n.current_ssid,
    COUNT(o.id) as observation_count,
    n.first_seen_at,
    n.last_seen_at
FROM app.networks n
LEFT JOIN app.network_observations o ON n.id = o.network_id
GROUP BY n.id, n.bssid, n.current_ssid, n.first_seen_at, n.last_seen_at
ORDER BY observation_count DESC;
```

### Locations with Network Counts
```sql
SELECT 
    l.latitude,
    l.longitude,
    l.observed_at,
    COUNT(o.id) as networks_observed
FROM app.locations l
LEFT JOIN app.network_observations o ON l.id = o.location_id
GROUP BY l.id, l.latitude, l.longitude, l.observed_at
ORDER BY l.observed_at DESC;
```

### Spatial Proximity (Future PostGIS Enhancement)
```sql
-- Add PostGIS geometry columns for spatial queries
ALTER TABLE app.locations ADD COLUMN geom geometry(Point, 4326);
UPDATE app.locations SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
CREATE INDEX idx_locations_geom ON app.locations USING GIST (geom);

-- Find locations within radius
SELECT l.*, COUNT(o.id) as network_count
FROM app.locations l
LEFT JOIN app.network_observations o ON l.id = o.location_id
WHERE ST_DWithin(l.geom, ST_SetSRID(ST_MakePoint(-83.6969, 43.0234), 4326), 1000)
GROUP BY l.id;
```

---

## Migration History

### Phase 1: WiGLE → PostgreSQL (Completed)
- Original SQLite exports from WiGLE Android app
- Imported to flat PostgreSQL schema
- Custom ETL scripts in `scripts/migration/`

### Phase 2: Schema Normalization (Completed)
- Migrated from flat schema to normalized relational structure
- Added foreign key constraints for referential integrity
- Preserved all data through proper migration process
- Migration scripts in `database/migrations/`

### Current Status
- **Production-ready normalized schema**
- **Foreign key relationships enforced**
- **Data integrity maintained**
- **API layer needs updating** to use current schema
