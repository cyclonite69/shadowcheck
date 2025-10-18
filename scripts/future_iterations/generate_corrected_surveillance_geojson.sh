#!/bin/bash

# =====================================================
# Corrected Surveillance GeoJSON Export Script
# Using locations_legacy as source of truth for timestamps
# =====================================================

set -e

# Configuration
CONTAINER="${CONTAINER:-shadowcheck_postgres}"
DB_NAME="${DB_NAME:-shadowcheck}"
DB_USER="${DB_USER:-postgres}"
OUTPUT_DIR="./surveillance_intel_corrected"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "=== GENERATING CORRECTED SURVEILLANCE INTELLIGENCE GEOJSON ==="
echo "Using locations_legacy as source of truth for timestamps"
echo "Container: $CONTAINER"
echo "Database: $DB_NAME"
echo "Output Directory: $OUTPUT_DIR"
echo

# Function to execute PostgreSQL query and convert to GeoJSON format
generate_geojson() {
    local query_name="$1"
    local output_file="$2"
    local query="$3"

    echo "Generating: $output_file"

    # Execute query and convert to GeoJSON format
    docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -F',' -c "COPY (
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(
                json_build_object(
                    'type', 'Feature',
                    'geometry', json_build_object(
                        'type', 'Point',
                        'coordinates', json_build_array(longitude, latitude)
                    ),
                    'properties', to_jsonb(row_to_json(t)) - 'latitude' - 'longitude'
                )
            )
        )
        FROM ($query) t
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    ) TO STDOUT;" > "$OUTPUT_DIR/$output_file"

    echo "✓ Generated: $OUTPUT_DIR/$output_file"
}

# Function to execute PostgreSQL query and save as CSV
generate_csv() {
    local query_name="$1"
    local output_file="$2"
    local query="$3"

    echo "Generating CSV: $output_file"

    docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "\copy ($query) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/$output_file"

    echo "✓ Generated CSV: $OUTPUT_DIR/$output_file"
}

# Main query - Complete surveillance intelligence with corrected timestamps
COMPLETE_SURVEILLANCE_QUERY="
WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
)
SELECT
    -- Network identification
    n.bssid,
    COALESCE(n.ssid, '') as ssid,
    UPPER(LEFT(n.bssid, 8)) as oui,

    -- Location data (from locations_legacy - source of truth)
    l.lat as latitude,
    l.lon as longitude,
    NULL::numeric as altitude, -- Not available in current schema

    -- Temporal data (corrected timestamps from locations_legacy)
    l.time as sighting_timestamp_ms,
    TO_TIMESTAMP(l.time/1000)::text as sighting_timestamp_readable,
    DATE_TRUNC('day', TO_TIMESTAMP(l.time/1000))::text as sighting_date,
    EXTRACT(hour FROM TO_TIMESTAMP(l.time/1000)) as sighting_hour,
    EXTRACT(dow FROM TO_TIMESTAMP(l.time/1000)) as day_of_week,

    -- Technical specifications
    COALESCE(n.frequency, 0) as frequency_mhz,
    COALESCE(n.capabilities, '') as security_capabilities,
    COALESCE(n.type, 'W') as radio_type,
    COALESCE(n.bestlevel, 0) as signal_strength_dbm,

    -- Spatial analysis
    ROUND((ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0)::numeric, 3) as distance_from_home_km,
    ROUND((ST_Azimuth(
        h.home_point,
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)
    ) * 180 / PI())::numeric, 1) as bearing_from_home_degrees,

    -- Data source and identification
    n.source_id,
    n.unified_id,
    l.time as location_timestamp,
    n.lasttime as network_lasttime_unreliable,

    -- Manufacturer intelligence
    COALESCE(rm.organization_name, 'Unknown') as manufacturer_name,
    COALESCE(rm.ieee_registry_type, 'Unknown') as manufacturer_type,

    -- Threat classification
    CASE
        WHEN n.bssid IN (
            'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
            'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
            'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
        ) THEN 'confirmed_surveillance_threat'
        ELSE 'related_network'
    END as threat_status,

    -- Operational zone classification
    CASE
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 <= 1.0 THEN 'target_proximity'
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 >= 50.0 THEN 'surveillance_post'
        ELSE 'intermediate_zone'
    END as operational_zone,

    -- Security analysis
    CASE
        WHEN n.capabilities ILIKE '%WPA%' OR n.capabilities ILIKE '%RSN%' THEN 'secured'
        WHEN n.capabilities ILIKE '%ESS%' AND n.capabilities NOT ILIKE '%WPA%' THEN 'open'
        WHEN n.capabilities = '' OR n.capabilities IS NULL THEN 'unknown'
        ELSE 'other'
    END as security_status,

    -- Signal analysis
    CASE
        WHEN n.bestlevel >= -50 THEN 'very_strong'
        WHEN n.bestlevel >= -60 THEN 'strong'
        WHEN n.bestlevel >= -70 THEN 'moderate'
        WHEN n.bestlevel >= -80 THEN 'weak'
        WHEN n.bestlevel < -80 THEN 'very_weak'
        ELSE 'unknown'
    END as signal_classification

FROM app.locations_legacy l
INNER JOIN app.networks_legacy n ON l.unified_id = n.unified_id
CROSS JOIN home_location h
LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
WHERE (
    -- Include all confirmed surveillance networks
    n.bssid IN (
        'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
        'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
        'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
    )
    OR
    -- Include networks within 2km of any surveillance location
    EXISTS (
        SELECT 1 FROM app.locations_legacy surveillance_loc
        INNER JOIN app.networks_legacy surveillance_net ON surveillance_loc.unified_id = surveillance_net.unified_id
        WHERE surveillance_net.bssid IN (
            'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
            'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
            'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
        )
        AND ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(surveillance_loc.lon, surveillance_loc.lat), 4326)::geography
        ) <= 2000
    )
)
AND l.lat IS NOT NULL AND l.lon IS NOT NULL
AND l.lat BETWEEN -90 AND 90
AND l.lon BETWEEN -180 AND 180
ORDER BY threat_status DESC, l.time ASC, n.bssid
"

# Generate main surveillance intelligence file
generate_geojson "complete_surveillance" "complete_surveillance_intelligence.geojson" "$COMPLETE_SURVEILLANCE_QUERY"
generate_csv "complete_surveillance" "complete_surveillance_intelligence.csv" "$COMPLETE_SURVEILLANCE_QUERY"

# Core surveillance networks only (the 9 threats)
CORE_THREATS_QUERY="
WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
)
SELECT
    n.bssid,
    COALESCE(n.ssid, '') as ssid,
    l.lat as latitude,
    l.lon as longitude,
    l.time as sighting_timestamp_ms,
    TO_TIMESTAMP(l.time/1000)::text as sighting_timestamp_readable,
    COALESCE(n.frequency, 0) as frequency_mhz,
    COALESCE(n.capabilities, '') as security_capabilities,
    COALESCE(n.type, 'W') as radio_type,
    COALESCE(n.bestlevel, 0) as signal_strength_dbm,
    ROUND((ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0)::numeric, 3) as distance_from_home_km,
    n.source_id,
    n.unified_id,
    COALESCE(rm.manufacturer_name, 'Unknown') as manufacturer_name,
    'confirmed_surveillance_threat' as threat_status,
    CASE
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 <= 1.0 THEN 'target_proximity'
        ELSE 'surveillance_post'
    END as operational_zone
FROM app.locations_legacy l
INNER JOIN app.networks_legacy n ON l.unified_id = n.unified_id
CROSS JOIN home_location h
LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
WHERE n.bssid IN (
    'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
    'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
    'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
)
AND l.lat IS NOT NULL AND l.lon IS NOT NULL
ORDER BY n.bssid, l.time
"

generate_geojson "core_threats" "core_surveillance_threats.geojson" "$CORE_THREATS_QUERY"
generate_csv "core_threats" "core_surveillance_threats.csv" "$CORE_THREATS_QUERY"

# Home location reference
HOME_QUERY="
SELECT
    'home_location' as marker_type,
    ST_Y(location_point) as latitude,
    ST_X(location_point) as longitude,
    marker_name,
    radius_meters,
    'target_residence' as classification,
    'reference_point' as analysis_type
FROM app.location_markers
WHERE marker_type = 'home'
"

generate_geojson "home_reference" "home_location.geojson" "$HOME_QUERY"
generate_csv "home_reference" "home_location.csv" "$HOME_QUERY"

# Generate summary report
echo
echo "=== CORRECTED SURVEILLANCE INTELLIGENCE EXPORT COMPLETE ==="
echo
echo "Generated files in: $OUTPUT_DIR/"
ls -la "$OUTPUT_DIR/"
echo
echo "PRIMARY FILES:"
echo "- complete_surveillance_intelligence.geojson (comprehensive dataset with proper timestamps)"
echo "- core_surveillance_threats.geojson (9 confirmed threats only)"
echo "- home_location.geojson (reference point)"
echo
echo "CSV FILES (for analysis):"
echo "- complete_surveillance_intelligence.csv"
echo "- core_surveillance_threats.csv"
echo "- home_location.csv"
echo
echo "KEY IMPROVEMENTS:"
echo "✓ Using locations_legacy as source of truth for timestamps"
echo "✓ All metadata included: BSSID, SSID, lat/lon, signal strength, security, frequency"
echo "✓ Manufacturer intelligence via OUI lookup"
echo "✓ Proper temporal analysis with corrected timestamps"
echo "✓ Spatial analysis with distance/bearing calculations"
echo "✓ Threat classification and operational zones"
echo
echo "DATA FIELDS INCLUDED:"
echo "- Network: BSSID, SSID, OUI, manufacturer"
echo "- Location: lat, lon (altitude not available)"
echo "- Signal: strength (dBm), frequency (MHz), radio type"
echo "- Security: capabilities, classification"
echo "- Temporal: precise timestamps, date, hour, time period"
echo "- Spatial: distance from home, bearing, operational zone"
echo "- Intelligence: threat status, source tracking"
echo
echo "⚠️  CLASSIFICATION: SENSITIVE - CORRECTED SURVEILLANCE INTELLIGENCE ⚠️"