import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import { api } from '@/lib/api';

export function MapVisualization() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: () => api.getConfig(),
  });

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/visualize'],
    queryFn: () => api.getVisualization(),
    refetchInterval: 30000,
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['/api/v1/status'],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!mapContainer.current || map.current || !config?.mapboxToken) return;

    // Set Mapbox access token
    mapboxgl.accessToken = config.mapboxToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 12,
      attributionControl: false
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [config?.mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !visualizationData?.data) return;

    const geojsonData = visualizationData.data;

    // Remove existing layers and sources
    if (map.current.getLayer('networks-layer')) {
      map.current.removeLayer('networks-layer');
    }
    if (map.current.getLayer('networks-heatmap')) {
      map.current.removeLayer('networks-heatmap');
    }
    if (map.current.getSource('networks')) {
      map.current.removeSource('networks');
    }

    // Add source
    map.current.addSource('networks', {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'networks-heatmap',
      type: 'heatmap',
      source: 'networks',
      maxzoom: 9,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'signal_strength'],
          -100, 0,
          -30, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 212, 255, 0)',
          0.2, 'rgba(0, 212, 255, 0.2)',
          0.4, 'rgba(154, 230, 180, 0.4)',
          0.6, 'rgba(255, 235, 59, 0.6)',
          0.8, 'rgba(255, 152, 0, 0.8)',
          1, 'rgba(244, 67, 54, 1)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          9, 20
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          9, 0
        ]
      }
    });

    // Add circle layer for individual points
    map.current.addLayer({
      id: 'networks-layer',
      type: 'circle',
      source: 'networks',
      minzoom: 9,
      paint: {
        'circle-color': [
          'case',
          ['==', ['get', 'encryption'], 'Open'], '#f44336',
          ['==', ['get', 'encryption'], 'WPA2'], '#ff9800',
          ['==', ['get', 'encryption'], 'WPA3'], '#4caf50',
          '#00d4ff'
        ],
        'circle-radius': [
          'step',
          ['zoom'],
          4,
          11, 6,
          16, 8
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add click event for popups
    map.current.on('click', 'networks-layer', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const { ssid, bssid, signal_strength, encryption, observed_at } = feature.properties as any;

      new mapboxgl.Popup({ offset: 25 })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="bg-card border border-border rounded-lg p-3 text-sm">
            <div class="font-semibold text-primary mb-2">
              ${ssid || 'Hidden Network'}
            </div>
            <div class="space-y-1 text-xs">
              <div><span class="text-muted-foreground">BSSID:</span> <span class="font-mono">${bssid}</span></div>
              <div><span class="text-muted-foreground">Signal:</span> ${signal_strength} dBm</div>
              <div><span class="text-muted-foreground">Security:</span> ${encryption}</div>
              <div><span class="text-muted-foreground">Observed:</span> ${new Date(observed_at).toLocaleString()}</div>
            </div>
          </div>
        `)
        .addTo(map.current!);
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'networks-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'networks-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

  }, [mapLoaded, visualizationData]);

  const isConnected = systemStatus?.database.connected;

  if (!isConnected) {
    return (
      <div className="bg-card rounded-lg border border-border h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-database text-2xl text-muted-foreground"></i>
            </div>
            <h4 className="text-lg font-medium mb-2">Database Required</h4>
            <p className="text-muted-foreground">
              Map visualization requires an active database connection
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-map text-primary text-lg"></i>
            <div>
              <h3 className="text-lg font-semibold">Network Geospatial Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Interactive map showing {visualizationData?.count || 0} network observations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>WPA2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>WPA3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="h-96 w-full"
          data-testid="map-container"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg px-4 py-2">
              <i className="fas fa-spinner animate-spin mr-2"></i>
              Loading network data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}