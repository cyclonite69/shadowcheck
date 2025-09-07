#!/usr/bin/env bash
# Fixed API endpoint testing - handles various response formats

set -euo pipefail

API_BASE="http://localhost:5000"
API_V1="${API_BASE}/api/v1"

echo "=== API WIRING VERIFICATION ==="
echo "Base URL: $API_BASE"
echo ""

# Simple endpoint test - just check if it responds
test_simple() {
    local endpoint="$1"
    local description="$2"
    
    echo "Testing: $description"
    echo "Endpoint: $endpoint"
    
    if response=$(curl -s -w "%{http_code}" "$endpoint" 2>/dev/null); then
        http_code="${response: -3}"
        body="${response%???}"
        echo "Status: $http_code"
        
        if [[ "$http_code" == "200" ]]; then
            echo "✓ PASS: Responds OK"
            echo "Response: ${body:0:100}..."
        else
            echo "✗ FAIL: HTTP $http_code"
        fi
    else
        echo "✗ FAIL: No response"
    fi
    echo ""
}

# JSON endpoint test
test_json() {
    local endpoint="$1"
    local description="$2"
    
    echo "Testing: $description"
    echo "Endpoint: $endpoint"
    
    if response=$(curl -s -w "%{http_code}" "$endpoint" 2>/dev/null); then
        http_code="${response: -3}"
        body="${response%???}"
        echo "Status: $http_code"
        
        if [[ "$http_code" == "200" ]]; then
            if echo "$body" | jq . >/dev/null 2>&1; then
                echo "✓ PASS: Valid JSON"
                
                # Check if it's our expected list format
                if echo "$body" | jq -e '.rows | type == "array"' >/dev/null 2>&1; then
                    count=$(echo "$body" | jq '.count // (.rows | length)')
                    echo "✓ List format with $count items"
                elif echo "$body" | jq -e '.type == "FeatureCollection"' >/dev/null 2>&1; then
                    features=$(echo "$body" | jq '.features | length')
                    echo "✓ GeoJSON with $features features"
                else
                    echo "? Unknown JSON structure"
                fi
            else
                echo "✗ FAIL: Invalid JSON"
                echo "Response: ${body:0:200}"
            fi
        else
            echo "✗ FAIL: HTTP $http_code"
        fi
    else
        echo "✗ FAIL: No response"
    fi
    echo ""
}

echo "=== BASIC CONNECTIVITY ==="
test_simple "$API_BASE/" "Root endpoint"

echo "=== CORE JSON ENDPOINTS ==="
test_json "$API_V1/networks?limit=3" "Networks endpoint"
test_json "$API_V1/observations?limit=3" "Observations endpoint"
test_json "$API_V1/locations?limit=3" "Locations endpoint"

echo "=== POTENTIAL GEOJSON ENDPOINTS ==="
test_json "$API_V1/networks.geojson?limit=3" "Networks GeoJSON (.geojson)"
test_json "$API_V1/geojson/networks?limit=3" "Networks GeoJSON (/geojson/)"
test_json "$API_V1/map/networks?limit=3" "Networks GeoJSON (/map/)"

echo "=== PARAMETER TESTING ==="
test_json "$API_V1/networks?limit=1" "Limit parameter"
test_json "$API_V1/networks?type=W&limit=2" "Type filtering"

echo "=== DATA STRUCTURE ANALYSIS ==="
echo "Analyzing network data structure..."
if sample=$(curl -s "$API_V1/networks?limit=1" 2>/dev/null); then
    if echo "$sample" | jq . >/dev/null 2>&1; then
        echo "Sample data structure:"
        echo "$sample" | jq '.rows[0] // empty' 2>/dev/null | head -10
        
        # Check for location fields
        if echo "$sample" | jq -e '.rows[0] | has("lastlat") and has("lastlon")' >/dev/null 2>&1; then
            echo ""
            echo "✓ Location data available (lastlat, lastlon)"
            lat=$(echo "$sample" | jq -r '.rows[0].lastlat')
            lon=$(echo "$sample" | jq -r '.rows[0].lastlon')
            echo "  Sample coords: $lat, $lon"
        else
            echo ""
            echo "⚠ No location coordinates found"
        fi
    else
        echo "✗ Invalid response format"
    fi
else
    echo "✗ Could not fetch sample data"
fi

echo ""
echo "=== QUICK SUMMARY ==="
echo "What's working vs what needs implementation..."
