#!/bin/bash

# =====================================================
# Simple Surveillance GeoJSON Export Script
# Focus on core surveillance threats only
# =====================================================

set -e

# Configuration
CONTAINER="${CONTAINER:-shadowcheck_postgres}"
DB_NAME="${DB_NAME:-shadowcheck}"
DB_USER="${DB_USER:-postgres}"
OUTPUT_DIR="./surveillance_intel_corrected"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "=== GENERATING SIMPLE SURVEILLANCE INTELLIGENCE GEOJSON ==="
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

# Core surveillance networks only - simplified query
CORE_SURVEILLANCE_QUERY="
WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
)
SELECT
    n.bssid,
    COALESCE(n.ssid, '') as ssid,
    UPPER(LEFT(n.bssid, 8)) as oui,
    l.lat as latitude,
    l.lon as longitude,
    l.time as sighting_timestamp_ms,
    TO_TIMESTAMP(l.time/1000)::text as sighting_timestamp_readable,
    DATE_TRUNC('day', TO_TIMESTAMP(l.time/1000))::text as sighting_date,
    EXTRACT(hour FROM TO_TIMESTAMP(l.time/1000)) as sighting_hour,
    COALESCE(n.frequency, 0) as frequency_mhz,
    COALESCE(n.capabilities, '') as security_capabilities,
    COALESCE(n.type, 'W') as radio_type,
    COALESCE(n.bestlevel, 0) as signal_strength_dbm,
    ROUND((ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0)::numeric, 3) as distance_from_home_km,
    ROUND((ST_Azimuth(
        h.home_point,
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)
    ) * 180 / PI())::numeric, 1) as bearing_from_home_degrees,
    n.source_id,
    n.unified_id,
    COALESCE(rm.organization_name, 'Unknown') as manufacturer_name,
    COALESCE(rm.ieee_registry_type, 'Unknown') as manufacturer_type,
    'confirmed_surveillance_threat' as threat_status,
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
    CASE
        WHEN n.capabilities ILIKE '%WPA%' OR n.capabilities ILIKE '%RSN%' THEN 'secured'
        WHEN n.capabilities ILIKE '%ESS%' AND n.capabilities NOT ILIKE '%WPA%' THEN 'open'
        WHEN n.capabilities = '' OR n.capabilities IS NULL THEN 'unknown'
        ELSE 'other'
    END as security_status,
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
WHERE n.bssid IN (
    'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
    'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
    'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
)
AND l.lat IS NOT NULL AND l.lon IS NOT NULL
ORDER BY n.bssid, l.time
"

# Generate surveillance intelligence files
generate_geojson "surveillance_threats" "surveillance_threats.geojson" "$CORE_SURVEILLANCE_QUERY"
generate_csv "surveillance_threats" "surveillance_threats.csv" "$CORE_SURVEILLANCE_QUERY"

# Home location reference
HOME_QUERY="
SELECT
    'home_location' as marker_type,
    ST_Y(location_point) as latitude,
    ST_X(location_point) as longitude,
    marker_name,
    radius_meters,
    'target_residence' as classification
FROM app.location_markers
WHERE marker_type = 'home'
"

generate_geojson "home_reference" "home_location.geojson" "$HOME_QUERY"
generate_csv "home_reference" "home_location.csv" "$HOME_QUERY"

echo
echo "=== SIMPLE SURVEILLANCE INTELLIGENCE EXPORT COMPLETE ==="
echo
echo "Generated files in: $OUTPUT_DIR/"
ls -la "$OUTPUT_DIR/"
echo
echo "FILES GENERATED:"
echo "- surveillance_threats.geojson (19 surveillance sightings with all metadata)"
echo "- surveillance_threats.csv (same data in CSV format)"
echo "- home_location.geojson (reference point)"
echo "- home_location.csv (reference point in CSV)"
echo
echo "METADATA INCLUDED:"
echo "✓ BSSID, SSID, OUI, manufacturer intelligence"
echo "✓ Lat/lon coordinates from locations_legacy (source of truth)"
echo "✓ Proper timestamps from actual sighting records"
echo "✓ Signal strength, frequency, security capabilities"
echo "✓ Distance/bearing from home, operational zones"
echo "✓ Threat classification and security analysis"
echo
echo "⚠️  CLASSIFICATION: SENSITIVE - SURVEILLANCE INTELLIGENCE ⚠️"