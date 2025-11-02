# ShadowCheck Data Pipeline System

## Overview
This directory contains all data ingestion and enrichment pipelines for the ShadowCheck SIGINT forensics platform.

## Architecture Principle
**Source data remains immutable** - all imports go to dedicated source tables.
The federated view system combines data automatically.

If mistakes are made, just truncate the affected table and re-import.
The production data volume (`shadowcheck-prod_postgres_data`) is SACRED and should never be modified directly.

## Directory Structure

```
server/pipelines/
├── README.md              # This file
├── parsers/               # File format parsers
│   ├── __init__.py
│   ├── kml_parser.py      # KML wardriving data
│   ├── wigle_sqlite.py    # WiGLE SQLite exports
│   └── kismet.py          # Kismet capture files
├── enrichment/            # Data enhancement
│   ├── __init__.py
│   └── wigle_api.py       # WiGLE API lookups
├── shared/                # Common utilities
│   ├── __init__.py
│   └── safe_ingest.py     # Safe batch insertion
└── scripts/               # One-off utilities
    ├── kml_to_sql.py      # KML conversion tool
    └── bt_channel_tool.py # Bluetooth channel analyzer
```

## Available Pipelines

### 1. KML Import Pipeline
**Source**: GPS-tagged WiFi observations from wardriving (Google Earth format)
**Files**: `parsers/kml_parser.py`
**Destination**: `app.locations_legacy` table
**Status**: ✅ Working - Successfully reduced orphaned networks
**Data Location**: `../../pipelines/kml/*.kml` (96 files, ~60MB total)

**Purpose**: Import WiFi network observations with GPS coordinates from KML exports. This is typically data collected via wardriving apps that export to Google Earth format.

**Usage**:
```bash
# Import single KML file
python server/pipelines/parsers/kml_parser.py --input pipelines/kml/20241020-02630.kml

# Check import results
psql -U shadowcheck_user -d shadowcheck -c "SELECT COUNT(*) FROM app.locations_legacy;"
```

**Database Impact**:
- Inserts into `app.locations_legacy`
- Automatically updates federated views
- Reduces orphaned networks (GPS coordinates now available)

---

### 2. WiGLE SQLite Import
**Source**: Backup databases from WiGLE mobile app
**Files**: `parsers/wigle_sqlite_parser.py`
**Destination**: `app.wigle_network`, `app.wigle_location`, `app.wigle_route` tables
**Status**: ⚠️ Needs testing with current reorganization
**Data Location**: `../../pipelines/wigle/*.sqlite` (50MB backup database)

**Purpose**: Import historical wardriving data from WiGLE app SQLite backups. Contains networks, GPS points, and drive routes.

**Usage**:
```bash
# Import WiGLE SQLite backup
python server/pipelines/parsers/wigle_sqlite_parser.py --input pipelines/wigle/backup-1761824754281.sqlite

# Verify import
psql -U shadowcheck_user -d shadowcheck -c "
  SELECT COUNT(*) as networks FROM app.wigle_network;
  SELECT COUNT(*) as locations FROM app.wigle_location;
"
```

**Database Schema**:
```sql
-- Networks table
app.wigle_network (
  bssid TEXT,
  ssid TEXT,
  frequency INTEGER,
  capabilities TEXT,
  -- ... more fields
)

-- Locations table
app.wigle_location (
  bssid TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  altitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  time_ms BIGINT
)
```

---

### 3. WiGLE API Enrichment
**Source**: WiGLE REST API individual BSSID lookups
**Files**: `enrichment/wigle_api.py`
**Destination**: `app.wigle_network_detail` table
**Status**: ⚠️ Needs UI integration for "like magic" workflow
**API Cache**: `../../pipelines/wigle_api/*.json` (100+ cached responses)

**Purpose**: Enrich individual BSSIDs with detailed metadata from WiGLE's database:
- Complete SSID (for hidden networks)
- First/last seen dates
- Trilateration coordinates
- Encryption details
- WiGLE confidence scores

**Usage**:
```bash
# Single BSSID enrichment
python server/pipelines/enrichment/wigle_api.py --bssid "AA:BB:CC:DD:EE:FF"

# Batch enrichment from file
python server/pipelines/enrichment/wigle_api.py --batch orphaned_networks.csv

# Check enrichment results
psql -U shadowcheck_user -d shadowcheck -c "
  SELECT bssid, ssid, lastupdt, qos
  FROM app.wigle_network_detail
  WHERE bssid = 'AA:BB:CC:DD:EE:FF';
"
```

**API Rate Limits**:
- WiGLE API has rate limits
- Responses are cached in `pipelines/wigle_api/response_*.json`
- Script checks cache before hitting API

**Enrichment Fields**:
- `trilat`, `trilong` - Trilateration GPS (higher precision)
- `ssid` - Network name (fills in hidden networks)
- `qos` - Quality of service / signal quality
- `transid` - WiGLE transaction ID
- `firsttime`, `lasttime`, `lastupdt` - Time-series data
- `encryption` - Detailed security analysis

---

### 4. Kismet Import (Planned)
**Source**: Kismet JSON/SQLite capture outputs
**Files**: `parsers/kismet_parser.py`
**Status**: 🚧 Stub implementation only - not yet functional

**Purpose**: Import Kismet wireless capture data including devices, networks, and packet metadata.

**Future Usage**:
```bash
# Planned - not yet implemented
python server/pipelines/parsers/kismet_parser.py --input capture.kismet
```

---

## Database Architecture

### Source Tables (Immutable After Import)
These tables store raw data from each source. **Never UPDATE these** - only INSERT or TRUNCATE.

| Table | Source | Purpose |
|-------|--------|---------|
| `app.locations_legacy` | KML Parser | GPS-tagged network observations |
| `app.wigle_network` | WiGLE SQLite | Networks from WiGLE app |
| `app.wigle_location` | WiGLE SQLite | GPS coordinates from WiGLE |
| `app.wigle_route` | WiGLE SQLite | Drive routes from WiGLE |
| `app.wigle_network_detail` | WiGLE API | Enriched network metadata |
| `app.kismet_networks` | Kismet | Planned - Kismet networks |
| `app.kismet_devices` | Kismet | Planned - Detected devices |

### Federated Views (Auto-Updated)
These views automatically combine data from all sources. **Read-only** - they update automatically when source tables change.

| View | Purpose |
|------|---------|
| `app.federated_networks` | All networks from all sources (unified) |
| `app.federated_observations` | All observations with source metadata |
| `app.network_source_comparison` | Cross-source analysis (same network in multiple sources) |

**Query Examples**:
```sql
-- Get all networks from all sources
SELECT * FROM app.federated_networks LIMIT 100;

-- Find networks seen in multiple sources
SELECT * FROM app.network_source_comparison WHERE source_count > 1;

-- Get observations with source attribution
SELECT bssid, ssid, source_name, observed_at
FROM app.federated_observations
WHERE bssid = 'AA:BB:CC:DD:EE:FF'
ORDER BY observed_at DESC;
```

### Quality Tracking Tables

| Table | Purpose |
|-------|---------|
| `app.orphaned_networks` | Networks missing GPS coordinates |
| `app.data_source_registry` | Metadata about each data source |

**Orphaned Networks**:
```sql
-- Check how many networks lack GPS coordinates
SELECT COUNT(*) FROM app.orphaned_networks;

-- These can be enriched via WiGLE API to get trilateration coordinates
```

---

## Data Federation System

The federation system provides multiple merge strategies:

### Merge Modes
1. **Unified** - All observations from all sources (may include duplicates)
2. **Deduplicated** - Exact deduplication (same BSSID/time/location)
3. **Deduplicated Fuzzy** - ±5min temporal, ~100m spatial tolerance (handles WiGLE batch processing)
4. **Smart Merged** - Best field value from each source (choose highest quality)
5. **Precision Merged** - Highest GPS accuracy + strongest signal
6. **Hybrid** - All strategies in tandem (precision GPS + smart metadata + unified timeline)

**API Endpoint**: `/api/v1/federated/observations?mode=hybrid`

---

## Testing Workflow

### Clear Test Data
**⚠️ WARNING**: This truncates tables. Only use on test databases, NEVER production.

```sql
-- Clear federated source tables (safe for testing)
TRUNCATE TABLE app.locations_legacy CASCADE;
TRUNCATE TABLE app.wigle_network CASCADE;
TRUNCATE TABLE app.wigle_network_detail CASCADE;

-- Federated views will update automatically (they're just SQL views)

-- Check that data is cleared
SELECT COUNT(*) FROM app.federated_networks; -- Should be 0 or very low
```

### Re-import Test Data

```bash
# Step 1: Import KML
python server/pipelines/parsers/kml_parser.py --input pipelines/kml/20250130-00340.kml

# Step 2: Verify import
psql -U shadowcheck_user -d shadowcheck -c "SELECT COUNT(*) FROM app.locations_legacy;"

# Step 3: Check federated views updated
psql -U shadowcheck_user -d shadowcheck -c "SELECT COUNT(*) FROM app.federated_networks;"
```

### Check Data Quality

```sql
-- Count orphaned networks (missing GPS)
SELECT COUNT(*) FROM app.orphaned_networks;

-- Compare source coverage (networks in multiple sources)
SELECT
  bssid,
  source_count,
  array_agg(source_name) as sources
FROM app.network_source_comparison
WHERE source_count > 1
LIMIT 20;

-- Check data completeness
SELECT
  source_name,
  COUNT(*) as total_observations,
  COUNT(DISTINCT bssid) as unique_networks,
  COUNT(CASE WHEN ssid IS NOT NULL THEN 1 END) as networks_with_ssid,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as networks_with_gps
FROM app.federated_observations
GROUP BY source_name;
```

---

## Error Handling

All pipelines use `shared/safe_ingest.py` which provides:

- **Data Validation**: Checks required fields before insert
- **Duplicate Handling**: Uses `ON CONFLICT DO NOTHING` for graceful deduplication
- **Logging**: All operations logged to console and files
- **Rollback**: Transactions ensure atomicity (all-or-nothing imports)
- **Statistics**: Reports inserted/duplicate counts after each batch

**Example Output**:
```
Ingestion: 1523 inserted, 87 duplicates (5.4% duplicate rate) out of 1610 total
```

This is NORMAL and expected - duplicates mean the deduplication is working.

---

## Environment Variables

Required for WiGLE API:
```bash
# .env file (NEVER commit this)
WIGLE_API_NAME=your_username
WIGLE_API_TOKEN=your_api_token_here
```

Get your API token from: https://wigle.net/account

---

## Common Issues & Solutions

### Issue: "Permission denied" when running Python scripts
**Solution**:
```bash
chmod +x server/pipelines/parsers/*.py
chmod +x server/pipelines/enrichment/*.py
```

### Issue: "Module not found: safe_ingest"
**Solution**: Import paths are relative. Run from project root:
```bash
cd /home/nunya/shadowcheck
python server/pipelines/parsers/kml_parser.py --input ...
```

Or update `PYTHONPATH`:
```bash
export PYTHONPATH=/home/nunya/shadowcheck:$PYTHONPATH
```

### Issue: "Orphan count increased after KML import"
**Explanation**: This is expected if you truncated KML data but not WiGLE data. The orphaned_networks view shows networks from ALL sources that lack GPS. If you removed the GPS source (KML) but kept the networks (WiGLE), they become orphaned.

**Solution**: Either:
1. Re-import KML data
2. Or truncate WiGLE tables too for a clean slate

### Issue: WiGLE API returns "noresponse"
**Causes**:
- Network not in WiGLE database (too new, never submitted)
- API rate limit hit
- Network BSSID typo

**Solution**: Check `pipelines/wigle_api/noresponse_*.json` files to see which BSSIDs returned empty.

---

## Performance Considerations

### KML Import
- **Speed**: ~1000 observations/second
- **Bottleneck**: PostGIS spatial index updates
- **Optimization**: Batch size of 500 in `safe_ingest.py`

### WiGLE API
- **Rate Limit**: Check WiGLE API docs (typically 100 requests/day for free tier)
- **Cache**: Always check cache before hitting API
- **Batch Processing**: Use `--batch` mode for multiple BSSIDs

### Federated Views
- **Performance**: Views are fast (they're just SQL JOINs)
- **Materialization**: NOT materialized (always live data)
- **Indexing**: Ensure BSSIDs and timestamps are indexed

---

## Next Steps

### Immediate Priorities
1. ✅ Organize pipeline directory structure
2. ⏳ Test WiGLE SQLite import with reorganized paths
3. ⏳ Integrate WiGLE API with frontend UI ("like magic" workflow)
4. ⏳ Create Pipeline Management Dashboard
5. ⏳ Implement Kismet parser

### Future Enhancements
- Bluetooth device tracking pipeline
- Cellular tower observation pipeline
- Automated nightly WiGLE API enrichment
- Data quality scoring system
- Export to courtroom-ready PDF reports

---

## References

- **WiGLE API Docs**: https://api.wigle.net/swagger
- **KML Specification**: https://developers.google.com/kml/documentation
- **PostGIS Documentation**: https://postgis.net/docs/
- **Kismet Docs**: https://www.kismetwireless.net/docs/

---

**Last Updated**: 2025-11-01
**Maintainer**: ShadowCheck Development Team
