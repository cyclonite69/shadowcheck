import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, MapPin, Filter, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Simple Mapbox GL JS implementation (enhanced version of original)
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

// Ensure mapbox-gl is available globally for debugging
(window as any).mapboxgl = mapboxgl;

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Expose debug info globally for testing
(window as any).mapboxDebug = {
  tokenAvailable: !!MAPBOX_ACCESS_TOKEN,
  mapboxglAvailable: typeof mapboxgl !== 'undefined',
  tokenLength: MAPBOX_ACCESS_TOKEN ? MAPBOX_ACCESS_TOKEN.length : 0
};

export default function SimpleKeplerMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [radioFilters, setRadioFilters] = useState({
    wifi: true,
    ble: true,
    bluetooth: true,
    cellular: true
  });

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/visualize'],
    refetchInterval: 30000,
  });

  // GPS functionality to center map on user location
  const handleGpsCenter = () => {
    if (!navigator.geolocation || !map.current) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.current!.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 1000
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('Initializing map with token:', MAPBOX_ACCESS_TOKEN ? 'Token provided' : 'No token');
    console.log('mapboxgl available:', typeof mapboxgl !== 'undefined');

    if (!MAPBOX_ACCESS_TOKEN) {
      console.error('VITE_MAPBOX_TOKEN is not set');
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-83.697, 43.023],
        zoom: 12,
        pitch: 0,
        bearing: 0
      });

      console.log('Map instance created successfully');

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current = mapInstance;

      // Wait for map to load before allowing data updates
      mapInstance.on('load', () => {
        console.log('Map loaded successfully and ready for data');
      });

      mapInstance.on('error', (e) => {
        console.error('Map error:', e);
      });

      return () => {
        if (mapInstance) {
          mapInstance.remove();
        }
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }, []);

  // Add/update data layers
  useEffect(() => {
    if (!map.current || !visualizationData) return;

    const updateMapData = () => {
      if (!map.current) return;

      const allFeatures = (visualizationData as any)?.data?.features || [];
      
      // Filter features based on radio type selection
      const filteredFeatures = allFeatures.filter((feature: any) => {
        const radioType = feature.properties.radio_type;
        return radioFilters[radioType as keyof typeof radioFilters];
      });

      // Create GeoJSON for filtered data
      const geojsonData = {
        type: 'FeatureCollection',
        features: filteredFeatures
      };

      // Check if source exists, if so just update the data
      if (map.current.getSource('networks')) {
        (map.current.getSource('networks') as mapboxgl.GeoJSONSource).setData(geojsonData as any);
        return;
      }

      // Add source and layers for the first time
      map.current.addSource('networks', {
        type: 'geojson',
        data: geojsonData as any
      });

      // Add circle layer for network points
      map.current.addLayer({
        id: 'networks-layer',
        type: 'circle',
        source: 'networks',
        paint: {
          'circle-radius': [
            'case',
            ['>=', ['get', 'signal_strength'], -40], 15,
            ['>=', ['get', 'signal_strength'], -60], 12,
            ['>=', ['get', 'signal_strength'], -80], 8,
            5
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'radio_type'], 'wifi'], '#22c55e',
            ['==', ['get', 'radio_type'], 'ble'], '#a855f7', 
            ['==', ['get', 'radio_type'], 'bluetooth'], '#3b82f6',
            ['==', ['get', 'radio_type'], 'cellular'], '#ef4444',
            '#9ca3af'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.6
        }
      });

      // Add labels for strong signals
      map.current.addLayer({
        id: 'networks-labels',
        type: 'symbol',
        source: 'networks',
        filter: ['>', ['get', 'signal_strength'], -50],
        layout: {
          'text-field': ['get', 'ssid'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 11,
          'text-anchor': 'bottom',
          'text-offset': [0, -1.5],
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      // Add popup on click (only once)
      map.current.on('click', 'networks-layer', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['networks-layer']
        });

        if (!features?.length) return;

        const feature = features[0];
        const props = feature.properties;

        if (!props) return;

        const popupContent = `
          <div class="premium-card p-3 max-w-xs text-sm">
            <div class="font-medium text-slate-200 mb-1">${props.ssid || 'Hidden Network'}</div>
            <div class="text-xs text-slate-400 font-mono mb-2">${props.bssid || 'N/A'}</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-slate-400">Type:</span>
                <div class="text-slate-300 capitalize">${props.radio_type || 'Unknown'}</div>
              </div>
              <div>
                <span class="text-slate-400">Signal:</span>
                <div class="text-slate-300">${props.signal_strength || 'N/A'}dBm</div>
              </div>
              <div>
                <span class="text-slate-400">Security:</span>
                <div class="text-slate-300">${props.security_level || 'Unknown'}</div>
              </div>
              <div>
                <span class="text-slate-400">Freq:</span>
                <div class="text-slate-300">${props.frequency || 'N/A'}MHz</div>
              </div>
            </div>
          </div>
        `;

        new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: true,
          className: 'mapbox-popup-custom'
        })
          .setLngLat((e.lngLat as any))
          .setHTML(popupContent)
          .addTo(map.current!);
      });

      // Change cursor on hover (only once)
      map.current.on('mouseenter', 'networks-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'networks-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    };

    // Wait for map to be ready before adding data
    if (map.current.loaded()) {
      updateMapData();
    } else {
      map.current.on('load', updateMapData);
    }

  }, [visualizationData, radioFilters]);

  const processNetworkData = () => {
    if (!visualizationData) return [];

    const allFeatures = (visualizationData as any)?.data?.features || [];
    
    return allFeatures.filter((feature: any) => {
      const radioType = feature.properties.radio_type;
      return radioFilters[radioType as keyof typeof radioFilters];
    });
  };

  const networkData = processNetworkData();

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Map */}
      <div className="premium-card">
        <CardHeader>
          <CardTitle className="text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="icon-container w-8 h-8 mr-2">
                <Map className="h-4 w-4 text-cyan-300" />
              </div>
              Enhanced SIGINT Visualization ({networkData.length} observations)
            </div>
            <div className="flex items-center gap-2">
              {/* GPS Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGpsCenter}
                className="gap-2 premium-card hover:scale-105"
              >
                <MapPin className="h-4 w-4" />
                GPS Center
              </Button>
              
              {/* Radio Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 premium-card hover:scale-105">
                    <Filter className="h-4 w-4" />
                    Radio Types
                    <div className="silver-accent px-2 py-1 rounded-full ml-1">
                      <span className="text-xs font-semibold text-slate-700">
                        {Object.values(radioFilters).filter(Boolean).length}/4
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 premium-card">
                  <DropdownMenuLabel>Filter by Radio Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.wifi}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, wifi: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      WiFi Networks
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.ble}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, ble: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      BLE Beacons
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.bluetooth}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, bluetooth: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Bluetooth Devices
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={radioFilters.cellular}
                    onCheckedChange={(checked) => 
                      setRadioFilters(prev => ({ ...prev, cellular: checked }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Cellular Towers
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
              className="w-full h-[500px] rounded-lg overflow-hidden border border-border/30"
              style={{ minHeight: '500px' }}
            />
          </div>
        </CardContent>
      </div>

      {/* Individual Observations List */}
      <div className="premium-card">
        <CardHeader>
          <CardTitle className="text-slate-300 flex items-center gap-2">
            <div className="icon-container w-8 h-8 mr-2">
              <Activity className="h-4 w-4 text-green-300" />
            </div>
            Individual Observations ({networkData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {networkData.map((feature: any, index: number) => {
              const props = feature.properties;
              const coords = feature.geometry?.coordinates;
              
              // Color mapping for radio types
              const getRadioColor = (type: string) => {
                switch (type) {
                  case 'wifi': return 'bg-green-500';
                  case 'ble': return 'bg-purple-500'; 
                  case 'bluetooth': return 'bg-blue-500';
                  case 'cellular': return 'bg-red-500';
                  default: return 'bg-slate-500';
                }
              };
              
              return (
                <div key={index} className="p-3 border border-border/30 rounded-lg bg-background/40 hover:bg-muted/50 transition-colors">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-200">{props.ssid || 'Hidden Network'}</p>
                      <p className="text-xs text-slate-400 font-mono">{props.bssid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Radio Type</p>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getRadioColor(props.radio_type)}`}></div>
                        <span className="text-xs font-medium capitalize text-slate-300">{props.radio_type}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Signal: {props.signal_strength}dBm</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="text-xs font-mono text-slate-300">
                        {coords ? `${coords[1]?.toFixed(4)}, ${coords[0]?.toFixed(4)}` : 'N/A'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Security: {props.security_level || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {networkData.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No observation data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </div>
  );
}