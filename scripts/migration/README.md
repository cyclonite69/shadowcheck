# WiGLE → PostgreSQL Migration Scripts

Complete workflow for importing WiGLE Android app exports into PostgreSQL with PostGIS for spatial analysis.

## Overview

These scripts convert WiGLE WiFi wardriving data from SQLite format into a normalized PostgreSQL schema optimized for SIGINT forensics and spatial analysis.

**Migration Flow:**
1. **Setup** → PostgreSQL + PostGIS + schemas
2. **Export** → Extract SQLite from WiGLE Android app  
3. **Import** → SQLite → PostgreSQL with schema mapping
4. **Unify** → Merge multiple exports into unified tables
5. **Enhance** → Create enriched views with security classification

## Quick Start

```bash
# 1. Setup PostgreSQL (creates sigint database)
./01-setup-postgresql.sh

# 2. Export from WiGLE (see 02-export-from-wigle.md)

# 3. Import SQLite files  
./03-import-sqlite.sh device1_export.sqlite
./03-import-sqlite.sh device2_export.sqlite

# 4. Build unified schema
./04-build-unified-schema.sh

# 5. Create enhanced views
./05-create-enhanced-views.sh
```

## Scripts Reference

### 01-setup-postgresql.sh
- Creates PostgreSQL database with PostGIS extension
- Sets up schemas: `raw`, `app`, `enrich`  
- Creates admin and read-only roles
- Configures authentication

**Usage:** `./01-setup-postgresql.sh [db_name] [admin_role] [readonly_role]`

### 02-export-from-wigle.md
- Comprehensive guide for extracting data from WiGLE Android app
- Covers app export features, ADB backup, and root methods
- Privacy considerations and data sanitization tips
- Troubleshooting common export issues

### 03-import-sqlite.sh  
- Imports WiGLE SQLite export into device-specific schema
- Two-phase import: minimal changes, then compatibility fixes
- Preserves original data structure and relationships
- Handles multiple exports (different devices/time periods)

**Usage:** `./03-import-sqlite.sh wigle_export.sqlite [database] [schema_name]`

### 04-build-unified-schema.sh
- Merges all device schemas into unified `app` tables
- Creates `observation_history` (all raw observations)  
- Creates `network_unified_raw` (deduplicated networks)
- Builds PostGIS spatial views
- Tracks provenance and data lineage

### 05-create-enhanced-views.sh
- Creates `location_details_asof` with enriched metadata
- WiFi security classification (WPA2-P, WPA3-E, Open, etc.)
- Radio type detection (WiFi, Cell/LTE, LoRa, Zigbee)
- Spatial analysis functions

## Database Schema

### Core Tables (app schema)
- `observation_history` - All raw observations from imports
- `network_unified_raw` - Deduplicated network summary  
- `load_runs` - Migration metadata and statistics

### Enhanced Views
- `location_details_asof` - Enriched observations with security parsing
- `network_summary_v` - Database statistics
- `observation_geo_v` - Spatial observation view
- `network_unified_geo_v` - Spatial network view

## Data Flow

```
WiGLE SQLite Export(s)
        ↓
Device Schema(s) (s22, g63, j24, etc.)
        ↓  
Unified App Schema (observation_history, network_unified_raw)
        ↓
Enhanced Views (location_details_asof with security classification)
```

## Security Classifications

The enhanced views automatically classify WiFi security:
- **WPA3-P/WPA3-E** - WPA3 Personal/Enterprise
- **WPA2-P/WPA2-E** - WPA2 Personal/Enterprise  
- **WPA-P** - WPA Personal
- **OWE** - Opportunistic Wireless Encryption
- **WEP** - Wired Equivalent Privacy
- **Open** - No security
- **Unknown** - Unrecognized capabilities

## Radio Type Detection

Supports multiple radio technologies:
- **WiFi** - 2.4GHz, 5GHz, 6GHz bands
- **Cell/LTE, Cell/NR** - Cellular networks
- **LoRa** - Long Range low-power networks
- **Zigbee/802.15.4** - IoT mesh networks
- **GNSS** - GPS and satellite navigation
- **Other** - Unclassified signals

## Spatial Features

PostGIS integration enables:
- Geographic distance calculations
- Radius-based network searches  
- Coordinate validation and transformation
- GeoJSON export for mapping applications

**Example spatial query:**
```sql
SELECT * FROM app.networks_within_radius(43.0234, -83.6969, 1000);
```

## Migration Examples

### Single Device Import
```bash
# Setup database
./01-setup-postgresql.sh sigint

# Import one WiGLE export
./03-import-sqlite.sh my_wigle_export.sqlite

# Build unified schema
./04-build-unified-schema.sh

# Create enhanced views
./05-create-enhanced-views.sh

# Verify results
psql -d sigint -c "SELECT * FROM app.network_summary_v;"
```

### Multi-Device Import
```bash
# Import multiple exports
./03-import-sqlite.sh phone1_2024.sqlite sigint phone1
./03-import-sqlite.sh phone2_2024.sqlite sigint phone2
./03-import-sqlite.sh tablet_2024.sqlite sigint tablet

# Unify all imports
./04-build-unified-schema.sh sigint

# Check source tracking
psql -d sigint -c "SELECT source, count(*) FROM app.observation_history GROUP BY source;"
```

## Requirements

- PostgreSQL 14+ with PostGIS extension
- SQLite3 command line tool
- WiGLE Android app export files
- Bash shell environment

## Troubleshooting

### Common Issues

**"Permission denied" errors:**
- Ensure scripts are executable: `chmod +x *.sh`
- Check PostgreSQL authentication in ~/.pgpass

**Schema import failures:**
- Review import logs in `import_*.log` files
- Phase 2 compatibility mode handles most SQLite→PostgreSQL issues
- Check SQLite file integrity with `sqlite3 file.sqlite ".tables"`

**Missing PostGIS functions:**
- Verify PostGIS installation: `psql -c "SELECT postgis_version();"`
- Ensure PostGIS extension is created in target database

**Empty unified tables:**
- Check device schemas exist: `psql -c "\dn"`
- Verify device schemas have network/location tables
- Review build logs for insertion errors

### Performance Optimization

For large datasets (>1GB SQLite files):
```bash
# Increase work_mem for imports
psql -c "SET work_mem = '256MB';"

# Use BRIN indexes for time-series data
psql -c "CREATE INDEX CONCURRENTLY idx_time_brin ON app.observation_history USING BRIN (time_ms);"

# Analyze tables after large imports
psql -c "ANALYZE app.observation_history; ANALYZE app.network_unified_raw;"
```

## Related Documentation

- **[Main Project README](../../README.md)** - ShadowCheck platform overview and setup
- **[Database Schema Reference](../../docs/SCHEMA.md)** - Complete table structures and relationships  
- **[API Documentation](../../README.md#api-endpoints)** - REST endpoints for accessing migrated data

## Schema Cross-Reference

The migration scripts create the exact schema documented in `docs/SCHEMA.md`:

| Migration Table | Schema Documentation | Purpose |
|----------------|---------------------|---------|
| `observation_history` | `app.observation_history` | All raw WiFi/network observations |
| `network_unified_raw` | `app.network_unified_raw` | Deduplicated network summaries |
| `location_details_asof` | `app.location_details_asof` | Enhanced view with security classification |

## Notes

- Import scripts handle multiple WiGLE exports automatically
- Original SQLite data is preserved in device-specific schemas
- All timestamps converted from epoch milliseconds to PostgreSQL timestamptz
- Coordinates validated and transformed to EPSG:4326 (WGS84)
- Security classification supports modern WiFi standards (WPA3, OWE)
- Generated schema files are saved in `schemas/` directory for reference
- Migration logs provide detailed import tracking and error diagnosis

## Advanced Usage

### Custom Database Configuration
```bash
# Use custom database and roles
./01-setup-postgresql.sh my_sigint custom_admin custom_readonly

# Import to custom database
./03-import-sqlite.sh export.sqlite my_sigint device1
./04-build-unified-schema.sh my_sigint
./05-create-enhanced-views.sh my_sigint
```

### Batch Processing
```bash
# Process multiple exports in batch
for sqlite_file in exports/*.sqlite; do
  schema_name=$(basename "$sqlite_file" .sqlite)
  ./03-import-sqlite.sh "$sqlite_file" sigint "$schema_name"
done

# Build unified schema from all imports
./04-build-unified-schema.sh sigint
```

### Export Verification
```bash
# Verify WiGLE export before import
sqlite3 export.sqlite "
SELECT 
  'Tables:' as info, 
  group_concat(name) as value 
FROM sqlite_master 
WHERE type='table'
UNION ALL
SELECT 
  'Network rows:', 
  count(*) 
FROM network
UNION ALL
SELECT 
  'Location rows:', 
  count(*) 
FROM location;"
```
