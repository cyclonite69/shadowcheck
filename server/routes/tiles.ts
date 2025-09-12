import { Router } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { db } from '../db/index.js';
import { g63Networks } from '../db/schema.js';
import { sql } from 'drizzle-orm';

const router = Router();

// Serve vector tiles from PMTiles
router.get('/tiles/:z/:x/:y.mvt', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const pmtilesPath = join(process.cwd(), 'public/tiles/networks.pmtiles');

    if (!existsSync(pmtilesPath)) {
      return res.status(404).json({
        error: 'Vector tiles not available. Run ./scripts/generate-tiles.sh first',
      });
    }

    // For now, redirect to static file serving
    // In production, you'd use PMTiles library here
    const tileUrl = `/tiles/networks.pmtiles`;
    return res.redirect(302, tileUrl);
  } catch (error) {
    console.error('Tile serving error:', error);
    res.status(500).json({ error: 'Failed to serve tile' });
  }
});

// Alternative: Generate tiles on-demand from database
router.get('/tiles-dynamic/:z/:x/:y.mvt', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const zoom = parseInt(z);
    const tileX = parseInt(x);
    const tileY = parseInt(y);

    // Calculate bounding box for this tile
    const bbox = tileToLngLatBounds(tileX, tileY, zoom);

    // Query database for networks in this tile
    const networks = await db
      .select({
        bssid: g63Networks.bssid,
        ssid: g63Networks.ssid,
        lat: sql<number>`${g63Networks.lastlat}::float`,
        lon: sql<number>`${g63Networks.lastlon}::float`,
        radio_type: g63Networks.type,
        signal_strength: g63Networks.bestlevel,
        capabilities: g63Networks.capabilities,
      })
      .from(g63Networks)
      .where(
        sql`
        ${g63Networks.lastlat} IS NOT NULL 
        AND ${g63Networks.lastlon} IS NOT NULL
        AND ${g63Networks.lastlat}::float >= ${bbox.south}
        AND ${g63Networks.lastlat}::float <= ${bbox.north}  
        AND ${g63Networks.lastlon}::float >= ${bbox.west}
        AND ${g63Networks.lastlon}::float <= ${bbox.east}
      `
      )
      .limit(1000); // Limit features per tile

    // Convert to MVT format (would require additional library)
    // For now, return GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: networks.map((network) => ({
        type: 'Feature',
        id: network.bssid,
        geometry: {
          type: 'Point',
          coordinates: [network.lon, network.lat],
        },
        properties: {
          bssid: network.bssid,
          ssid: network.ssid || '',
          radio_type: network.radio_type || 'unknown',
          signal_strength: network.signal_strength || 0,
          security_level: getSecurityLevel(network.capabilities || ''),
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    console.error('Dynamic tile error:', error);
    res.status(500).json({ error: 'Failed to generate tile' });
  }
});

// Utility functions
function tileToLngLatBounds(x: number, y: number, z: number) {
  const n = Math.pow(2, z);
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const north = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  const south = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;

  return { north, south, east, west };
}

function getSecurityLevel(capabilities: string): string {
  if (!capabilities || capabilities === '[ESS]') return 'none';
  if (capabilities.includes('WPA3')) return 'high';
  if (capabilities.includes('WPA2')) return 'high';
  if (capabilities.includes('WPA')) return 'medium';
  if (capabilities.includes('WEP')) return 'low';
  return 'unknown';
}

export default router;
