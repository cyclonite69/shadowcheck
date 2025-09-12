import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Map, Filter, MapPin, Activity, Layers, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import mapboxgl from 'mapbox-gl';
import { wireTooltipNetwork } from '@/components/Map/wireTooltipNetwork';

type MapMode = 'standard' | 'vector-tiles';

export default function NetworkMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>('standard');
  const [tilesAvailable, setTilesAvailable] = useState(false);
  const [radioFilters, setRadioFilters] = useState({
    wifi: true,
    ble: true,
    bluetooth: true,
    cellular: true,
  });

  // GPS functionality to center map on user location
  const handleGpsCenter = () => {
    if (!map.current) return;

    setGpsLoading(true);

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 2000,
        });
        setGpsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['/api/v1/config'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3,
  });

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/visualize'],
    refetchInterval: 30000,
  });

  const { data: _analytics } = useQuery({
    queryKey: ['/api/v1/analytics'],
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
        containerDims: mapContainer.current
          ? `${mapContainer.current.offsetWidth}x${mapContainer.current.offsetHeight}`
          : 'N/A',
      });

      mapboxgl.accessToken = token;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-83.697, 43.023],
          zoom: 12,
        });

        map.current.on('load', () => {
          console.log('Map loaded successfully');
          setMapLoaded(true);
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
        });
      } catch (error) {
        console.error('Failed to initialize Mapbox:', error);
      }
    };

    initMap();
  }, [config, configLoading]);

  // Check if vector tiles are available
  useEffect(() => {
    const checkTilesAvailability = async () => {
      try {
        const response = await fetch('/tiles/networks.pmtiles', { method: 'HEAD' });
        setTilesAvailable(response.ok);
      } catch {
        setTilesAvailable(false);
      }
    };
    checkTilesAvailability();
  }, []);

  // Clean up existing layers and sources
  const cleanupMap = () => {
    if (!map.current) return;

    // Remove existing layers
    ['networks', 'networks-vector'].forEach((layerId) => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
    });

    // Remove existing sources
    ['networks', 'networks-vector'].forEach((sourceId) => {
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }
    });
  };

  // Standard GeoJSON mode
  const setupStandardMode = (filteredFeatures: any[]) => {
    if (!map.current) return;

    map.current.addSource('networks', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredFeatures,
      },
    });

    map.current.addLayer({
      id: 'networks',
      type: 'circle',
      source: 'networks',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'signal_strength'],
          -100,
          4, // Weak signal
          -80,
          6, // Medium signal
          -60,
          8, // Strong signal
          -40,
          10, // Very strong signal
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'radio_type'], 'wifi'],
          '#22c55e',
          ['==', ['get', 'radio_type'], 'ble'],
          '#8b5cf6',
          ['==', ['get', 'radio_type'], 'bluetooth'],
          '#3b82f6',
          ['==', ['get', 'radio_type'], 'cellular'],
          '#dc2626',
          '#6b7280',
        ],
        'circle-stroke-width': [
          'case',
          ['==', ['get', 'security_level'], 'high'],
          2,
          ['==', ['get', 'security_level'], 'medium'],
          1.5,
          ['==', ['get', 'security_level'], 'low'],
          1,
          ['==', ['get', 'security_level'], 'none'],
          3,
          1,
        ],
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'security_level'], 'high'],
          '#16a34a',
          ['==', ['get', 'security_level'], 'medium'],
          '#ca8a04',
          ['==', ['get', 'security_level'], 'low'],
          '#ea580c',
          ['==', ['get', 'security_level'], 'none'],
          '#dc2626',
          '#9ca3af',
        ],
        'circle-opacity': 0.8,
      },
    });

    // Wire tooltip for standard mode
    wireTooltipNetwork(map.current, 'networks');
  };

  // Vector tiles mode (PMTiles)
  const setupVectorMode = () => {
    if (!map.current) return;

    // Add PMTiles source
    map.current.addSource('networks-vector', {
      type: 'vector',
      url: '/api/v1/tiles/{z}/{x}/{y}.mvt', // Dynamic tile endpoint
      maxzoom: 16,
      minzoom: 8,
    });

    // Radio type filter for vector tiles
    const radioTypeFilter = Object.entries(radioFilters)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => ['==', ['get', 'radio_type'], type]);

    const radioFilter =
      radioTypeFilter.length > 0 ? ['any', ...radioTypeFilter] : ['literal', true];

    map.current.addLayer({
      id: 'networks-vector',
      type: 'circle',
      source: 'networks-vector',
      'source-layer': 'networks',
      filter: radioFilter,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          ['case', ['<', ['get', 'signal_strength'], -80], 2, 4],
          16,
          ['case', ['<', ['get', 'signal_strength'], -80], 6, 12],
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'radio_type'], 'wifi'],
          '#22c55e',
          ['==', ['get', 'radio_type'], 'ble'],
          '#8b5cf6',
          ['==', ['get', 'radio_type'], 'bluetooth'],
          '#3b82f6',
          ['==', ['get', 'radio_type'], 'cellular'],
          '#dc2626',
          '#6b7280',
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9,
      },
    });

    // Wire tooltip for vector mode
    wireTooltipNetwork(map.current, 'networks-vector');
  };

  // Update map data when mode, visualization data, or filters change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    cleanupMap();

    if (mapMode === 'vector-tiles' && tilesAvailable) {
      setupVectorMode();
    } else {
      // Fallback to standard mode
      if (!visualizationData) return;

      const allFeatures = (visualizationData as any)?.data?.features || [];
      const filteredFeatures = allFeatures.filter((feature: any) => {
        const radioType = feature.properties.radio_type;
        return radioFilters[radioType as keyof typeof radioFilters];
      });

      setupStandardMode(filteredFeatures);
    }
  }, [mapLoaded, mapMode, visualizationData, radioFilters, tilesAvailable]);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Map */}
      <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Observation Map (
              {(visualizationData as any)?.data?.features?.filter(
                (f: any) => radioFilters[f.properties.radio_type as keyof typeof radioFilters]
              ).length || 0}{' '}
              sightings)
            </div>
            <div className="flex items-center gap-2">
              {/* Map Mode Toggle */}
              <ToggleGroup
                type="single"
                value={mapMode}
                onValueChange={(value: MapMode) => value && setMapMode(value)}
                className="border rounded-md"
              >
                <ToggleGroupItem value="standard" aria-label="Standard mode" size="sm">
                  <Layers className="h-4 w-4 mr-1" />
                  Standard
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="vector-tiles"
                  aria-label="Vector tiles mode"
                  size="sm"
                  disabled={!tilesAvailable}
                  className="relative"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Vector
                  {!tilesAvailable && (
                    <Badge variant="outline" className="absolute -top-1 -right-1 text-xs px-1">
                      N/A
                    </Badge>
                  )}
                </ToggleGroupItem>
              </ToggleGroup>

              {/* GPS Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGpsCenter}
                disabled={gpsLoading || !mapLoaded}
                className="gap-2"
              >
                {gpsLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                GPS
              </Button>

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
                      setRadioFilters((prev) => ({ ...prev, wifi: checked }))
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
                      setRadioFilters((prev) => ({ ...prev, ble: checked }))
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
                      setRadioFilters((prev) => ({ ...prev, bluetooth: checked }))
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
                      setRadioFilters((prev) => ({ ...prev, cellular: checked }))
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

      {/* Individual Observations List */}
      <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-700 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Individual Observations ({(visualizationData as any)?.data?.features?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {((visualizationData as any)?.data?.features || []).map(
              (feature: any, index: number) => {
                const props = feature.properties;
                const coords = feature.geometry?.coordinates;
                return (
                  <div
                    key={index}
                    className="p-3 border border-border/30 rounded-lg bg-background/40 hover:bg-muted/50 transition-colors"
                  >
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">
                          {props.ssid || 'Hidden Network'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{props.bssid}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Radio Type</p>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              props.radio_type === 'wifi'
                                ? 'bg-green-600'
                                : props.radio_type === 'ble'
                                  ? 'bg-purple-600'
                                  : props.radio_type === 'bluetooth'
                                    ? 'bg-blue-600'
                                    : props.radio_type === 'cellular'
                                      ? 'bg-red-600'
                                      : 'bg-slate-500'
                            }`}
                          ></div>
                          <span className="text-xs font-medium capitalize">{props.radio_type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Signal: {props.signal_strength}dBm
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-xs font-mono text-foreground">
                          {coords ? `${coords[1]?.toFixed(4)}, ${coords[0]?.toFixed(4)}` : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Security: {props.security_level || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
            {((visualizationData as any)?.data?.features || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No observation data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
