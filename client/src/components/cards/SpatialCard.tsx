import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { MapPin, Wifi, Activity, Globe, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import mapboxgl from 'mapbox-gl';

interface NetworkFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    ssid: string;
    bssid: string;
    signal_strength?: number;
    encryption?: string;
    observed_at: string;
  };
}

interface VisualizationData {
  type: 'FeatureCollection';
  features: NetworkFeature[];
}

const SpatialCard: React.FC = React.memo(() => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  const { data: networks, isLoading, error } = useQuery({
    queryKey: ['/api/v1/networks'],
    queryFn: () => api.getNetworks(500), // Limit for performance
    refetchInterval: 30000,
  });

  const { data: visualization, isLoading: vizLoading } = useQuery({
    queryKey: ['/api/v1/visualize'],
    queryFn: () => api.getVisualization(),
    refetchInterval: 30000,
  });

  // Check for Mapbox token
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;

  // Calculate bounding box and center from network data
  const mapBounds = useMemo(() => {
    if (!visualization?.data?.features || visualization.data.features.length === 0) {
      return {
        center: [-83.6968, 43.0234] as [number, number], // Default to detected area
        bounds: null,
        zoom: 12,
      };
    }

    const features = visualization.data.features;
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    // Handle single point case
    if (features.length === 1) {
      return {
        center: [features[0].geometry.coordinates[0], features[0].geometry.coordinates[1]] as [number, number],
        bounds: null,
        zoom: 15,
      };
    }

    // Calculate center and appropriate zoom
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;
    
    // Calculate appropriate zoom level
    const maxSpan = Math.max(lngSpan, latSpan);
    let zoom = 12;
    if (maxSpan < 0.01) zoom = 16;
    else if (maxSpan < 0.05) zoom = 14;
    else if (maxSpan < 0.1) zoom = 13;
    else if (maxSpan < 0.5) zoom = 11;
    else if (maxSpan < 1.0) zoom = 10;
    else zoom = 9;

    return {
      center: [centerLng, centerLat] as [number, number],
      bounds: new mapboxgl.LngLatBounds([minLng, minLat], [maxLng, maxLat]),
      zoom,
    };
  }, [visualization?.data]);

  // Initialize Mapbox with auto-centering
  useEffect(() => {
    if (!mapboxToken || map.current || !mapContainer.current || isLoading || vizLoading) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/standard',
        center: mapBounds.center,
        zoom: mapBounds.zoom,
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
    }
  }, [mapboxToken, isLoading, vizLoading, mapBounds]);

  // Update map bounds when data changes
  useEffect(() => {
    if (!map.current || !mapBounds.bounds) return;

    map.current.once('idle', () => {
      if (mapBounds.bounds) {
        map.current!.fitBounds(mapBounds.bounds, {
          padding: 50,
          maxZoom: 16,
          duration: 1000,
        });
      }
    });
  }, [mapBounds]);

  // Debounced viewport update for lazy loading
  const updateVisibleNetworks = useCallback(() => {
    if (!map.current || !visualization?.data?.features) return;

    const bounds = map.current.getBounds();
    const zoom = map.current.getZoom();
    
    // Limit markers based on zoom level for performance
    const maxMarkers = zoom > 14 ? 500 : zoom > 12 ? 300 : 200;
    
    const visibleFeatures = visualization.data.features
      .filter((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        return bounds.contains([lng, lat]);
      })
      .slice(0, maxMarkers);

    return visibleFeatures;
  }, [visualization?.data]);

  // Add network data to map with clustering and performance optimizations
  useEffect(() => {
    if (!map.current || !visualization?.data || !mapboxToken) return;

    const addNetworkData = () => {
      if (!map.current!.isStyleLoaded()) {
        map.current!.once('styledata', addNetworkData);
        return;
      }

      try {
        // Remove existing source if it exists
        if (map.current!.getSource('networks')) {
          map.current!.removeLayer('network-clusters');
          map.current!.removeLayer('network-cluster-count');
          map.current!.removeLayer('network-points');
          map.current!.removeSource('networks');
        }

        // Limit features for performance (max 1000 points)
        const features = visualization.data.features.slice(0, 1000);
        
        // Add network points source with clustering
        map.current!.addSource('networks', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features,
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Add cluster circles
        map.current!.addLayer({
          id: 'network-clusters',
          type: 'circle',
          source: 'networks',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#00d9e1',
              100,
              '#f59e0b',
              750,
              '#ef4444',
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              15,
              100,
              20,
              750,
              25,
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Add cluster count labels
        map.current!.addLayer({
          id: 'network-cluster-count',
          type: 'symbol',
          source: 'networks',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });

        // Add individual network points (non-clustered)
        map.current!.addLayer({
          id: 'network-points',
          type: 'circle',
          source: 'networks',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 4,
              16, 8,
            ],
            'circle-color': [
              'case',
              ['has', 'signal_strength'],
              [
                'interpolate',
                ['linear'],
                ['get', 'signal_strength'],
                -90,
                '#ef4444',
                -70,
                '#f59e0b',
                -50,
                '#10b981',
              ],
              '#00d9e1',
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Click handlers for both clusters and individual points
        map.current!.on('click', 'network-clusters', (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: ['network-clusters'],
          });
          const clusterId = features[0].properties?.cluster_id;
          (map.current!.getSource('networks') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;
              map.current!.easeTo({
                center: features[0].geometry.coordinates as [number, number],
                zoom: zoom!,
              });
            }
          );
        });

        map.current!.on('click', 'network-points', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const signalColor = feature.properties?.signal_strength > -70 ? '#10b981' : 
                              feature.properties?.signal_strength > -80 ? '#f59e0b' : '#ef4444';
            
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                `
                <div class="bg-slate-900 text-white p-4 rounded-lg border border-slate-600 max-w-xs">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${signalColor}"></div>
                    <strong class="text-teal-300">${feature.properties?.ssid || 'Hidden Network'}</strong>
                  </div>
                  <div class="space-y-1 text-sm">
                    <div><span class="text-gray-400">BSSID:</span> ${feature.properties?.bssid}</div>
                    <div><span class="text-gray-400">Signal:</span> ${feature.properties?.signal_strength || 'N/A'} dBm</div>
                    <div><span class="text-gray-400">Security:</span> ${feature.properties?.encryption || 'Unknown'}</div>
                    <div><span class="text-gray-400">Observed:</span> ${new Date(feature.properties?.observed_at).toLocaleDateString()}</div>
                  </div>
                </div>
              `
              )
              .addTo(map.current!);
          }
        });

        // Mouse cursor changes
        map.current!.on('mouseenter', 'network-clusters', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });
        
        map.current!.on('mouseleave', 'network-clusters', () => {
          map.current!.getCanvas().style.cursor = '';
        });

        map.current!.on('mouseenter', 'network-points', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });

        map.current!.on('mouseleave', 'network-points', () => {
          map.current!.getCanvas().style.cursor = '';
        });

      } catch (error) {
        console.error('Error adding network data to map:', error);
      }
    };

    addNetworkData();
  }, [visualization, mapboxToken]);

  if (isLoading || vizLoading) {
    return (
      <div className="glassy p-4 rounded-lg h-full flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <Activity size={20} className="text-teal-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-teal-300">Spatial Analysis</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <div className="text-gray-400">Loading network locations...</div>
            <div className="text-sm text-gray-500 mt-1">Preparing map visualization</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glassy p-4 rounded-lg h-full flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin size={20} className="text-red-400" />
          <h3 className="text-lg font-semibold text-red-300">Spatial Analysis</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-400">
            <div className="text-lg mb-2">⚠️ Error loading spatial data</div>
            <div className="text-sm">Unable to connect to mapping services</div>
          </div>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="glassy p-4 rounded-lg h-full flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle size={20} className="text-yellow-400" />
          <h3 className="text-lg font-semibold text-yellow-300">Spatial Analysis</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-yellow-400">
            <div className="text-lg mb-2">🗺️ Mapbox Token Required</div>
            <div className="text-sm">Set VITE_MAPBOX_ACCESS_TOKEN to enable map visualization</div>
          </div>
        </div>
      </div>
    );
  }

  const totalNetworks = networks?.data?.length || 0;
  const mappedNetworks = visualization?.data?.features?.length || 0;
  const coverage = totalNetworks > 0 ? Math.round((mappedNetworks / totalNetworks) * 100) : 0;

  return (
    <div className="glassy p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Globe size={20} className="text-teal-400" />
          <h3 className="text-lg font-semibold text-teal-300">Spatial Analysis</h3>
        </div>
        <div className="text-xs text-gray-400">
          {coverage}% coverage • {mappedNetworks.toLocaleString()} mapped
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="flex-1 w-full rounded-lg overflow-hidden bg-slate-800/50 min-h-[400px] relative"
      >
        {vizLoading && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-2"></div>
              <div className="text-sm text-gray-400">Loading map...</div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded bg-slate-800/50">
          <div className="text-sm font-bold text-cyan-300">
            {mappedNetworks.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Mapped</div>
        </div>
        <div className="text-center p-2 rounded bg-slate-800/50">
          <div className="text-sm font-bold text-green-300">
            {totalNetworks.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="text-center p-2 rounded bg-slate-800/50">
          <div className="text-sm font-bold text-purple-300">
            {Math.min(1000, mappedNetworks).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Rendered</div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-2 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">Strong (-50 to -70 dBm)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-400">Weak (-70 to -90 dBm)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-gray-400">Very Weak (&lt; -90 dBm)</span>
        </div>
      </div>
    </div>
  );
});

SpatialCard.displayName = 'SpatialCard';
export default SpatialCard;
