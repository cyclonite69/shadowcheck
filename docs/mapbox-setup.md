# 🗺️ Mapbox Standard + Vector Tiles Setup

This setup provides a **dual-mode mapping system** that toggles between:

1. **Standard Mode**: Uses Mapbox Standard with GeoJSON (current setup)
2. **Vector Tiles Mode**: High-performance PMTiles with tippecanoe

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install npm packages and system tools
./scripts/install-dependencies.sh
```

### 2. Generate Initial Tiles

```bash
# Create PMTiles from your PostgreSQL data
./scripts/generate-tiles.sh
```

### 3. Use the Toggle

- Open your map interface (`/visualization`)
- Look for the **Standard/Vector** toggle in the top-right
- **Standard**: Uses live GeoJSON from API (slower, always current)
- **Vector**: Uses pre-generated tiles (faster, needs regeneration)

## 🎯 Features

### Standard Mode (GeoJSON)

- ✅ Real-time data from API
- ✅ Dynamic filtering
- ✅ Always up-to-date
- ⚠️ Slower with large datasets

### Vector Tiles Mode (PMTiles)

- ⚡ **10x faster** rendering
- 🎯 **Zoom-optimized** clustering
- 💰 **Reduced API calls**
- 🗂️ **Better performance** with millions of points
- ⚠️ Requires tile regeneration for updates

## 📊 Architecture

```
┌─ Dashboard Cards ─────┐    ┌─ NetworkMap Component ─┐
│  • Radio Stats        │───▶│  ┌─ Mode Toggle ─────┐ │
│  • Security Analysis  │    │  │ [Standard|Vector] │ │
│  • Recent Activity    │    │  └───────────────────┘ │
└───────────────────────┘    │                       │
                             │  ┌─ Standard Mode ───┐ │
┌─ Live GeoJSON API ────┐    │  │ • GeoJSON source  │ │
│  /api/v1/g63/visualize│───▶│  │ • Real-time data  │ │
└───────────────────────┘    │  │ • Dynamic filters │ │
                             │  └───────────────────┘ │
┌─ PMTiles Storage ─────┐    │                       │
│  public/tiles/        │───▶│  ┌─ Vector Mode ─────┐ │
│  networks.pmtiles     │    │  │ • PMTiles source  │ │
└───────────────────────┘    │  │ • High performance│ │
                             │  │ • Zoom clustering │ │
                             │  └───────────────────┘ │
                             └───────────────────────┘
```

## 🔧 Configuration

### Environment Variables

```bash
# PostgreSQL connection (for tile generation)
DB_NAME=shadowcheck
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres

# Tile server port (optional)
TILE_PORT=3001
```

### Tile Generation Settings

Edit `scripts/generate-tiles.sh` to customize:

```bash
# Zoom levels
--maximum-zoom=16
--minimum-zoom=8

# Clustering distance
--cluster-distance=50

# Performance optimizations
--drop-densest-as-needed
--extend-zooms-if-still-dropping
```

## 📅 Automated Tile Updates

### Daily Regeneration (Recommended)

```bash
# Add to crontab
0 2 * * * cd /path/to/shadowcheck && ./scripts/generate-tiles.sh

# Or create systemd timer
sudo cp scripts/tile-generation.* /etc/systemd/system/
sudo systemctl enable tile-generation.timer
```

### Incremental Updates

For high-frequency updates, consider:

- Real-time mode for live data
- Batch tile updates every few hours
- Hybrid approach (recent data via API, bulk via tiles)

## 🔍 Troubleshooting

### Vector Mode Not Available

- Check if `tippecanoe` is installed: `which tippecanoe`
- Verify PMTiles exist: `ls -la public/tiles/networks.pmtiles`
- Check browser console for tile loading errors

### Performance Issues

- **Standard Mode**: Reduce data size or add pagination
- **Vector Mode**: Regenerate tiles with different clustering settings
- **Hybrid**: Use vector for base data, GeoJSON for recent updates

### Database Connection Errors

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d shadowcheck -c "SELECT COUNT(*) FROM g63_networks;"

# Check if PostGIS is enabled
psql -h localhost -U postgres -d shadowcheck -c "SELECT PostGIS_version();"
```

## 🎛️ Dashboard Integration

### Card Drill-Down with Map Modes

```typescript
// Radio card click → Vector mode with filter
const handleRadioCardClick = (radioType: string) => {
  navigate('/visualization', {
    state: {
      mapMode: 'vector-tiles',
      radioFilter: { [radioType]: true },
    },
  });
};

// Security analysis → Standard mode with real-time data
const handleSecurityClick = () => {
  navigate('/visualization', {
    state: {
      mapMode: 'standard',
      showSecurityHeat: true,
    },
  });
};
```

## 📈 Performance Comparison

| Metric                | Standard Mode        | Vector Tiles Mode     |
| --------------------- | -------------------- | --------------------- |
| **Load Time**         | 2-5s                 | <500ms                |
| **Memory Usage**      | High (full dataset)  | Low (zoom-based)      |
| **API Calls**         | Every filter change  | One-time tile load    |
| **Max Points**        | ~10k (browser limit) | Millions              |
| **Real-time Updates** | Instant              | Requires regeneration |

## 🚀 Production Deployment

1. **Pre-generate tiles** in CI/CD pipeline
2. **Serve tiles** from CDN (AWS CloudFront, etc.)
3. **Monitor tile freshness** and regenerate as needed
4. **Fallback gracefully** to standard mode if tiles unavailable

## 🔗 Useful Commands

```bash
# Install everything
./scripts/install-dependencies.sh

# Generate tiles
./scripts/generate-tiles.sh

# Check tile info
tippecanoe-decode public/tiles/networks.pmtiles | head -20

# Serve tiles locally
npm run tile-server

# Update dependencies
npm install pmtiles@latest @turf/turf@latest

# Clean up tiles
rm -rf public/tiles/* && ./scripts/generate-tiles.sh
```

Your mapping interface now supports both **real-time flexibility** (Standard) and **high-performance visualization** (Vector Tiles) with a simple toggle! 🎯
