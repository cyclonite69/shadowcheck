import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Satellite } from 'lucide-react';

export function G63MapVisualization() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: () => api.getConfig(),
  });

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/visualize'],
    queryFn: () => api.getG63Visualization(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!mapContainer.current || map.current || !config?.mapboxToken) return;

    mapboxgl.accessToken = config.mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-83.697, 43.023], // Center on the G63 data area (Michigan)
      zoom: 14,
      attributionControl: false
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

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
    if (map.current.getLayer('g63-networks-layer')) {
      map.current.removeLayer('g63-networks-layer');
    }
    if (map.current.getLayer('g63-networks-heatmap')) {
      map.current.removeLayer('g63-networks-heatmap');
    }
    if (map.current.getSource('g63-networks')) {
      map.current.removeSource('g63-networks');
    }

    // Add G63 data source
    map.current.addSource('g63-networks', {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add clustered circles
    map.current.addLayer({
      id: 'g63-networks-clusters',
      type: 'circle',
      source: 'g63-networks',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#00ffff',
          100,
          '#ff6b6b',
          750,
          '#ffd93d'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#00ffff'
      }
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'g63-cluster-count',
      type: 'symbol',
      source: 'g63-networks',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#000000'
      }
    });

    // Add individual points
    map.current.addLayer({
      id: 'g63-networks-layer',
      type: 'circle',
      source: 'g63-networks',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['>=', ['get', 'signal_strength'], -40], '#00ff00', // Strong signal
          ['>=', ['get', 'signal_strength'], -60], '#ffff00', // Medium signal
          ['>=', ['get', 'signal_strength'], -80], '#ff8800', // Weak signal
          '#ff0000' // Very weak signal
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 4,
          18, 8
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add click event for popups
    map.current.on('click', 'g63-networks-layer', (e) => {
      if (!e.features?.[0]) return;
      
      const feature = e.features[0];
      const props = feature.properties;
      
      if (!props) return;
      
      const popup = new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-3 bg-black/90 text-white rounded border border-cyan-500/30">
            <h3 class="font-bold text-cyan-400 mb-2">${props.ssid || 'Hidden Network'}</h3>
            <div class="space-y-1 text-xs">
              <div><strong>BSSID:</strong> <span class="font-mono">${props.bssid || 'Unknown'}</span></div>
              <div><strong>Signal:</strong> ${props.signal_strength || 'Unknown'} dBm</div>
              <div><strong>Frequency:</strong> ${props.frequency || 'Unknown'} MHz</div>
              <div><strong>Security:</strong> ${props.capabilities || 'Unknown'}</div>
              <div><strong>Last Seen:</strong> ${props.lasttime ? new Date(props.lasttime).toLocaleString() : 'Unknown'}</div>
            </div>
          </div>
        `)
        .addTo(map.current!);
    });

    // Fit bounds to show all data
    if (geojsonData.features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      geojsonData.features.forEach((feature: any) => {
        bounds.extend(feature.geometry.coordinates);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

  }, [mapLoaded, visualizationData]);

  if (!config?.mapboxToken) {
    return (
      <Card className="border-red-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Mapbox Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mapbox access token is required for G63 forensics visualization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          G63 Forensics Visualization
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
            {visualizationData?.count || 0} Networks
          </Badge>
          {isLoading && (
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
              Loading...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <Skeleton className="w-full h-[600px]" />
        ) : (
          <div
            ref={mapContainer}
            className="w-full h-[600px] rounded-b-lg"
            data-testid="g63-map-container"
          />
        )}
      </CardContent>
    </Card>
  );
}