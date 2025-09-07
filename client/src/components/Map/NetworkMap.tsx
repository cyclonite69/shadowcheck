import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Map, Satellite, RotateCcw, Filter, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import mapboxgl from 'mapbox-gl';
import { wireTooltipNetwork } from '@/components/Map/wireTooltipNetwork';

export default function NetworkMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [radioFilters, setRadioFilters] = useState({
    wifi: true,
    ble: true,
    bluetooth: true,
    cellular: true
  });

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['/api/v1/config'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3,
  });

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/visualize'],
    refetchInterval: 30000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/v1/g63/analytics'],
    refetchInterval: 30000,
  });

  // Initialize map with proper timing
  useEffect(() => {
    const token = (config as any)?.mapboxToken;
    
    if (configLoading) {
      console.log('Config loading...');
      return;
    }
    
    if (!token) {
      console.log('Waiting for Mapbox token...', { config, hasConfig: !!config });
      return;
    }
    
    console.log('Token available, proceeding with map init');
    
    if (map.current) {
      console.log('Map already exists');
      return;
    }

    // Use setTimeout to ensure DOM is ready
    const initMap = () => {
      if (!mapContainer.current) {
        console.log('Container not ready, retrying...');
        setTimeout(initMap, 100);
        return;
      }

      console.log('Initializing Mapbox...', { 
        hasToken: !!token, 
        hasContainer: !!mapContainer.current,
        containerDims: mapContainer.current ? `${mapContainer.current.offsetWidth}x${mapContainer.current.offsetHeight}` : 'N/A'
      });
      
      mapboxgl.accessToken = token;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-83.697, 43.023],
          zoom: 12,
          attributionControl: false,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
          interactive: true,
          trackResize: true
        });
        console.log('Map instance created successfully');
        
        // Enhanced event listeners
        map.current.on('load', () => {
          console.log('Map loaded successfully');
          setMapLoaded(true);
        });
        
        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
      } catch (error) {
        console.error('Error creating map:', error);
        return;
      }
    };

    // Start initialization after a small delay
    setTimeout(initMap, 50);

    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [(config as any)?.data?.mapboxToken]);

  // Add data to map with filtering
  useEffect(() => {
    if (!map.current || !mapLoaded || !(visualizationData as any)?.data?.features) return;

    const allFeatures = (visualizationData as any).data.features;
    
    // Filter features based on radio type selection
    const filteredFeatures = allFeatures.filter((feature: any) => {
      const radioType = feature.properties.radio_type;
      return radioFilters[radioType as keyof typeof radioFilters];
    });

    // Remove existing source and layer
    if (map.current.getLayer('networks')) {
      map.current.removeLayer('networks');
    }
    if (map.current.getSource('networks')) {
      map.current.removeSource('networks');
    }

    // Add source with filtered data
    map.current.addSource('networks', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredFeatures
      }
    });

    // Add layer with radio type coloring and signal strength sizing
    map.current.addLayer({
      id: 'networks',
      type: 'circle',
      source: 'networks',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'signal_strength'],
          -100, 4,  // Weak signal
          -80, 6,   // Medium signal
          -60, 8,   // Strong signal
          -40, 10   // Very strong signal
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'radio_type'], 'wifi'], '#22c55e',     // Muted green for WiFi
          ['==', ['get', 'radio_type'], 'ble'], '#8b5cf6',      // Muted purple for BLE
          ['==', ['get', 'radio_type'], 'bluetooth'], '#3b82f6', // Muted blue for Bluetooth
          ['==', ['get', 'radio_type'], 'cellular'], '#dc2626', // Muted red for Cellular
          '#6b7280'  // Muted gray for unknown
        ],
        'circle-stroke-width': [
          'case',
          ['==', ['get', 'security_level'], 'high'], 2,    // Thick border for high security
          ['==', ['get', 'security_level'], 'medium'], 1.5, // Medium border
          ['==', ['get', 'security_level'], 'low'], 1,     // Thin border for low security
          ['==', ['get', 'security_level'], 'none'], 3,    // Very thick border for open networks
          1  // Default
        ],
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'security_level'], 'high'], '#16a34a',   // Muted green for high security
          ['==', ['get', 'security_level'], 'medium'], '#ca8a04', // Muted yellow for medium
          ['==', ['get', 'security_level'], 'low'], '#ea580c',    // Muted orange for low
          ['==', ['get', 'security_level'], 'none'], '#dc2626',   // Muted red for open
          '#9ca3af'  // Muted gray for unknown
        ],
        'circle-opacity': 0.8
      }
    });

    // auto-wired tooltip
    if (map.current) { 
      wireTooltipNetwork(map.current, "networks"); 
    }

  }, [mapLoaded, visualizationData, radioFilters]);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-600 flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Simple Observation Visualization
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Map */}
      <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Observation Map ({(visualizationData as any)?.data?.features?.filter((f: any) => 
                radioFilters[f.properties.radio_type as keyof typeof radioFilters]
              ).length || 0} sightings)
            </div>
            <div className="flex items-center gap-2">
              {/* Radio Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Radio Types
                    <Badge variant="secondary" className="ml-1">
                      {Object.values(radioFilters).filter(Boolean).length}/4
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Radio Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.wifi}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, wifi: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      WiFi
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.ble}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, ble: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      BLE
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.bluetooth}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, bluetooth: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      Bluetooth
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.cellular}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, cellular: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      Cellular
                    </span>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div 
              ref={mapContainer} 
              className="w-full h-96 rounded-lg overflow-hidden border border-border/30"
              style={{ minHeight: '384px' }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Initializing Mapbox...</p>
                  <p className="text-xs text-muted-foreground mt-1">Check console for debug info</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simple stats */}
      <Card className="border-green-500/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">{Number((analytics as any)?.data?.overview?.unique_ssids) || 0}</p>
              <p className="text-xs text-muted-foreground">Distinct Observations</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{(visualizationData as any)?.data?.features?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Sightings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}