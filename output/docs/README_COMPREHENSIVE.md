# ShadowCheck Database Refactor

A production-ready, fully normalized PostgreSQL database schema for SIGINT/wardriving operations with advanced spatial analysis capabilities.

## 🔴 Critical Data Integrity Rules

**NEVER MUTATE SOURCE DATA**
- BSSID/MAC addresses: Store EXACTLY as received - NO hashing, NO normalization
- Timestamps: Preserve original precision (milliseconds from WiGLE, microseconds from Kismet)
- Coordinates: Store ALL decimal places (9 decimal precision) - NO rounding
- Signal strength: Store exact dBm values - NO approximation

## Architecture Overview

### Three-Pipeline Data Architecture

1. **WiGLE Android App Backup** (Highest Trust)
   - SQLite database export from WiGLE app
   - Millisecond timestamp precision
   - Direct device observations

2. **WiGLE Web API** (Moderate Trust)
   - JSON responses from WiGLE API
   - Complete 43+ field mapping
   - Triangulated positions marked as DERIVED

3. **Kismet Integration** (High Precision)
   - Microsecond timestamp precision
   - Raw packet capture capability
   - Advanced device fingerprinting

### Key Features

- **Temporal Network Tracking**: SSID changes, BSSID walking detection
- **Chain of Custody**: Forensic-grade audit trails
- **Deduplication**: Cross-pipeline fuzzy matching with fingerprinting
- **Spatial Analysis**: PostGIS clustering, coverage areas, route reconstruction
- **Stalking Detection**: Automated colocation pattern analysis
- **Performance Optimized**: BRIN indexes, partitioning, materialized views

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Parrot OS or Linux environment
- 4GB+ RAM recommended for spatial queries

### Deployment

```bash
# Clone or extract to /home/shadowcheck/
cd /home/shadowcheck

# Deploy the complete database schema
./deploy.sh
```

The deployment script will:
1. Setup Docker networks and volumes
2. Start PostgreSQL 17 with PostGIS 3.5
3. Deploy all 11 schema phases
4. Load sample OUI manufacturer data
5. Verify spatial capabilities
6. Generate deployment summary

### Verify Installation

```bash
# Connect to database
docker-compose exec postgres psql -U shadowcheck -d shadowcheck

# Test spatial query
SELECT ST_AsText(ST_Point(-122.4194, 37.7749));

# View available tables
\dt app.*

# Check API views
SELECT COUNT(*) FROM app.api_networks;
```

## Database Schema

### Core Tables

- `app.wireless_access_points` - Network identities (MAC preservation)
- `app.signal_measurements` - Individual signal readings (exact dBm)
- `app.position_measurements` - GPS observations (9 decimal precision)
- `app.network_identity_history` - Temporal SSID tracking
- `app.data_sources` - Pipeline identification and priorities

### Advanced Features

- `app.observation_fingerprints` - Cross-pipeline deduplication
- `app.network_change_events` - BSSID walking and MAC spoofing detection
- `app.wigle_api_enrichments` - Complete WiGLE field mapping
- `app.mv_network_coverage` - PostGIS coverage area analysis
- `app.mv_colocation_patterns` - Stalking detection via spatial correlation

## Data Import

### Import WiGLE App Backup

```sql
SELECT app.run_import_pipeline(
    'WiGLE App Import 2024-01-15',
    'wigle_app_backup',
    '/path/to/wigle_backup.sqlite'
);
```

### Import WiGLE API Response

```sql
SELECT app.run_import_pipeline(
    'WiGLE API Query Results',
    'wigle_api',
    '{"results": [{"netid": "00:11:22:33:44:55", ...}]}'::jsonb
);
```

### Import Kismet Data

```sql
SELECT app.run_import_pipeline(
    'Kismet Capture Session',
    'kismet',
    '/path/to/kismet.kismet',
    '{"include_packets": true, "include_raw_frames": false}'::jsonb
);
```

## API Usage

### Search Networks by Location

```sql
SELECT * FROM app.api_search_networks_by_location(
    37.7749,    -- latitude
    -122.4194,  -- longitude
    1000        -- radius in meters
);
```

### Search Networks by Name

```sql
SELECT * FROM app.api_search_networks_by_name('Starbucks');
```

### Get Network Timeline

```sql
SELECT * FROM app.api_network_timeline(
    12345,                          -- access_point_id
    '2024-01-01'::timestamptz,     -- start_date
    '2024-01-31'::timestamptz      -- end_date
);
```

### Database Statistics

```sql
SELECT app.api_database_stats();
```

## Spatial Analysis Examples

### Find Colocation Patterns (Stalking Detection)

```sql
SELECT
    device_1_mac,
    device_2_mac,
    stalking_risk_score,
    risk_classification,
    colocation_count
FROM app.mv_colocation_patterns
WHERE stalking_risk_score > 0.7
ORDER BY stalking_risk_score DESC;
```

### Analyze Network Coverage

```sql
SELECT
    mac_address,
    current_network_name,
    coverage_area_concave_sqm,
    coverage_quality_score
FROM app.mv_network_coverage
WHERE coverage_quality_score > 0.8;
```

### Route Analysis

```sql
SELECT
    route_date,
    movement_type,
    total_distance_meters,
    duration_hours,
    route_efficiency
FROM app.mv_movement_routes
WHERE movement_type = 'highway'
ORDER BY total_distance_meters DESC;
```

## Security Analysis

### Detect BSSID Walking

```sql
SELECT * FROM app.detect_bssid_walking();
```

### Detect MAC Spoofing

```sql
SELECT * FROM app.detect_mac_spoofing(12345);  -- access_point_id
```

### Review Change Events

```sql
SELECT
    event_type,
    detection_method,
    spatial_distance_meters,
    behavioral_anomaly_score
FROM app.network_change_events
WHERE verification_status = 'pending'
ORDER BY detection_timestamp DESC;
```

## Performance Optimization

### Refresh Materialized Views

```sql
SELECT app.refresh_materialized_views(true);  -- force refresh
```

### Database Maintenance

```sql
SELECT app.perform_maintenance();
```

### Performance Monitoring

```sql
-- Check index usage
SELECT * FROM app.vw_index_usage WHERE usage_category = 'Never used';

-- Check table sizes
SELECT * FROM app.vw_table_sizes ORDER BY total_size DESC;

-- Performance alerts
SELECT * FROM app.check_performance_alerts();
```

## Chain of Custody

### Log Data Collection

```sql
INSERT INTO app.data_custody_log (
    who_collected, when_collected, what_collected, why_collected,
    data_source_id, original_filename, file_hash_sha256
) VALUES (
    'analyst_1', NOW(), 'WiGLE wardriving session', 'Investigation #2024-001',
    1, 'wigle_20240115.sqlite', 'sha256_hash_here'
);
```

### Add Custody Transfer

```sql
SELECT app.add_custody_transfer(
    1,                    -- custody_id
    'analyst_1',         -- from
    'supervisor_1',      -- to
    'Review and analysis',  -- reason
    true                 -- hash_verified
);
```

### Verify Data Integrity

```sql
SELECT app.verify_data_integrity(1, 'current_file_hash');
```

## Configuration

### Connection Settings

- **Host**: localhost
- **Port**: 5432
- **Database**: shadowcheck
- **Username**: shadowcheck
- **Schema**: app

### Recommended PostgreSQL Settings

```
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 256MB
maintenance_work_mem = 1GB
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 16
```

## File Structure

```
/home/shadowcheck/
├── docker-compose.yml           # PostgreSQL + PostGIS container
├── deploy.sh                   # Automated deployment script
├── README.md                   # This file
├── schema/                     # Database schema files
│   ├── 01_extensions_and_schema.sql
│   ├── 02_reference_tables.sql
│   ├── 03_core_tables.sql
│   ├── 04_temporal_tracking.sql
│   ├── 05_audit_custody.sql
│   ├── 06_deduplication.sql
│   ├── 07_wigle_enrichment.sql
│   ├── 08_spatial_analysis.sql
│   ├── 09_import_pipelines.sql
│   ├── 10_performance_optimization.sql
│   └── 11_api_design.sql
├── backups/                    # Database backups
└── logs/                       # Application logs
```

## Data Pipeline Priorities

1. **WiGLE App Backup** (Priority 1) - Highest trust, exact precision
2. **WiGLE API** (Priority 2) - Moderate trust, potential rounding
3. **Kismet** (Priority 3) - High precision, microsecond timestamps

The deduplication framework automatically handles conflicts using these priorities.

## Troubleshooting

### Database Connection Issues

```bash
# Check container status
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Performance Issues

```bash
# Check performance alerts
docker-compose exec postgres psql -U shadowcheck -d shadowcheck -c "SELECT * FROM app.check_performance_alerts();"

# Run maintenance
docker-compose exec postgres psql -U shadowcheck -d shadowcheck -c "SELECT app.perform_maintenance();"
```

### Data Import Errors

```bash
# Check import job status
docker-compose exec postgres psql -U shadowcheck -d shadowcheck -c "SELECT * FROM app.import_jobs ORDER BY created_at DESC LIMIT 10;"
```

## Support

This database schema implements the complete ShadowCheck refactor specification with:

- ✅ Zero data loss (preserves ALL source precision)
- ✅ BSSID integrity (NEVER mutated, NEVER hashed)
- ✅ Temporal accuracy (microsecond precision)
- ✅ Spatial precision (9 decimal places)
- ✅ Change detection (automated BSSID walking, MAC spoofing)
- ✅ Audit compliance (forensic-grade chain of custody)
- ✅ Query performance (<100ms spatial, <1s temporal)
- ✅ Pipeline clarity (data source tracking with quality scores)

**永久保存 - Preserve forever. Never retire legacy data.**