# ShadowCheck Database Deployment Guide

This guide covers deploying the refactored ShadowCheck database schema on your Parrot OS system.

## Quick Start

### 1. Start the Database

```bash
# Start PostgreSQL with PostGIS
docker-compose up -d postgres

# Optional: Start pgAdmin for database management
docker-compose --profile admin up -d pgadmin
```

### 2. Deploy the Schema

```bash
# Deploy the complete refactored schema
./deploy.sh

# Or step by step:
./deploy.sh check    # Verify database connection
./deploy.sh backup   # Backup existing data
./deploy.sh verify   # Verify deployment
```

### 3. Verify Installation

```bash
# Connect to database
psql postgresql://shadowcheck:your_secure_password_here@localhost:5432/shadowcheck

# Test basic queries
SELECT COUNT(*) FROM app.wireless_access_points;
SELECT radio_technology, COUNT(*) FROM app.wireless_access_points GROUP BY radio_technology;
```

## Your Current Schema Implementation

Based on your existing files, you have:

### ✅ Completed Components

1. **`schema_refactored.sql`** - Complete 3NF normalized schema with:
   - Clear naming conventions (`signal_measurements` vs `network_observations`)
   - PostGIS spatial types for geographic data
   - Proper domains and constraints
   - Enumerated types for technology classification
   - Full referential integrity

2. **`migration.sql`** - Data migration preserving legacy tables:
   - Migrates from legacy WiGLE imports
   - Preserves all data (zero data loss)
   - Populates OUI manufacturers from IEEE data
   - Maps device types from provenance

3. **`analysis.md`** - Comprehensive current state analysis:
   - Identified naming ambiguity issues
   - Documented data redundancy problems
   - Mapped relationships between tables

4. **`indexes.sql`** - Performance optimization:
   - Spatial indexes for geographic queries
   - Temporal indexes for time-series analysis
   - Composite indexes for common query patterns

5. **`roles.sql`** - Security and access control
6. **`documentation.md`** - Schema documentation and usage examples

### 📊 Current Data Profile

Your analysis shows:
- **389,203** location measurements (legacy + normalized)
- **141,798** signal observations
- **126,904** deduplicated access points
- **99,954** OUI manufacturer records
- **20,267** route waypoints

## Schema Architecture

### Core Tables (Your Refactored Design)

```sql
app.wireless_access_points     -- Deduplicated radio devices
app.signal_measurements        -- Individual signal readings
app.position_measurements      -- GPS coordinates
app.oui_manufacturers         -- IEEE OUI registry
app.data_sources              -- Import provenance
app.user_devices              -- Personal device tracking
app.security_incidents        -- Stalking detection
app.location_visits           -- Clustered locations
app.tracking_routes           -- Movement paths
app.wigle_api_enrichments     -- External API data
```

### Key Design Features

1. **Technology Separation**: Clear radio_technology enum (WiFi 2.4/5/6 GHz, Bluetooth, Cellular)
2. **Spatial Intelligence**: PostGIS points, polygons, and generated geometry columns
3. **Temporal Precision**: Proper timestamp handling with time zones
4. **Data Quality**: Confidence scores and quality flags throughout
5. **Security Focus**: Stalking detection and privacy controls built-in

## Database Connection Options

### 1. Command Line (psql)
```bash
psql postgresql://shadowcheck:your_secure_password_here@localhost:5432/shadowcheck
```

### 2. pgAdmin Web Interface
- URL: http://localhost:8080
- Email: admin@shadowcheck.local
- Password: admin123

### 3. Application Connection String
```
postgresql://shadowcheck:your_secure_password_here@localhost:5432/shadowcheck
```

## Example Queries

### Basic Network Analysis
```sql
-- Count by technology type
SELECT radio_technology, COUNT(*) as count
FROM app.wireless_access_points
GROUP BY radio_technology
ORDER BY count DESC;

-- Recent signal measurements
SELECT
    ap.network_name,
    sm.signal_strength_dbm,
    sm.measurement_timestamp
FROM app.signal_measurements sm
JOIN app.wireless_access_points ap ON ap.access_point_id = sm.access_point_id
ORDER BY sm.measurement_timestamp DESC
LIMIT 10;
```

### Spatial Analysis
```sql
-- Networks within 1km of a point
SELECT
    ap.network_name,
    ap.mac_address,
    ST_Distance(ap.primary_location_point::geography,
                ST_Point(-122.4194, 37.7749)::geography) as distance_meters
FROM app.wireless_access_points ap
WHERE ST_DWithin(ap.primary_location_point::geography,
                  ST_Point(-122.4194, 37.7749)::geography,
                  1000)
ORDER BY distance_meters;
```

### Security Analysis
```sql
-- Check for potential stalking incidents
SELECT
    incident_type,
    threat_level,
    detection_confidence_score,
    first_incident_timestamp
FROM app.security_incidents
WHERE investigation_status = 'open'
ORDER BY threat_level DESC, detection_confidence_score DESC;
```

## Maintenance Tasks

### Regular Maintenance
```bash
# Backup database
pg_dump -h localhost -U shadowcheck shadowcheck > backup_$(date +%Y%m%d).sql

# Update table statistics
psql -d shadowcheck -c "ANALYZE;"

# Check index usage
psql -d shadowcheck -c "
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'app'
ORDER BY idx_scan DESC;"
```

### Performance Monitoring
```sql
-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'app'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor query performance
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE query LIKE '%app.%'
ORDER BY total_time DESC;
```

## Data Import Workflows

### 1. WiGLE Data Import
Your migration script handles this automatically for existing legacy data.

### 2. Kismet Integration
```sql
-- Example structure for Kismet import
INSERT INTO app.signal_measurements (
    access_point_id, signal_strength_dbm, measurement_timestamp,
    encryption_type, channel_number
) VALUES (...);
```

### 3. Manual Wardriving Data
Use the `data_sources` table to track manual collection sessions.

## Troubleshooting

### Common Issues

1. **Connection refused**
   ```bash
   docker-compose ps  # Check if postgres is running
   docker-compose logs postgres  # Check postgres logs
   ```

2. **PostGIS functions not found**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Permission denied**
   ```bash
   # Check roles.sql has been applied
   psql -d shadowcheck -c "\du"
   ```

### Performance Issues

1. **Slow spatial queries**
   ```sql
   -- Check if spatial indexes exist
   SELECT indexname FROM pg_indexes
   WHERE tablename LIKE '%position%' AND indexdef LIKE '%GIST%';
   ```

2. **Large table scans**
   ```sql
   -- Ensure temporal indexes exist
   EXPLAIN ANALYZE SELECT * FROM app.signal_measurements
   WHERE measurement_timestamp > NOW() - INTERVAL '1 day';
   ```

## Security Considerations

### Data Privacy
- Location data retention policies
- MAC address handling (your schema includes privacy flags)
- Personal device anonymization

### Access Control
Your `roles.sql` should implement:
- `shadowcheck_admin` - Full schema access
- `shadowcheck_user` - Read-only access
- `shadowcheck_analyzer` - Analytics access

### Audit Trail
The schema includes:
- Record creation timestamps
- Data source tracking
- Quality confidence scores

## Next Steps

1. **Test with real data** - Import a sample WiGLE dataset
2. **Implement analytics** - Populate the security_incidents table
3. **Performance tuning** - Add partitioning for large tables
4. **Monitoring setup** - Configure alerts for data quality issues
5. **API development** - Build REST endpoints for the normalized schema

Your refactored schema provides an excellent foundation for production SIGINT operations with proper normalization, spatial capabilities, and security features built-in.