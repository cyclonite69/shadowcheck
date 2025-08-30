import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, Satellite, RotateCcw } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

export function SimpleGISInterface() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    refetchInterval: 300000,
  });

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/visualize'],
    refetchInterval: 30000,
  });

  const { data: networks } = useQuery({
    queryKey: ['/api/v1/g63/networks'],
    refetchInterval: 30000,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !(config as any)?.data?.mapboxToken) return;

    mapboxgl.accessToken = (config as any).data.mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-83.697, 43.023],
      zoom: 12,
      attributionControl: false
    });

    // Force map loaded state after creation
    setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [(config as any)?.data?.mapboxToken]);

  // Add data to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !(visualizationData as any)?.data?.features) return;

    const features = (visualizationData as any).data.features;

    // Remove existing source and layer
    if (map.current.getLayer('networks')) {
      map.current.removeLayer('networks');
    }
    if (map.current.getSource('networks')) {
      map.current.removeSource('networks');
    }

    // Add source
    map.current.addSource('networks', {
      type: 'geojson',
      data: (visualizationData as any).data
    });

    // Add layer
    map.current.addLayer({
      id: 'networks',
      type: 'circle',
      source: 'networks',
      paint: {
        'circle-radius': 6,
        'circle-color': '#00ffff',
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add popup on click
    map.current.on('click', 'networks', (e) => {
      const properties = e.features?.[0]?.properties;
      if (properties) {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 12px;">
              <h4>${properties.ssid || 'Hidden Network'}</h4>
              <p><strong>BSSID:</strong> ${properties.bssid}</p>
              <p><strong>Signal:</strong> ${properties.signal_strength} dBm</p>
            </div>
          `)
          .addTo(map.current!);
      }
    });

  }, [mapLoaded, visualizationData]);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Simple Network Visualization
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Map */}
      <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Map className="h-5 w-5" />
            Network Map ({(visualizationData as any)?.data?.features?.length || 0} networks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapContainer} 
            className="w-full h-96 rounded-lg overflow-hidden border border-border/30"
            style={{ minHeight: '384px' }}
          />
          {!mapLoaded && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple stats */}
      <Card className="border-green-500/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-400">{(networks as any)?.data?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Networks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">{(visualizationData as any)?.data?.features?.length || 0}</p>
              <p className="text-xs text-muted-foreground">On Map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}