# ShadowCheck Current Schema - Entity Relationship Diagram

## Current Schema Relationships (Mermaid ERD)

```mermaid
erDiagram
    %% Legacy Tables (WiGLE Imports)
    provenance {
        int id PK
        text filename
        text device_type
        text import_date
    }

    locations {
        bigint unified_id PK
        int source_id FK
        bigint _id
        text bssid
        int level
        double lat
        double lon
        double altitude
        double accuracy
        bigint time
        int external
        int mfgrid
    }

    networks {
        bigint unified_id PK
        int source_id FK
        text bssid
        text ssid
        int frequency
        text capabilities
        bigint lasttime
        double lastlat
        double lastlon
        text type
        int bestlevel
        double bestlat
        double bestlon
        text rcois
        int mfgrid
        text service
    }

    routes {
        bigint unified_id PK
        int source_id FK
        text name
        text description
        geometry route_path
    }

    ieee_ouis {
        text registry
        text assignment
        text organization_name
        text organization_address
    }

    %% Normalized Schema Tables
    data_sources {
        int data_source_id PK
        text source_name
        text source_type
        text description
        timestamp created_at
    }

    radio_access_points {
        bigint access_point_id PK
        radio_identifier bssid_identifier UK
        radio_technology_enum radio_technology
        int manufacturer_id FK
        int total_observation_count
        int unique_location_count
        boolean is_mobile_device
        geometry primary_location_point
        geometry coverage_area_polygon
        timestamp record_created_at
        timestamp record_updated_at
    }

    network_observations {
        bigint observation_id PK
        bigint access_point_id FK
        int data_source_id FK
        text network_ssid
        boolean is_hidden_network
        int frequency_hz
        int channel_number
        int channel_width_mhz
        text capabilities_string
        text encryption_type
        smallint signal_strength_dbm
        smallint noise_floor_dbm
        smallint signal_to_noise_ratio_db
        bigint observation_timestamp_ms
        int observation_duration_ms
        numeric data_confidence_score
        text[] quality_flags
        int original_record_id
        char original_source_type_code
        timestamp record_created_at
    }

    location_measurements {
        bigint location_id PK
        bigint access_point_id FK
        int data_source_id FK
        latitude_degrees latitude_degrees
        longitude_degrees longitude_degrees
        altitude_meters altitude_meters
        accuracy_meters position_accuracy_meters
        geometry location_point
        bigint measurement_timestamp_ms
        int measurement_duration_ms
        numeric data_confidence_score
        text[] anomaly_flags
        int original_record_id
        timestamp record_created_at
    }

    radio_manufacturers {
        int manufacturer_id PK
        text ieee_registry_type
        text oui_assignment_hex
        char oui_prefix_24bit
        char oui_prefix_28bit
        char oui_prefix_36bit
        text organization_name
        text organization_address
        timestamp record_created_at
    }

    user_devices {
        bigint device_id PK
        bigint access_point_id FK
        text device_name
        text device_type
        boolean is_owned_by_user
        timestamp first_seen_at
        timestamp last_seen_at
        timestamp record_created_at
    }

    %% Security & Analytics Tables (Empty)
    stalking_incidents {
        bigint incident_id PK
        bigint target_user_device_id FK
        bigint stalker_access_point_id FK
        text incident_type
        int shared_location_count
        numeric correlation_percentage
        numeric min_distance_feet
        numeric avg_distance_feet
        bigint first_incident_timestamp_ms
        bigint last_incident_timestamp_ms
        numeric incident_duration_hours
        text threat_level
        numeric confidence_score
        text investigation_status
        text notes
        timestamp record_created_at
        timestamp record_updated_at
    }

    location_visits {
        bigint visit_id PK
        bigint user_device_id FK
        text visit_name
        numeric center_latitude_degrees
        numeric center_longitude_degrees
        numeric radius_feet
        bigint arrival_timestamp_ms
        bigint departure_timestamp_ms
        numeric visit_duration_minutes
        geometry visit_center_point
        timestamp record_created_at
    }

    %% WiGLE Integration Tables
    wigle_enrichments {
        bigint enrichment_id PK
        text bssid
        text ssid
        text encryption
        text country
        text region
        text city
        double trilat
        double trilong
        text qos
        text type
        bigint lastupdt
        text netid
        text name
        text comment
        timestamp record_created_at
    }

    wigle_observations {
        bigint observation_id PK
        text bssid
        text ssid
        text encryption
        double latitude
        double longitude
        double altitude
        double accuracy
        bigint timestamp_ms
        text source_device
        timestamp record_created_at
    }

    wigle_enrichment_metadata {
        bigint metadata_id PK
        bigint enrichment_id FK
        text api_version
        text query_parameters
        int result_count
        timestamp query_timestamp
        text response_status
    }

    wigle_network_observations {
        bigint observation_id PK
        bigint potential_duplicate_of_access_point_id FK
        text wigle_netid
        text wigle_comment
        int wigle_qos
        timestamp wigle_lastupdt
        numeric match_confidence_score
        timestamp record_created_at
    }

    %% Legacy Relationships
    provenance ||--o{ locations : "source_id"
    provenance ||--o{ networks : "source_id"
    provenance ||--o{ routes : "source_id"

    %% Normalized Schema Relationships
    radio_manufacturers ||--o{ radio_access_points : "manufacturer_id"
    radio_access_points ||--o{ network_observations : "access_point_id"
    radio_access_points ||--o{ location_measurements : "access_point_id"
    radio_access_points ||--o{ user_devices : "access_point_id"
    radio_access_points ||--o{ stalking_incidents : "stalker_access_point_id"
    radio_access_points ||--o{ wigle_network_observations : "potential_duplicate_of_access_point_id"

    data_sources ||--o{ network_observations : "data_source_id"
    data_sources ||--o{ location_measurements : "data_source_id"

    user_devices ||--o{ stalking_incidents : "target_user_device_id"
    user_devices ||--o{ location_visits : "user_device_id"

    %% WiGLE Integration Relationships
    wigle_enrichments ||--o{ wigle_enrichment_metadata : "enrichment_id"
```

## Data Flow Analysis

### Legacy → Normalized Transformation

```mermaid
flowchart TD
    A[networks table<br/>141,691 rows] --> B[radio_access_points<br/>126,904 rows]
    C[locations table<br/>389,203 rows] --> D[location_measurements<br/>389,155 rows]
    A --> E[network_observations<br/>141,798 rows]

    F[ieee_ouis<br/>99,954 rows] -.-> G[radio_manufacturers<br/>0 rows - EMPTY]

    B --> E
    B --> D

    H[provenance<br/>8 rows] --> I[data_sources<br/>4 rows]
    I --> E
    I --> D

    style G fill:#ffcccc
    style A fill:#e1f5fe
    style C fill:#e1f5fe
    style F fill:#e1f5fe
    style H fill:#e1f5fe
```

### Problem Areas Identified

1. **Data Loss in Transformation**:
   - `networks` (141,691) → `radio_access_points` (126,904) = **10.4% loss**
   - `locations` (389,203) → `location_measurements` (389,155) = **0.01% loss**

2. **Missing Data Population**:
   - `ieee_ouis` (99,954) should populate `radio_manufacturers` (0)
   - Empty security tables suggest incomplete implementation

3. **Inconsistent Relationships**:
   - WiGLE integration tables disconnected from main schema
   - No clear path from legacy to analytics tables

## Schema Issues Summary

| Issue Type | Table(s) Affected | Impact |
|------------|------------------|---------|
| **Empty Tables** | `radio_manufacturers`, `stalking_incidents`, `location_visits` | Missing functionality |
| **Data Duplication** | `locations`/`location_measurements`, `networks`/`radio_access_points` | Storage waste, sync issues |
| **Naming Confusion** | `network_observations` | Unclear purpose |
| **Broken Relationships** | `radio_manufacturers` FK constraint | Data integrity issues |
| **Inconsistent Types** | Mixed timestamp formats | Query complexity |
| **Missing Constraints** | Signal strength, coordinates | Data quality issues |

This diagram illustrates the current state complexity and identifies areas requiring refactoring attention.