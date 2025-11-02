/**
 * Network Map Viewer with Tooltip and Hover Circle
 * Based on shadowcheck-lite implementation
 * Professional implementation without emojis
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  macToColor,
  calculateSignalRange,
  normalizeMac,
  toGHz,
  signalClass,
  toDMS,
  toFeet,
  formatDisplayTime,
  wifiIcon
} from '@/lib/mapUtils';
import { wireTooltipNetwork } from './wireTooltipNetwork';

interface NetworkFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    uid?: string;
    bssid: string;
    ssid: string;
    frequency?: number;
    signal_strength?: number | null;
    encryption?: string;
    observed_at?: string;
    radio_type?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface NetworkMapboxViewerProps {
  networks: NetworkFeature[];
  mapboxToken: string;
  onNetworkClick?: (network: NetworkFeature) => void;
  onMapClick?: (lngLat: [number, number]) => void;
  selectedNetworkId?: string | null;
  center?: [number, number] | null;
  isRadiusSearchMode?: boolean;
  radiusSearch?: { lat: number; lng: number; radiusMeters: number } | null;
}

export function NetworkMapboxViewer({
  networks,
  mapboxToken,
  onNetworkClick,
  onMapClick,
  selectedNetworkId = null,
  center = null,
  isRadiusSearchMode = false,
  radiusSearch = null
}: NetworkMapboxViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasPerformedInitialFit = useRef(false); // Track if we've done initial fit bounds

  // Initialize map
  useEffect(() => {
    console.log('🗺️ NetworkMapboxViewer: Initializing...', {
      hasContainer: !!mapContainer.current,
      hasToken: !!mapboxToken,
      alreadyInitialized: !!map.current
    });

    if (!mapContainer.current || !mapboxToken) return;
    if (map.current) return; // Already initialized

    console.log('🗺️ Creating Mapbox map instance...');
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-83.6875, 43.0125],
      zoom: 3,
      maxZoom: 20
    });

    map.current.on('error', (e) => {
      console.error('❌ Mapbox Error:', e.error.message);
    });

    map.current.on('style.load', () => {
      console.log('✅ Mapbox: Style loaded');
      if (!map.current) return;

      // Set 3D globe projection
      map.current.setProjection('globe');
      map.current.setFog({});

      // Set light preset for day mode
      map.current.setConfigProperty('basemap', 'lightPreset', 'day');

      console.log('✅ Mapbox: Map fully configured');
      setMapLoaded(true);
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

      // Resize map
      setTimeout(() => {
        if (map.current) map.current.resize();
      }, 250);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Add layers and data
  useEffect(() => {
    console.log('🗺️ Adding layers:', {
      hasMap: !!map.current,
      mapLoaded,
      networkCount: networks.length
    });

    if (!map.current || !mapLoaded || !networks.length) {
      console.log('⚠️ Skipping layer addition:', {
        hasMap: !!map.current,
        mapLoaded,
        networkCount: networks.length
      });
      return;
    }

    console.log('✅ Adding network data to map:', networks.length, 'features');
    const currentMap = map.current;

    // Process features with calculated radius and color
    const processedFeatures = networks.map((feature) => {
      const zoom = currentMap.getZoom();
      const signal = (feature.properties as any).signal || feature.properties.signal_strength || null;
      const freq = feature.properties.frequency || 0;
      const bssid = feature.properties.bssid;

      const radius = calculateSignalRange(signal, freq, zoom);
      const color = macToColor(bssid);

      return {
        ...feature,
        properties: {
          ...feature.properties,
          calculatedRadius: radius,
          colour: color,
          color: color,
          mac: normalizeMac(bssid),
          freq: freq ? toGHz(freq) : '',
          signal: signal
        }
      };
    });

    const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: processedFeatures as any
    };

    // Add source with clustering enabled
    if (currentMap.getSource('wifi')) {
      (currentMap.getSource('wifi') as mapboxgl.GeoJSONSource).setData(geojsonData);
    } else {
      currentMap.addSource('wifi', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 16, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (default: 50)
      });
    }

    // Add cluster circle layer
    if (!currentMap.getLayer('clusters')) {
      currentMap.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'wifi',
        filter: ['has', 'point_count'],
        paint: {
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,  // radius when point_count < 10
            10, 30,  // radius when point_count >= 10 and < 50
            50, 40   // radius when point_count >= 50
          ],
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3b82f6',  // blue for < 10 points
            10, '#8b5cf6',  // purple for 10-50 points
            50, '#ef4444'   // red for 50+ points
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-stroke-opacity': 0.6
        }
      });
    }

    // Add cluster count labels
    if (!currentMap.getLayer('cluster-count')) {
      currentMap.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'wifi',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#fff'
        }
      });
    }

    // Add hover circle layer (only for unclustered points)
    if (!currentMap.getLayer('hover')) {
      currentMap.addLayer({
        id: 'hover',
        type: 'circle',
        source: 'wifi',
        filter: ['all', ['!has', 'point_count'], ['==', 'uid', '']],
        paint: {
          'circle-radius': ['case', ['!=', ['get', 'signal'], null], ['get', 'calculatedRadius'], 20],
          'circle-color': ['get', 'colour'],
          'circle-opacity': 0.15,
          'circle-stroke-color': ['get', 'colour'],
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.4
        }
      });
    }

    // Add unclustered point layer
    if (!currentMap.getLayer('pts')) {
      currentMap.addLayer({
        id: 'pts',
        type: 'circle',
        source: 'wifi',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 6,
          'circle-color': ['get', 'colour'],
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.9
        }
      });
    }

    // Add selected point highlight layer
    if (!currentMap.getLayer('selected-point')) {
      currentMap.addLayer({
        id: 'selected-point',
        type: 'circle',
        source: 'wifi',
        filter: ['all', ['!has', 'point_count'], ['==', 'bssid', '']],
        paint: {
          'circle-radius': 12,
          'circle-color': '#3b82f6',
          'circle-opacity': 0.3,
          'circle-stroke-color': '#3b82f6',
          'circle-stroke-width': 3,
          'circle-stroke-opacity': 1
        }
      });
    }

    // Click handler for clusters - zoom in
    const clusterClickHandler = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      const clusterId = feature.properties?.cluster_id;

      if (!clusterId) return;

      const source = currentMap.getSource('wifi') as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        currentMap.easeTo({
          center: (feature.geometry as any).coordinates,
          zoom: zoom || currentMap.getZoom() + 2,
          duration: 500
        });
      });
    };

    // Add event listeners for clusters
    currentMap.on('click', 'clusters', clusterClickHandler);
    currentMap.on('mouseenter', 'clusters', () => {
      currentMap.getCanvas().style.cursor = 'pointer';
    });
    currentMap.on('mouseleave', 'clusters', () => {
      currentMap.getCanvas().style.cursor = '';
    });

    // Wire up professional tooltips using project's existing system
    const cleanupTooltip = wireTooltipNetwork(currentMap, 'pts', { env: 'urban', min: 8, max: 250 });

    // Add click handler for individual points
    const pointClickHandler = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      if (onNetworkClick && feature) {
        onNetworkClick(feature as any);
      }
    };

    currentMap.on('click', 'pts', pointClickHandler);
    currentMap.on('mouseenter', 'pts', () => {
      currentMap.getCanvas().style.cursor = 'pointer';
    });
    currentMap.on('mouseleave', 'pts', () => {
      currentMap.getCanvas().style.cursor = '';
    });

    // Fit bounds to data ONLY on initial load (not on every filter change)
    if (processedFeatures.length > 0 && !hasPerformedInitialFit.current) {
      const coords = processedFeatures.map(f => f.geometry.coordinates);
      if (coords.length === 1) {
        currentMap.flyTo({ center: coords[0], zoom: 15, duration: 800 });
      } else {
        const bounds = coords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        currentMap.fitBounds(bounds, {
          padding: 80,
          duration: 600,
          maxZoom: 17
        });
      }
      hasPerformedInitialFit.current = true; // Mark that we've done the initial fit
    }

    return () => {
      // Clean up cluster event listeners
      currentMap.off('click', 'clusters', clusterClickHandler);
      (currentMap as any).off('mouseenter', 'clusters');
      (currentMap as any).off('mouseleave', 'clusters');

      // Clean up point event listeners
      currentMap.off('click', 'pts', pointClickHandler);
      (currentMap as any).off('mouseenter', 'pts');
      (currentMap as any).off('mouseleave', 'pts');

      // Clean up tooltip system
      if (cleanupTooltip) cleanupTooltip();
    };
  }, [networks, mapLoaded, onNetworkClick]);

  // Update radius on zoom
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const zoomHandler = () => {
      if (!map.current) return;

      const source = map.current.getSource('wifi') as mapboxgl.GeoJSONSource;
      if (source) {
        // Trigger recalculation by updating source
        const currentData = (source as any)._data;
        if (currentData) {
          source.setData(currentData);
        }
      }
    };

    map.current.on('zoomend', zoomHandler);

    return () => {
      if (map.current) {
        map.current.off('zoomend', zoomHandler);
      }
    };
  }, [mapLoaded]);

  // Update selected point highlight
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const layer = map.current.getLayer('selected-point');
    if (layer) {
      map.current.setFilter('selected-point', [
        'all',
        ['!has', 'point_count'],
        ['==', 'bssid', selectedNetworkId || '']
      ]);
    }
  }, [selectedNetworkId, mapLoaded]);

  // Center map on selected network
  useEffect(() => {
    if (!map.current || !mapLoaded || !center) return;

    map.current.flyTo({
      center: center,
      zoom: Math.max(map.current.getZoom(), 16),
      duration: 1000,
      essential: true
    });
  }, [center, mapLoaded]);

  // Update cursor for radius search mode
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const canvas = map.current.getCanvas();
    if (isRadiusSearchMode) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = '';
    }
  }, [isRadiusSearchMode, mapLoaded]);

  // Handle map click for radius search
  useEffect(() => {
    if (!map.current || !mapLoaded || !onMapClick) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (isRadiusSearchMode) {
        // Don't trigger if clicking on a network point
        const features = map.current?.queryRenderedFeatures(e.point, { layers: ['pts'] });
        if (!features || features.length === 0) {
          onMapClick([e.lngLat.lng, e.lngLat.lat]);
        }
      }
    };

    map.current.on('click', handleClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleClick);
      }
    };
  }, [isRadiusSearchMode, mapLoaded, onMapClick]);

  // Draw radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentMap = map.current;

    // Add radius source if it doesn't exist
    if (!currentMap.getSource('radius-search')) {
      currentMap.addSource('radius-search', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
    }

    // Add radius circle layer if it doesn't exist
    if (!currentMap.getLayer('radius-circle')) {
      currentMap.addLayer({
        id: 'radius-circle',
        type: 'fill',
        source: 'radius-search',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.1
        }
      });
    }

    // Add radius outline layer if it doesn't exist
    if (!currentMap.getLayer('radius-outline')) {
      currentMap.addLayer({
        id: 'radius-outline',
        type: 'line',
        source: 'radius-search',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });
    }

    // Update radius circle data
    if (radiusSearch) {
      // Create circle polygon (simplified - just using a rough circle)
      const steps = 64;
      const coords: [number, number][] = [];
      const radiusInDegrees = radiusSearch.radiusMeters / 111320; // Approximate meters to degrees

      for (let i = 0; i <= steps; i++) {
        const angle = (i * 360) / steps;
        const radians = (angle * Math.PI) / 180;
        const lon = radiusSearch.lng + radiusInDegrees * Math.cos(radians);
        const lat = radiusSearch.lat + radiusInDegrees * Math.sin(radians);
        coords.push([lon, lat]);
      }

      const circleFeature = {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [coords]
        },
        properties: {}
      };

      (currentMap.getSource('radius-search') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [circleFeature]
      });
    } else {
      // Clear radius circle
      (currentMap.getSource('radius-search') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [radiusSearch, mapLoaded]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Loading map...
        </div>
      )}
    </div>
  );
}
