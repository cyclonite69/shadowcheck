import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import { api } from '@/lib/api';
import { NetworkDataTable } from '@/components/network-data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { generateColorFromBSSID } from '@/lib/color-utils';
import { Map, Table, RotateCcw, Maximize2, Satellite } from 'lucide-react';

export function UnifiedGISInterface() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visibleNetworks, setVisibleNetworks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'table'>('split');

  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: () => api.getConfig(),
  });

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/visualize'],
    queryFn: () => api.getG63Visualization(),
    refetchInterval: 30000,
  });

  const { data: networks } = useQuery({
    queryKey: ['/api/v1/g63/networks'],
    queryFn: () => api.getG63Networks(1000),
    refetchInterval: 30000,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !config?.mapboxToken) {
      return;
    }

    mapboxgl.accessToken = config.mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-83.697, 43.023],
        zoom: 12,
        attributionControl: false
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('style.load', () => {
        if (!mapLoaded) {
          setMapLoaded(true);
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      // Fallback for map loading
      setTimeout(() => {
        if (map.current && !mapLoaded) {
          setMapLoaded(true);
        }
      }, 5000);

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [config?.mapboxToken]);

  // Update map layers when data or visibility changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !visualizationData?.data || !networks?.data) {
      return;
    }

    try {
      // Remove existing layers
    ['g63-networks-visible', 'g63-networks-hidden', 'g63-networks-clusters', 'g63-cluster-count'].forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
    });

    if (map.current.getSource('g63-networks')) {
      map.current.removeSource('g63-networks');
    }

    // Create filtered GeoJSON for visible networks
    const visibleFeatures = visualizationData.data.features.filter((feature: any) => 
      visibleNetworks.size === 0 || visibleNetworks.has(feature.properties.bssid)
    );

    const hiddenFeatures = visualizationData.data.features.filter((feature: any) => 
      visibleNetworks.size > 0 && !visibleNetworks.has(feature.properties.bssid)
    );

    // Add visible networks
    if (visibleFeatures.length > 0) {
      map.current.addSource('g63-networks-visible', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: visibleFeatures
        }
      });

      map.current.addLayer({
        id: 'g63-networks-visible',
        type: 'circle',
        source: 'g63-networks-visible',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'signal_strength'],
            -90, 6,
            -30, 12
          ],
          'circle-color': [
            'case',
            ['has', 'bssid'],
            ['literal', '#00ffff'],
            '#666666'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });

      // Add popups for visible networks
      map.current.on('click', 'g63-networks-visible', (e) => {
        const properties = e.features?.[0]?.properties;
        if (properties) {
          const color = generateColorFromBSSID(properties.bssid);
          
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-4 h-4 rounded" style="background-color: ${color.hex}"></div>
                  <strong class="text-sm">${properties.ssid || 'Hidden Network'}</strong>
                </div>
                <div class="space-y-1 text-xs">
                  <div><strong>BSSID:</strong> ${properties.bssid}</div>
                  <div><strong>Signal:</strong> ${properties.signal_strength} dBm</div>
                  <div><strong>Security:</strong> ${properties.capabilities}</div>
                  <div><strong>Frequency:</strong> ${properties.frequency || 'N/A'} MHz</div>
                </div>
              </div>
            `)
            .addTo(map.current!);
        }
      });
    }

    // Add hidden networks as dimmed points
    if (hiddenFeatures.length > 0) {
      map.current.addSource('g63-networks-hidden', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: hiddenFeatures
        }
      });

      map.current.addLayer({
        id: 'g63-networks-hidden',
        type: 'circle',
        source: 'g63-networks-hidden',
        paint: {
          'circle-radius': 4,
          'circle-color': '#444444',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#666666',
          'circle-opacity': 0.3
        }
      });
    }

    // Update individual point colors based on BSSID
    if (visibleFeatures.length > 0) {
      const colorExpression: any[] = ['case'];
      
      visibleFeatures.forEach((feature: any) => {
        const color = generateColorFromBSSID(feature.properties.bssid);
        colorExpression.push(['==', ['get', 'bssid'], feature.properties.bssid]);
        colorExpression.push(color.hex);
      });
      
      colorExpression.push('#00ffff'); // Default color
      
      map.current.setPaintProperty('g63-networks-visible', 'circle-color', colorExpression as any);
    }

    } catch (error) {
      console.error('Error updating map layers:', error);
    }
  }, [mapLoaded, visualizationData, visibleNetworks, networks]);

  // Initialize all networks as visible
  useEffect(() => {
    if (networks?.data && visibleNetworks.size === 0) {
      const allBssids = new Set(networks.data.map(n => n.bssid));
      setVisibleNetworks(allBssids);
    }
  }, [networks?.data]);

  const handleNetworkToggle = (bssid: string, visible: boolean) => {
    setVisibleNetworks(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(bssid);
      } else {
        newSet.delete(bssid);
      }
      return newSet;
    });
  };

  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [-83.697, 43.023],
        zoom: 12,
        essential: true
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* View Controls */}
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              G63 Forensics GIS Interface
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('split')}
                data-testid="view-split"
              >
                Split View
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
                data-testid="view-map"
              >
                <Map className="h-4 w-4 mr-1" />
                Map Only
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                data-testid="view-table"
              >
                <Table className="h-4 w-4 mr-1" />
                Table Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                data-testid="reset-map-view"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <div className={`grid gap-6 ${
        viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {/* Map Visualization */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Map className="h-5 w-5" />
                Interactive Map ({visibleNetworks.size} networks visible)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapContainer} 
                className="w-full h-96 rounded-lg overflow-hidden border border-border/30"
                data-testid="gis-map"
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
        )}

        {/* Data Table */}
        {(viewMode === 'split' || viewMode === 'table') && (
          <NetworkDataTable 
            onNetworkToggle={handleNetworkToggle}
            visibleNetworks={visibleNetworks}
          />
        )}
      </div>

      {/* Statistics Summary */}
      <Card className="border-green-500/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-400">{networks?.data?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Networks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">{visibleNetworks.size}</p>
              <p className="text-xs text-muted-foreground">Visible on Map</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-400">
                {new Set(Array.from(visibleNetworks).map(bssid => 
                  networks?.data?.find(n => n.bssid === bssid)?.ssid
                ).filter(Boolean)).size}
              </p>
              <p className="text-xs text-muted-foreground">Unique SSIDs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-400">
                {Array.from(visibleNetworks).map(bssid => 
                  networks?.data?.find(n => n.bssid === bssid)?.bestlevel
                ).filter(level => level && level > -60).length}
              </p>
              <p className="text-xs text-muted-foreground">Strong Signals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}