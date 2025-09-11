#!/bin/bash

echo "🗺️  Generating Vector Tiles from PostgreSQL Data"

# Configuration
DB_NAME=${DB_NAME:-"shadowcheck"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"postgres"}
GEOJSON_FILE="/tmp/networks.geojson"
PMTILES_OUTPUT="./public/tiles/networks.pmtiles"

# Check if tippecanoe is installed
if ! command -v tippecanoe &> /dev/null; then
    echo "❌ tippecanoe is not installed. Run './scripts/install-dependencies.sh' first"
    exit 1
fi

# Check if PostgreSQL is accessible
if ! command -v psql &> /dev/null; then
    echo "❌ psql is not installed or not in PATH"
    exit 1
fi

echo "📊 Extracting data from PostgreSQL..."

# Generate GeoJSON from PostgreSQL
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
COPY (
  SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', jsonb_agg(feature)
  )
  FROM (
    SELECT jsonb_build_object(
      'type', 'Feature',
      'id', bssid,
      'geometry', ST_AsGeoJSON(
        CASE 
          WHEN lastlat IS NOT NULL AND lastlon IS NOT NULL 
          THEN ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)
          ELSE NULL
        END
      )::jsonb,
      'properties', jsonb_build_object(
        'bssid', bssid,
        'ssid', COALESCE(ssid, ''),
        'radio_type', COALESCE(type, 'unknown'),
        'signal_strength', COALESCE(bestlevel, 0),
        'security_level', 
          CASE 
            WHEN capabilities ~ 'WPA3' THEN 'high'
            WHEN capabilities ~ 'WPA2' THEN 'high'  
            WHEN capabilities ~ 'WPA' THEN 'medium'
            WHEN capabilities ~ 'WEP' THEN 'low'
            WHEN capabilities = '[ESS]' OR capabilities IS NULL THEN 'none'
            ELSE 'unknown'
          END,
        'frequency', COALESCE(frequency, 0),
        'capabilities', COALESCE(capabilities, ''),
        'last_seen', EXTRACT(epoch FROM TO_TIMESTAMP(lasttime::text, 'YYYYMMDDHH24MISS'))::bigint
      )
    ) AS feature
    FROM g63_networks 
    WHERE lastlat IS NOT NULL 
      AND lastlon IS NOT NULL
      AND lastlat BETWEEN -90 AND 90
      AND lastlon BETWEEN -180 AND 180
  ) features
) TO '$GEOJSON_FILE'
" --quiet

if [ ! -f "$GEOJSON_FILE" ]; then
    echo "❌ Failed to generate GeoJSON file"
    exit 1
fi

# Count features
FEATURE_COUNT=$(jq '.features | length' "$GEOJSON_FILE" 2>/dev/null || echo "unknown")
echo "📍 Extracted $FEATURE_COUNT network observations"

echo "🏗️  Generating vector tiles with tippecanoe..."

# Generate PMTiles with optimized settings
tippecanoe \
  --output="$PMTILES_OUTPUT" \
  --force \
  --maximum-zoom=16 \
  --minimum-zoom=8 \
  --drop-densest-as-needed \
  --cluster-distance=50 \
  --attribute-for-id=bssid \
  --layer=networks \
  --detect-shared-borders \
  --simplification=10 \
  --buffer=64 \
  --extend-zooms-if-still-dropping \
  --no-feature-limit \
  --no-tile-size-limit \
  "$GEOJSON_FILE"

if [ ! -f "$PMTILES_OUTPUT" ]; then
    echo "❌ Failed to generate PMTiles"
    exit 1
fi

# Get file size
TILE_SIZE=$(du -h "$PMTILES_OUTPUT" | cut -f1)
echo "✅ Generated PMTiles: $PMTILES_OUTPUT ($TILE_SIZE)"

# Create tile server API endpoint (simple Node.js server)
cat > scripts/tiles/tile-server.js << 'EOF'
const express = require('express');
const fs = require('fs');
const path = require('path');
const { PMTiles } = require('pmtiles');

const app = express();
const PORT = process.env.TILE_PORT || 3001;

// Serve PMTiles
app.get('/api/v1/tiles/:z/:x/:y.mvt', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const pmtiles = new PMTiles(path.join(__dirname, '../../public/tiles/networks.pmtiles'));
    
    const tile = await pmtiles.getZxy(parseInt(z), parseInt(x), parseInt(y));
    
    if (tile) {
      res.setHeader('Content-Type', 'application/x-protobuf');
      res.setHeader('Content-Encoding', 'gzip');
      res.send(Buffer.from(tile.data));
    } else {
      res.status(404).send('Tile not found');
    }
  } catch (error) {
    console.error('Tile error:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(PORT, () => {
  console.log(`Tile server running on port ${PORT}`);
});
EOF

# Cleanup
rm -f "$GEOJSON_FILE"

echo "🎯 Tile generation complete!"
echo ""
echo "📋 Summary:"
echo "   • PMTiles file: $PMTILES_OUTPUT ($TILE_SIZE)"
echo "   • Features processed: $FEATURE_COUNT"
echo "   • Zoom levels: 8-16"
echo "   • Layer name: networks"
echo ""
echo "🚀 Vector tiles are now available in your map interface!"
echo "   Toggle to 'Vector' mode to see improved performance"