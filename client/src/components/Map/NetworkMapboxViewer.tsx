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
}

export function NetworkMapboxViewer({
  networks,
  mapboxToken,
  onNetworkClick
}: NetworkMapboxViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      const signal = feature.properties.signal_strength || null;
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
        filter: ['all', ['!', ['has', 'point_count']], ['==', 'uid', '']],
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

    // Fit bounds to data
    if (processedFeatures.length > 0) {
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
    }

    return () => {
      // Clean up cluster event listeners
      currentMap.off('click', 'clusters', clusterClickHandler);
      currentMap.off('mouseenter', 'clusters');
      currentMap.off('mouseleave', 'clusters');

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
