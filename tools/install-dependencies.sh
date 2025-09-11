#!/bin/bash

echo "🗺️  Installing Mapbox Standard + Vector Tiles Dependencies"

# Frontend dependencies
echo "Installing npm packages..."
npm install pmtiles@3.1.0 @turf/turf@7.1.0 geojson2mvt@1.6.0

# System dependencies for tile generation
echo "Installing system packages..."
if command -v apt-get >/dev/null; then
    sudo apt-get update
    sudo apt-get install -y tippecanoe sqlite3 spatialite-tools
elif command -v yum >/dev/null; then
    sudo yum install -y tippecanoe sqlite spatialite-tools
elif command -v brew >/dev/null; then
    brew install tippecanoe spatialite-tools
else
    echo "⚠️  Please manually install tippecanoe and spatialite-tools for your system"
fi

# Create directories
echo "Creating tile directories..."
mkdir -p public/tiles
mkdir -p scripts/tiles

echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Run './scripts/generate-tiles.sh' to create initial tiles"
echo "2. Toggle between 'Standard' and 'Vector' modes in the map interface"
echo "3. Vector mode will be enabled automatically when tiles are available"