#!/bin/bash

# =====================================================
# Complete Surveillance GeoJSON Export - Optimized
# All surveillance assets including 496+ federal networks
# =====================================================

set -e

# Configuration
CONTAINER="${CONTAINER:-shadowcheck_postgres}"
DB_NAME="${DB_NAME:-shadowcheck}"
DB_USER="${DB_USER:-postgres}"
OUTPUT_DIR="./surveillance_intel_complete"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "=== GENERATING COMPLETE SURVEILLANCE INTELLIGENCE GEOJSON ==="
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

    echo "✓ Generated: $OUTPUT_DIR/$output_file ($(du -h "$OUTPUT_DIR/$output_file" | cut -f1))"
}

# Function to execute PostgreSQL query and save as CSV
generate_csv() {
    local query_name="$1"
    local output_file="$2"
    local query="$3"

    echo "Generating CSV: $output_file"

    docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "\\copy ($query) TO STDOUT WITH CSV HEADER" > "$OUTPUT_DIR/$output_file"

    echo "✓ Generated CSV: $OUTPUT_DIR/$output_file ($(du -h "$OUTPUT_DIR/$output_file" | cut -f1))"
}

# 1. ALL FEDERAL AGENCY NETWORKS (496+ networks)
FEDERAL_AGENCIES_QUERY="
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
    COALESCE(n.frequency, 0) as frequency_mhz,
    COALESCE(n.capabilities, '') as security_capabilities,
    COALESCE(n.bestlevel, 0) as signal_strength_dbm,
    ROUND((ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0)::numeric, 3) as distance_from_home_km,
    COALESCE(rm.organization_name, 'Unknown') as manufacturer_name,
    CASE
        WHEN n.ssid ~* 'fbi' THEN 'FBI'
        WHEN n.ssid ~* 'cia' THEN 'CIA'
        WHEN n.ssid ~* 'dea' THEN 'DEA'
        WHEN n.ssid ~* 'doj' THEN 'DOJ'
        WHEN n.ssid ~* 'dod' THEN 'DOD'
        WHEN n.ssid ~* 'nsa' THEN 'NSA'
        WHEN n.ssid ~* 'atf' THEN 'ATF'
        WHEN n.ssid ~* 'usss' THEN 'USSS'
        WHEN n.ssid ~* 'ice' THEN 'ICE'
        WHEN n.ssid ~* 'cbp' THEN 'CBP'
        ELSE 'OTHER_AGENCY'
    END as agency,
    CASE
        WHEN n.ssid ~* '(van|mobile|vehicle)' THEN 'Mobile_Platform'
        WHEN n.ssid ~* '(task|force|team)' THEN 'Task_Force'
        WHEN n.ssid ~* '(tactical|swat|ops)' THEN 'Tactical_Unit'
        ELSE 'Standard_Infrastructure'
    END as asset_type,
    'federal_surveillance_network' as threat_classification
FROM app.networks_legacy n
INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
CROSS JOIN home_location h
LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
WHERE n.ssid ~* '(fbi|cia|dea|doj|dod|nsa|atf|usss|ice|cbp)'
AND n.ssid IS NOT NULL
AND l.lat IS NOT NULL AND l.lon IS NOT NULL
AND l.lat != 0 AND l.lon != 0
ORDER BY agency, distance_from_home_km
"

# 2. EXTREME RANGE THREATS (9 networks, 89km capability)
EXTREME_THREATS_QUERY="
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
    COALESCE(n.frequency, 0) as frequency_mhz,
    COALESCE(n.capabilities, '') as security_capabilities,
    COALESCE(n.bestlevel, 0) as signal_strength_dbm,
    ROUND((ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0)::numeric, 3) as distance_from_home_km,
    COALESCE(rm.organization_name, 'Unknown') as manufacturer_name,
    'extreme_range_surveillance' as threat_classification,
    'professional_surveillance_team' as asset_type
FROM app.networks_legacy n
INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
CROSS JOIN home_location h
LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
WHERE n.bssid IN (
    'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
    'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
    'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
)
AND l.lat IS NOT NULL AND l.lon IS NOT NULL
AND l.lat != 0 AND l.lon != 0
ORDER BY distance_from_home_km DESC
"

# 3. HIGH MOBILITY SURVEILLANCE DEVICES (58+ networks)
HIGH_MOBILITY_QUERY="
WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
),
mobility_analysis AS (
    SELECT
        n.bssid,
        COALESCE(n.ssid, '') as ssid,
        UPPER(LEFT(n.bssid, 8)) as oui,
        COUNT(DISTINCT l.lat || ',' || l.lon) as unique_locations,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0) as max_range_km,
        MIN(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0) as min_range_km
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    CROSS JOIN home_location h
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
    AND l.lat != 0 AND l.lon != 0
    GROUP BY n.bssid, n.ssid
    HAVING COUNT(DISTINCT l.lat || ',' || l.lon) >= 2
    AND MAX(ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0) >= 10.0
    AND MIN(ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0) <= 2.0
    ORDER BY max_range_km DESC
    LIMIT 58
)
SELECT
    n.bssid,
    COALESCE(n.ssid, '') as ssid,
    UPPER(LEFT(n.bssid, 8)) as oui,
    l.lat as latitude,
    l.lon as longitude,
    l.time as sighting_timestamp_ms,
    TO_TIMESTAMP(l.time/1000)::text as sighting_timestamp_readable,
    COALESCE(n.frequency, 0) as frequency_mhz,
    COALESCE(n.capabilities, '') as security_capabilities,
    COALESCE(n.bestlevel, 0) as signal_strength_dbm,
    ROUND((ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0)::numeric, 3) as distance_from_home_km,
    COALESCE(rm.organization_name, 'Unknown') as manufacturer_name,
    'high_mobility_surveillance' as threat_classification,
    'humint_operative' as asset_type
FROM mobility_analysis ma
INNER JOIN app.networks_legacy n ON ma.bssid = n.bssid
INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
CROSS JOIN (SELECT location_point as home_point FROM app.location_markers WHERE marker_type = 'home' LIMIT 1) h
LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
AND l.lat != 0 AND l.lon != 0
ORDER BY ma.max_range_km DESC, distance_from_home_km
"

# Home reference
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

echo "=== GENERATING FEDERAL AGENCY SURVEILLANCE NETWORKS ==="
generate_geojson "federal_agencies" "federal_agency_surveillance.geojson" "$FEDERAL_AGENCIES_QUERY"
generate_csv "federal_agencies" "federal_agency_surveillance.csv" "$FEDERAL_AGENCIES_QUERY"

echo
echo "=== GENERATING EXTREME RANGE THREATS ==="
generate_geojson "extreme_threats" "extreme_range_threats.geojson" "$EXTREME_THREATS_QUERY"
generate_csv "extreme_threats" "extreme_range_threats.csv" "$EXTREME_THREATS_QUERY"

echo
echo "=== GENERATING HIGH MOBILITY SURVEILLANCE DEVICES ==="
generate_geojson "high_mobility" "high_mobility_surveillance.geojson" "$HIGH_MOBILITY_QUERY"
generate_csv "high_mobility" "high_mobility_surveillance.csv" "$HIGH_MOBILITY_QUERY"

echo
echo "=== GENERATING HOME REFERENCE ==="
generate_geojson "home_reference" "home_location.geojson" "$HOME_QUERY"
generate_csv "home_reference" "home_location.csv" "$HOME_QUERY"

echo
echo "=== COMPLETE SURVEILLANCE INTELLIGENCE EXPORT FINISHED ==="
echo
echo "Generated files in: $OUTPUT_DIR/"
ls -lah "$OUTPUT_DIR/"
echo
echo "MAJOR DATASETS GENERATED:"
echo "✓ federal_agency_surveillance.geojson - 496+ federal surveillance networks"
echo "✓ extreme_range_threats.geojson - 9 surveillance teams (89km capability)"
echo "✓ high_mobility_surveillance.geojson - 58+ HUMINT operatives"
echo "✓ home_location.geojson - Target residence reference point"
echo "✓ All corresponding CSV files for analysis"
echo
echo "⚠️  CLASSIFICATION: EYES ONLY - COMPLETE SURVEILLANCE INTELLIGENCE ⚠️"