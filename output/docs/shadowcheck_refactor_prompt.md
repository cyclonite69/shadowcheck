# ShadowCheck Database Schema Analysis and Refactoring

## Context
You are analyzing a SIGINT/wardriving geospatial database for the ShadowCheck platform. The database currently contains a mix of legacy tables (from WiGLE SQLite imports) and a partially-completed normalized schema.

## Current Database State

### Legacy Tables (DO NOT MODIFY - Keep Intact)
- `app.ieee_oui` - IEEE OUI manufacturer registry
- `app.provenance` - Data source tracking (s22, s22b, j24, g63 devices)
- `app.locations` - Raw location observations from WiGLE
- `app.networks` - Raw network data from WiGLE
- `app.routes` - Raw route/waypoint data from WiGLE

### Current Normalized Tables (Need Refactoring)app.data_sources (2 rows) - Import metadata
app.radio_access_points (126,402 rows) - Deduplicated access points
app.network_observations (141,232 rows) - Individual signal observations
app.location_measurements (388,557 rows) - GPS measurements
app.location_visits (0 rows) - Derived location clusters
app.user_devices (1 row) - User's devices
app.stalking_incidents (0 rows) - Security detection
app.radio_manufacturers (0 rows) - OUI lookup enrichment
app.wigle_enrichments (1 row) - WiGLE API data
app.wigle_enrichment_metadata (0 rows)
app.wigle_network_observations (0 rows)
app.wigle_observations (78 rows)

## Problems to Solve

1. **Naming Confusion**: "network_observations" is vague - what does it observe?
2. **Empty Tables**: Several tables have 0 rows - are they needed?
3. **Unclear Relationships**: How do signal measurements relate to access points?
4. **Missing Functionality**: Location visits, stalking detection not populated
5. **Schema Intuition**: Column names and table purposes unclear

## Requirements

### 1. Schema Analysis
Analyze the current schema and provide:
- Entity-Relationship diagram (Mermaid format)
- Data flow from raw legacy tables → normalized schema
- Identification of redundant or unused tables
- Clear purpose statement for each table

### 2. Refactoring Plan
Design a **fully normalized (3NF)** schema with:

**Naming Convention**:
- Tables: plural nouns (e.g., `signal_readings` not `network_observations`)
- Columns: descriptive, snake_case
- No abbreviations unless industry standard (bssid, ssid ok)

**Core Entities** (propose better structure):
- Access points (WiFi/BT/Cellular)
- Signal measurements (what, where, when, strength)
- Geographic data (locations, routes, visits)
- Device tracking (user devices, manufacturers)
- Security features (stalking detection, anomalies)
- Data provenance (sources, imports, quality)

**Referential Integrity**:
- All foreign keys properly defined
- Cascade rules for deletions
- Constraints for data quality

### 3. Migration Strategy
Provide SQL migration scripts:
1. Create new properly-named tables
2. Migrate data from old → new (preserving all data)
3. Create indexes for performance
4. Create database roles:
   - `shadowcheck_admin` - full access
   - `shadowcheck_user` - read-only to app schema

### 4. Documentation
For each table provide:
- Purpose and use case
- Relationship to other tables
- Sample queries demonstrating usage
- Performance considerations (indexes, partitioning)

## Constraints

- **DO NOT** modify or drop legacy tables (locations, networks, routes, provenance, ieee_oui)
- **MUST** preserve all data (no data loss during refactoring)
- **MUST** maintain PostGIS spatial columns where appropriate
- **MUST** support temporal queries (time-series data)
- **MUST** enable future analytics (stalking detection, pattern analysis)

## Deliverables

1. **analysis.md** - Current state analysis and problems identified
2. **schema_refactored.sql** - New table definitions (3NF)
3. **migration.sql** - Data migration from current → refactored
4. **indexes.sql** - Performance optimization indexes
5. **roles.sql** - Database roles and permissions
6. **documentation.md** - Schema documentation and usage examples

## Questions to Answer

1. Should `location_visits` be auto-generated from `location_measurements`?
2. Is `stalking_incidents` detection automatic or manual flagging?
3. What's the relationship between WiGLE enrichment tables and core tables?
4. Should empty tables be dropped or are they needed for future features?
5. How should multi-protocol support work (WiFi vs BT vs Cellular)?

Analyze the schema, identify issues, and provide a complete refactoring plan that makes this database production-ready for the ShadowCheck SIGINT platform.