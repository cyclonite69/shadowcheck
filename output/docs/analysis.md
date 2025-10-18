# ShadowCheck Database Schema Analysis

## Executive Summary

The ShadowCheck database contains a mix of legacy WiGLE import tables and a partially-implemented normalized schema. Key issues include naming ambiguity, empty tables, unclear relationships, and inconsistent data organization. This analysis identifies critical problems and provides foundation for refactoring.

## Current Database State

### Table Inventory with Row Counts

| Table Name | Row Count | Category | Purpose |
|------------|-----------|----------|---------|
| `app.locations` | 389,203 | Legacy | Raw GPS measurements from WiGLE |
| `app.location_measurements` | 389,155 | Normalized | Processed GPS data with spatial types |
| `app.network_observations` | 141,798 | Normalized | Signal strength/network properties |
| `app.networks` | 141,691 | Legacy | Raw network data from WiGLE |
| `app.radio_access_points` | 126,904 | Normalized | Deduplicated access points |
| `app.ieee_ouis` | 99,954 | Reference | OUI manufacturer registry |
| `app.routes` | 20,267 | Legacy | Path/waypoint data from WiGLE |
| `app.wigle_observations` | 156 | Integration | WiGLE API enrichment data |
| `app.provenance` | 8 | Legacy | Data source tracking |
| `app.data_sources` | 4 | Normalized | Import metadata |
| `app.user_devices` | 2 | Normalized | User's devices |
| `app.wigle_enrichments` | 2 | Integration | WiGLE API metadata |
| **Empty Tables (0 rows)** | | | |
| `app.radio_manufacturers` | 0 | Normalized | OUI lookup enrichment |
| `app.stalking_incidents` | 0 | Security | Threat detection |
| `app.location_visits` | 0 | Analytics | Location clustering |
| `app.wigle_enrichment_metadata` | 0 | Integration | WiGLE metadata |
| `app.wigle_network_observations` | 0 | Integration | WiGLE correlation |

## Critical Problems Identified

### 1. Naming and Conceptual Clarity

**Problem**: Table and column names lack semantic clarity
- `network_observations` - What aspect of networks is being observed? Signal strength? Presence? Capabilities?
- `location_measurements` vs `locations` - Redundant concepts
- `radio_access_points` - Mixed with other radio types (Bluetooth, cellular)

**Impact**: Difficult to understand data model, error-prone development

### 2. Data Redundancy and Inconsistency

**Problem**: Near-identical row counts suggest data duplication
- `locations` (389,203) vs `location_measurements` (389,155) - 99.99% overlap
- `networks` (141,691) vs `network_observations` (141,798) - Different counts suggest processing issues

**Impact**: Storage waste, sync issues, data integrity concerns

### 3. Empty Tables with Complex Structure

**Problem**: Several tables with 0 rows but sophisticated schemas
- `stalking_incidents` - 16 columns, complex threat detection logic
- `radio_manufacturers` - OUI enrichment, should have ~100k rows from `ieee_ouis`
- `location_visits` - Spatial clustering, should derive from measurements

**Impact**: Incomplete features, unused code paths, unclear requirements

### 4. Unclear Relationships and Data Flow

**Problem**: Legacy → Normalized mapping is unclear
- How does `networks` table data flow into `radio_access_points` and `network_observations`?
- What's the relationship between WiGLE integration tables and core schema?
- Why do both `ieee_ouis` and `radio_manufacturers` exist for the same concept?

### 5. Inconsistent Data Types and Constraints

**Problem**: Mixed approaches to similar data
- Timestamps: `bigint` (Unix epoch) vs `timestamp with time zone`
- Coordinates: `double precision` vs custom `latitude_degrees` domain
- IDs: Some use sequences, others don't

## Schema Relationship Analysis

### Current Data Flow (Inferred)

```
Legacy Tables               Normalized Tables
┌─────────────┐            ┌──────────────────────┐
│ networks    │───────────▶│ radio_access_points  │
│ (141,691)   │            │ (126,904)            │
└─────────────┘            └──────────────────────┘
                                      │
                                      ▼
┌─────────────┐            ┌──────────────────────┐
│ locations   │───────────▶│ network_observations │
│ (389,203)   │            │ (141,798)            │
└─────────────┘            └──────────────────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ location_measurements│
                           │ (389,155)            │
                           └──────────────────────┘
```

### Key Relationships

1. **One-to-Many**: `radio_access_points` → `network_observations`
2. **One-to-Many**: `radio_access_points` → `location_measurements`
3. **Foreign Key**: Both reference `data_sources` for provenance
4. **Spatial**: All location tables use PostGIS `geometry(Point,4326)`

## Data Quality Issues

### 1. Orphaned References
- `radio_manufacturers` empty but referenced by `radio_access_points`
- No OUI enrichment despite having IEEE registry data

### 2. Timestamp Inconsistencies
- Legacy tables use Unix epoch milliseconds (`bigint`)
- Normalized tables mix epoch and PostgreSQL timestamps

### 3. Missing Constraints
- No check constraints on signal strength ranges
- No validation of coordinate bounds
- No enforcement of BSSID format standards

## Security and Privacy Concerns

### 1. Incomplete Stalking Detection
- `stalking_incidents` table exists but unused
- No automated population mechanism
- Missing correlation algorithms

### 2. Data Retention
- No TTL policies on location data
- Historical tracking without anonymization

## Recommendations for Refactoring

### 1. Immediate Issues (High Priority)
- Rename `network_observations` → `signal_measurements`
- Populate `radio_manufacturers` from `ieee_ouis`
- Implement stalking detection algorithms
- Standardize timestamp formats

### 2. Schema Normalization (Medium Priority)
- Consolidate location tables
- Separate radio technologies (WiFi, Bluetooth, Cellular)
- Implement proper data lineage tracking

### 3. Performance Optimization (Low Priority)
- Add partitioning for time-series data
- Optimize spatial indexes
- Implement materialized views for analytics

## Next Steps

1. **Create Entity-Relationship Diagram** - Visual representation of relationships
2. **Design 3NF Schema** - Properly normalized with clear naming
3. **Migration Strategy** - Preserve all data while restructuring
4. **Index Optimization** - Performance tuning for spatial/temporal queries
5. **Security Implementation** - Complete stalking detection and privacy controls

This analysis provides the foundation for comprehensive database refactoring that will make ShadowCheck production-ready for SIGINT operations.