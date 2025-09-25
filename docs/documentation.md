# ShadowCheck Database Documentation

## Overview

The ShadowCheck database is a fully normalized (3NF) PostgreSQL schema designed for SIGINT/wardriving geospatial intelligence. It processes wireless network observations, GPS tracking data, and security threat detection for surveillance and counter-surveillance operations.

## Architecture

### Design Principles

1. **Third Normal Form (3NF)**: Eliminates data redundancy and ensures referential integrity
2. **Clear Naming**: Self-documenting table and column names
3. **Spatial-First**: PostGIS integration for geographic analysis
4. **Time-Series Optimized**: Efficient storage and querying of temporal data
5. **Security-Aware**: Row-level security and threat detection capabilities

### Schema Organization

```
app/
├── Reference Tables      # Static lookup data
├── Core Entities        # Primary business objects
├── Measurements         # Time-series observations
├── Analytics           # Derived and aggregated data
├── Integration         # External API data
└── Legacy             # Preserved historical tables
```

## Table Reference

### Reference Tables

#### `oui_manufacturers`
**Purpose**: IEEE OUI registry for identifying device manufacturers from MAC addresses

| Column | Type | Description |
|--------|------|-------------|
| `manufacturer_id` | SERIAL | Primary key |
| `oui_prefix_hex` | CHAR(6) | First 6 hex digits of MAC (e.g., '001122') |
| `organization_name` | TEXT | Manufacturer name |
| `organization_address` | TEXT | Registered address |
| `registry_type` | TEXT | MA-L, MA-M, or MA-S |
| `is_active` | BOOLEAN | Currently valid assignment |

**Usage Example**:
```sql
-- Find manufacturer of a device
SELECT m.organization_name
FROM app.oui_manufacturers m
WHERE m.oui_prefix_hex = LEFT(REPLACE('00:11:22:33:44:55', ':', ''), 6);
```

#### `data_sources`
**Purpose**: Track data provenance and import metadata

| Column | Type | Description |
|--------|------|-------------|
| `data_source_id` | SERIAL | Primary key |
| `source_name` | TEXT | Human-readable source name |
| `source_type` | ENUM | wigle_import, manual_scan, etc. |
| `import_configuration` | JSONB | Import parameters and settings |
| `data_quality_score` | NUMERIC(3,2) | Confidence in data quality (0.0-1.0) |
| `total_records_imported` | BIGINT | Running count of imported records |

**Usage Example**:
```sql
-- Data quality report by source
SELECT source_name, data_quality_score, total_records_imported
FROM app.data_sources
ORDER BY data_quality_score DESC;
```

### Core Entities

#### `wireless_access_points`
**Purpose**: Deduplicated wireless devices (WiFi APs, Bluetooth devices, etc.)

| Column | Type | Description |
|--------|------|-------------|
| `access_point_id` | BIGSERIAL | Primary key |
| `mac_address` | TEXT | Full MAC address (BSSID) |
| `manufacturer_id` | INTEGER | FK to oui_manufacturers |
| `radio_technology` | ENUM | wifi_2_4_ghz, wifi_5_ghz, bluetooth_classic, etc. |
| `network_name` | TEXT | SSID for WiFi, device name for Bluetooth |
| `is_hidden_network` | BOOLEAN | Network broadcasts SSID |
| `is_mobile_device` | BOOLEAN | Detected as mobile/portable |
| `primary_location_point` | GEOMETRY | Best-estimate location |
| `coverage_area_polygon` | GEOMETRY | Estimated coverage area |
| `total_signal_readings` | INTEGER | Count of signal measurements |
| `first_observed_at` | TIMESTAMPTZ | First detection timestamp |
| `last_observed_at` | TIMESTAMPTZ | Most recent detection |

**Key Relationships**:
- One-to-many with `signal_measurements`
- One-to-many with `position_measurements`
- References `oui_manufacturers`

**Usage Examples**:
```sql
-- Find all WiFi access points in an area
SELECT ap.mac_address, ap.network_name, m.organization_name
FROM app.wireless_access_points ap
LEFT JOIN app.oui_manufacturers m ON ap.manufacturer_id = m.manufacturer_id
WHERE ap.radio_technology LIKE 'wifi_%'
  AND ST_DWithin(ap.primary_location_point, ST_MakePoint(-122.4194, 37.7749), 1000);

-- Detect potentially mobile devices
SELECT mac_address, network_name, unique_observation_locations
FROM app.wireless_access_points
WHERE is_mobile_device = true
  OR unique_observation_locations > 10
ORDER BY unique_observation_locations DESC;
```

#### `user_devices`
**Purpose**: Track personal devices for privacy protection and stalking detection

| Column | Type | Description |
|--------|------|-------------|
| `device_id` | SERIAL | Primary key |
| `device_name` | TEXT | User-assigned name |
| `device_type` | TEXT | smartphone, laptop, tablet, etc. |
| `mac_address_hash` | TEXT | Hashed MAC for privacy |
| `is_owned_by_user` | BOOLEAN | Belongs to current user |
| `privacy_enabled` | BOOLEAN | Enhanced privacy protections |

**Usage Example**:
```sql
-- List user's devices with recent activity
SELECT d.device_name, d.device_type, d.last_observed_at
FROM app.user_devices d
WHERE d.is_owned_by_user = true
ORDER BY d.last_observed_at DESC;
```

### Measurement Tables

#### `signal_measurements`
**Purpose**: Individual signal strength readings and network properties

| Column | Type | Description |
|--------|------|-------------|
| `measurement_id` | BIGSERIAL | Primary key |
| `access_point_id` | BIGINT | FK to wireless_access_points |
| `data_source_id` | INTEGER | FK to data_sources |
| `signal_strength_dbm` | SMALLINT | Signal strength in dBm (-120 to 30) |
| `noise_floor_dbm` | SMALLINT | Background noise level |
| `signal_to_noise_ratio_db` | SMALLINT | SNR calculation |
| `encryption_type` | ENUM | none, wep, wpa, wpa2_psk, etc. |
| `channel_number` | SMALLINT | WiFi channel (1-14, 36-165) |
| `channel_width_mhz` | SMALLINT | 20, 40, 80, 160 MHz |
| `measurement_timestamp` | TIMESTAMPTZ | When measurement was taken |
| `data_confidence_score` | NUMERIC(3,2) | Measurement reliability (0.0-1.0) |

**Indexing Strategy**:
- Primary index on `(access_point_id, measurement_timestamp DESC)`
- Signal strength analysis: `(signal_strength_dbm, measurement_timestamp DESC)`
- Temporal queries: `(measurement_timestamp DESC)`

**Usage Examples**:
```sql
-- Signal strength over time for specific AP
SELECT measurement_timestamp, signal_strength_dbm, encryption_type
FROM app.signal_measurements
WHERE access_point_id = 12345
  AND measurement_timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY measurement_timestamp DESC;

-- Find open networks (security risk)
SELECT DISTINCT ap.mac_address, ap.network_name
FROM app.wireless_access_points ap
JOIN app.signal_measurements sm ON ap.access_point_id = sm.access_point_id
WHERE sm.encryption_type = 'none'
  AND sm.measurement_timestamp >= NOW() - INTERVAL '7 days';

-- Channel utilization analysis
SELECT channel_number, COUNT(*) as observation_count,
       AVG(signal_strength_dbm) as avg_signal_strength
FROM app.signal_measurements
WHERE channel_number IS NOT NULL
  AND measurement_timestamp >= NOW() - INTERVAL '1 day'
GROUP BY channel_number
ORDER BY observation_count DESC;
```

#### `position_measurements`
**Purpose**: GPS coordinates and geographic position data

| Column | Type | Description |
|--------|------|-------------|
| `position_id` | BIGSERIAL | Primary key |
| `access_point_id` | BIGINT | FK to wireless_access_points |
| `latitude_degrees` | NUMERIC(10,7) | Latitude (-90 to 90) |
| `longitude_degrees` | NUMERIC(11,7) | Longitude (-180 to 180) |
| `altitude_meters` | NUMERIC(8,2) | Elevation above sea level |
| `position_accuracy_meters` | NUMERIC(8,2) | GPS accuracy estimate |
| `position_point` | GEOMETRY | Auto-generated PostGIS point |
| `measurement_timestamp` | TIMESTAMPTZ | GPS fix timestamp |
| `position_source` | TEXT | gps, network, manual, estimated |
| `satellite_count` | SMALLINT | GPS satellites used |
| `hdop` | NUMERIC(4,2) | Horizontal Dilution of Precision |

**Spatial Indexing**:
- GIST index on `position_point` for spatial queries
- Composite index on `(latitude_degrees, longitude_degrees)`
- Temporal-spatial index on `(access_point_id, measurement_timestamp DESC)`

**Usage Examples**:
```sql
-- Find all measurements within 1km of a location
SELECT ap.mac_address, pm.measurement_timestamp, pm.position_accuracy_meters
FROM app.position_measurements pm
JOIN app.wireless_access_points ap ON pm.access_point_id = ap.access_point_id
WHERE ST_DWithin(pm.position_point, ST_MakePoint(-122.4194, 37.7749), 1000)
  AND pm.measurement_timestamp >= NOW() - INTERVAL '1 day'
ORDER BY pm.measurement_timestamp DESC;

-- Track movement of a specific device
SELECT measurement_timestamp, latitude_degrees, longitude_degrees,
       position_accuracy_meters, satellite_count
FROM app.position_measurements
WHERE access_point_id = 12345
  AND measurement_timestamp >= NOW() - INTERVAL '2 hours'
ORDER BY measurement_timestamp;

-- Find areas with high device density
SELECT ST_X(ST_Centroid(cluster)) as center_lon,
       ST_Y(ST_Centroid(cluster)) as center_lat,
       COUNT(*) as device_count
FROM (
    SELECT ST_ClusterKMeans(position_point, 10) OVER() as cluster_id,
           position_point as cluster
    FROM app.position_measurements
    WHERE measurement_timestamp >= NOW() - INTERVAL '1 day'
) clustered
GROUP BY cluster_id, cluster
HAVING COUNT(*) > 5
ORDER BY device_count DESC;
```

### Analytics Tables

#### `location_visits`
**Purpose**: Clustered location visits derived from position measurements

| Column | Type | Description |
|--------|------|-------------|
| `visit_id` | BIGSERIAL | Primary key |
| `user_device_id` | INTEGER | FK to user_devices |
| `visit_location_name` | TEXT | Human-readable location |
| `center_latitude_degrees` | NUMERIC(10,7) | Visit center point |
| `center_longitude_degrees` | NUMERIC(11,7) | Visit center point |
| `radius_meters` | NUMERIC(8,2) | Visit area radius |
| `arrival_timestamp` | TIMESTAMPTZ | Visit start time |
| `departure_timestamp` | TIMESTAMPTZ | Visit end time |
| `visit_duration_minutes` | NUMERIC(8,2) | Total visit time |
| `is_frequent_location` | BOOLEAN | Regularly visited place |
| `privacy_sensitivity` | TEXT | low, normal, high, sensitive |

**Usage Examples**:
```sql
-- Recent location visits for a user
SELECT visit_location_name, arrival_timestamp, departure_timestamp,
       visit_duration_minutes, privacy_sensitivity
FROM app.location_visits
WHERE user_device_id = 1
  AND arrival_timestamp >= NOW() - INTERVAL '7 days'
ORDER BY arrival_timestamp DESC;

-- Find overlapping visits (potential meetings)
SELECT v1.user_device_id as user1, v2.user_device_id as user2,
       v1.visit_location_name, v1.arrival_timestamp
FROM app.location_visits v1
JOIN app.location_visits v2 ON v1.visit_id < v2.visit_id
WHERE ST_DWithin(v1.visit_center_point, v2.visit_center_point, 100)
  AND v1.arrival_timestamp < v2.departure_timestamp
  AND v2.arrival_timestamp < v1.departure_timestamp;
```

#### `security_incidents`
**Purpose**: Automated detection of potential stalking and surveillance threats

| Column | Type | Description |
|--------|------|-------------|
| `incident_id` | BIGSERIAL | Primary key |
| `target_device_id` | INTEGER | FK to user_devices (victim) |
| `suspicious_access_point_id` | BIGINT | FK to wireless_access_points (stalker) |
| `incident_type` | TEXT | stalking, tracking, surveillance, anomaly |
| `threat_level` | ENUM | low, medium, high, critical |
| `investigation_status` | ENUM | open, investigating, resolved, false_positive |
| `correlation_coefficient` | NUMERIC(5,4) | Statistical correlation strength |
| `shared_location_count` | INTEGER | Number of co-locations detected |
| `first_incident_timestamp` | TIMESTAMPTZ | Pattern start time |
| `detection_confidence_score` | NUMERIC(3,2) | Algorithm confidence (0.0-1.0) |
| `analyst_notes` | TEXT | Investigation findings |

**Usage Examples**:
```sql
-- Open high-priority security incidents
SELECT si.incident_id, ud.device_name, ap.mac_address,
       si.threat_level, si.detection_confidence_score,
       si.first_incident_timestamp
FROM app.security_incidents si
JOIN app.user_devices ud ON si.target_device_id = ud.device_id
JOIN app.wireless_access_points ap ON si.suspicious_access_point_id = ap.access_point_id
WHERE si.investigation_status = 'open'
  AND si.threat_level IN ('high', 'critical')
ORDER BY si.threat_level DESC, si.first_incident_timestamp DESC;

-- Correlation analysis for potential stalking
SELECT target_device_id, suspicious_access_point_id,
       shared_location_count, correlation_coefficient,
       (last_incident_timestamp - first_incident_timestamp) as pattern_duration
FROM app.security_incidents
WHERE correlation_coefficient > 0.8
  AND shared_location_count >= 3
  AND investigation_status = 'open'
ORDER BY correlation_coefficient DESC;
```

### Integration Tables

#### `wigle_api_enrichments`
**Purpose**: External enrichment data from WiGLE API integration

| Column | Type | Description |
|--------|------|-------------|
| `enrichment_id` | BIGSERIAL | Primary key |
| `access_point_id` | BIGINT | FK to wireless_access_points |
| `wigle_netid` | TEXT | WiGLE network identifier |
| `wigle_trilat` | NUMERIC(10,7) | WiGLE triangulated latitude |
| `wigle_trilong` | NUMERIC(11,7) | WiGLE triangulated longitude |
| `wigle_country` | TEXT | Country from WiGLE |
| `wigle_region` | TEXT | State/region from WiGLE |
| `wigle_city` | TEXT | City from WiGLE |
| `match_confidence_score` | NUMERIC(3,2) | Matching confidence |

**Usage Example**:
```sql
-- Compare our data with WiGLE enrichment
SELECT ap.mac_address, ap.network_name,
       ST_Distance(ap.primary_location_point,
                  ST_MakePoint(we.wigle_trilong, we.wigle_trilat)) as distance_meters,
       we.wigle_country, we.wigle_city
FROM app.wireless_access_points ap
JOIN app.wigle_api_enrichments we ON ap.access_point_id = we.access_point_id
WHERE we.match_confidence_score > 0.7
ORDER BY distance_meters;
```

## Common Query Patterns

### Real-Time Monitoring

```sql
-- Recent signal activity (last 15 minutes)
SELECT ap.mac_address, ap.network_name, sm.signal_strength_dbm,
       sm.measurement_timestamp, ds.source_name
FROM app.signal_measurements sm
JOIN app.wireless_access_points ap ON sm.access_point_id = ap.access_point_id
JOIN app.data_sources ds ON sm.data_source_id = ds.data_source_id
WHERE sm.measurement_timestamp >= NOW() - INTERVAL '15 minutes'
ORDER BY sm.measurement_timestamp DESC
LIMIT 100;
```

### Geographic Analysis

```sql
-- Device density heatmap for specific area
SELECT ST_X(position_point) as longitude,
       ST_Y(position_point) as latitude,
       COUNT(*) as device_count
FROM app.position_measurements pm
JOIN app.wireless_access_points ap ON pm.access_point_id = ap.access_point_id
WHERE ST_Within(pm.position_point,
                ST_MakeEnvelope(-122.5, 37.7, -122.3, 37.8, 4326))
  AND pm.measurement_timestamp >= NOW() - INTERVAL '1 day'
  AND ap.radio_technology LIKE 'wifi_%'
GROUP BY ST_SnapToGrid(position_point, 0.001)
HAVING COUNT(*) >= 3
ORDER BY device_count DESC;
```

### Security Analysis

```sql
-- Potential surveillance detection
WITH device_colocations AS (
    SELECT pm1.access_point_id as target_ap,
           pm2.access_point_id as suspicious_ap,
           COUNT(*) as colocation_count,
           MIN(pm1.measurement_timestamp) as first_seen_together,
           MAX(pm1.measurement_timestamp) as last_seen_together
    FROM app.position_measurements pm1
    JOIN app.position_measurements pm2 ON
        ST_DWithin(pm1.position_point, pm2.position_point, 50)
        AND ABS(EXTRACT(EPOCH FROM pm1.measurement_timestamp - pm2.measurement_timestamp)) < 300
        AND pm1.access_point_id != pm2.access_point_id
    WHERE pm1.measurement_timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY pm1.access_point_id, pm2.access_point_id
    HAVING COUNT(*) >= 5
)
SELECT ap1.mac_address as target_device,
       ap2.mac_address as suspicious_device,
       dc.colocation_count,
       dc.first_seen_together,
       dc.last_seen_together,
       (dc.last_seen_together - dc.first_seen_together) as tracking_duration
FROM device_colocations dc
JOIN app.wireless_access_points ap1 ON dc.target_ap = ap1.access_point_id
JOIN app.wireless_access_points ap2 ON dc.suspicious_ap = ap2.access_point_id
WHERE ap1.is_mobile_device = true
  AND ap2.is_mobile_device = true
ORDER BY dc.colocation_count DESC;
```

### Performance Optimization

```sql
-- Most active access points (for indexing priorities)
SELECT ap.mac_address, ap.network_name,
       COUNT(sm.measurement_id) as signal_count,
       COUNT(pm.position_id) as position_count,
       MAX(sm.measurement_timestamp) as last_signal,
       MAX(pm.measurement_timestamp) as last_position
FROM app.wireless_access_points ap
LEFT JOIN app.signal_measurements sm ON ap.access_point_id = sm.access_point_id
LEFT JOIN app.position_measurements pm ON ap.access_point_id = pm.access_point_id
WHERE ap.last_observed_at >= NOW() - INTERVAL '7 days'
GROUP BY ap.access_point_id, ap.mac_address, ap.network_name
ORDER BY (COUNT(sm.measurement_id) + COUNT(pm.position_id)) DESC
LIMIT 20;
```

## Data Maintenance

### Cleanup Procedures

```sql
-- Remove old low-confidence measurements (monthly cleanup)
DELETE FROM app.signal_measurements
WHERE measurement_timestamp < NOW() - INTERVAL '6 months'
  AND data_confidence_score < 0.3;

-- Archive resolved security incidents (yearly)
INSERT INTO app.security_incidents_archive
SELECT * FROM app.security_incidents
WHERE investigation_status = 'resolved'
  AND record_updated_at < NOW() - INTERVAL '1 year';
```

### Statistics Updates

```sql
-- Update access point statistics (daily)
UPDATE app.wireless_access_points SET
    total_signal_readings = (
        SELECT COUNT(*) FROM app.signal_measurements
        WHERE access_point_id = wireless_access_points.access_point_id
    ),
    last_observed_at = (
        SELECT MAX(measurement_timestamp) FROM app.signal_measurements
        WHERE access_point_id = wireless_access_points.access_point_id
    ),
    record_updated_at = NOW()
WHERE last_observed_at >= NOW() - INTERVAL '7 days';
```

## Security Considerations

### Data Privacy

1. **MAC Address Hashing**: User devices store hashed MAC addresses
2. **Location Anonymization**: Configurable privacy zones
3. **Row-Level Security**: Users only see their own sensitive data
4. **Data Retention**: Automatic purging of old personal data

### Access Control

1. **Role-Based Access**: Admin, analyst, user, readonly, api roles
2. **Column-Level Security**: Restricted access to sensitive fields
3. **Connection Limits**: Prevent resource exhaustion
4. **Query Timeouts**: Prevent runaway operations

### Audit Trail

1. **Change Tracking**: All modifications logged
2. **Connection Monitoring**: Track database access
3. **Query Logging**: Log sensitive operations
4. **Alert System**: Notify on suspicious activity

## Troubleshooting

### Common Issues

1. **Slow Spatial Queries**: Ensure GIST indexes are present and ANALYZE is current
2. **Missing Manufacturers**: Populate oui_manufacturers from ieee_ouis table
3. **Duplicate Access Points**: Check MAC address normalization and deduplication logic
4. **Memory Issues**: Adjust work_mem settings for large aggregations

### Performance Monitoring

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'app'
ORDER BY idx_scan DESC;

-- Monitor table sizes
SELECT tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'app'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Migration Guide

When upgrading from the legacy schema:

1. **Backup First**: Always create complete backup before migration
2. **Run Migration Script**: Execute migration.sql in transaction
3. **Verify Data Integrity**: Check row counts and relationships
4. **Update Applications**: Modify queries for new table names
5. **Performance Tuning**: Run ANALYZE and monitor query plans
6. **Security Review**: Implement new role-based access controls

This documentation provides the foundation for operating and maintaining the ShadowCheck database in production environments.