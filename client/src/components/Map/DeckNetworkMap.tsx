import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Map, MapPin, Filter, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Deck.gl imports
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { Map as ReactMapGL } from 'react-map-gl';

// Type declarations for deck.gl (since they're not available)
declare module '@deck.gl/react';
declare module '@deck.gl/layers';
declare module 'react-map-gl';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: -83.697,
  latitude: 43.023,
  zoom: 12,
  pitch: 0,
  bearing: 0
};

export default function DeckNetworkMap() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
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
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState({
          ...viewState,
          latitude,
          longitude,
          zoom: 14
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

  // Process data for Deck.gl layers
  const processNetworkData = () => {
    if (!visualizationData) return [];

    const allFeatures = (visualizationData as any)?.data?.features || [];
    
    // Filter features based on radio type selection
    const filteredFeatures = allFeatures.filter((feature: any) => {
      const radioType = feature.properties.radio_type;
      return radioFilters[radioType as keyof typeof radioFilters];
    });

    // Convert GeoJSON features to Deck.gl data format
    return filteredFeatures.map((feature: any) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const props = feature.properties;
      
      // Color mapping for radio types
      const getRadioColor = (type: string) => {
        switch (type) {
          case 'wifi': return [34, 197, 94]; // Green
          case 'ble': return [168, 85, 247]; // Purple  
          case 'bluetooth': return [59, 130, 246]; // Blue
          case 'cellular': return [239, 68, 68]; // Red
          default: return [156, 163, 175]; // Gray
        }
      };

      // Size mapping based on signal strength
      const getSignalSize = (signal: number) => {
        if (signal >= -40) return 15;
        if (signal >= -60) return 12;
        if (signal >= -80) return 8;
        return 5;
      };

      return {
        position: [longitude, latitude],
        color: getRadioColor(props.radio_type),
        radius: getSignalSize(props.signal_strength || -70),
        ssid: props.ssid || 'Hidden Network',
        bssid: props.bssid,
        radioType: props.radio_type,
        signalStrength: props.signal_strength,
        securityLevel: props.security_level,
        frequency: props.frequency
      };
    });
  };

  const networkData = processNetworkData();

  // Create the scatterplot layer for network points
  const scatterplotLayer = new ScatterplotLayer({
    id: 'networks-scatterplot',
    data: networkData,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 3,
    radiusMaxPixels: 20,
    lineWidthMinPixels: 1,
    getPosition: (d: any) => d.position,
    getRadius: (d: any) => d.radius,
    getFillColor: (d: any) => d.color,
    getLineColor: [255, 255, 255, 150],
    onHover: (info) => {
      // Custom tooltip handling could be added here
      return true;
    }
  });

  // Create text labels for important networks
  const textLayer = new TextLayer({
    id: 'network-labels',
    data: networkData.filter((d: any) => d.signalStrength > -50), // Only show labels for strong signals
    pickable: false,
    getPosition: (d: any) => d.position,
    getText: (d: any) => d.ssid,
    getSize: 12,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    getColor: [255, 255, 255, 180],
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 'bold'
  });

  const layers = [scatterplotLayer, textLayer];

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
              Advanced SIGINT Visualization ({networkData.length} observations)
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
              className="w-full h-[500px] rounded-lg overflow-hidden border border-border/30"
              style={{ minHeight: '500px' }}
            >
              <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                layers={layers}
                onViewStateChange={(evt: any) => setViewState(evt.viewState)}
                viewState={viewState}
                getTooltip={({object}: {object: any}) => {
                  if (!object) return null;
                  return {
                    html: `
                      <div class="premium-card p-3 max-w-xs">
                        <div class="text-sm font-medium text-slate-200 mb-1">${object.ssid}</div>
                        <div class="text-xs text-slate-400 font-mono mb-2">${object.bssid}</div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span class="text-slate-400">Type:</span>
                            <div class="text-slate-300 capitalize">${object.radioType}</div>
                          </div>
                          <div>
                            <span class="text-slate-400">Signal:</span>
                            <div class="text-slate-300">${object.signalStrength}dBm</div>
                          </div>
                          <div>
                            <span class="text-slate-400">Security:</span>
                            <div class="text-slate-300">${object.securityLevel || 'Unknown'}</div>
                          </div>
                          <div>
                            <span class="text-slate-400">Freq:</span>
                            <div class="text-slate-300">${object.frequency || 'N/A'}MHz</div>
                          </div>
                        </div>
                      </div>
                    `,
                    style: {
                      backgroundColor: 'transparent',
                      fontSize: '12px'
                    }
                  };
                }}
              >
                <ReactMapGL
                  mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                  mapStyle="mapbox://styles/mapbox/dark-v11"
                />
              </DeckGL>
            </div>
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
            {networkData.map((network: any, index: number) => (
              <div key={index} className="p-3 border border-border/30 rounded-lg bg-background/40 hover:bg-muted/50 transition-colors">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-200">{network.ssid}</p>
                    <p className="text-xs text-slate-400 font-mono">{network.bssid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Radio Type</p>
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{backgroundColor: `rgb(${network.color.join(',')})`}}
                      ></div>
                      <span className="text-xs font-medium capitalize text-slate-300">{network.radioType}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Signal: {network.signalStrength}dBm</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="text-xs font-mono text-slate-300">
                      {network.position[1]?.toFixed(4)}, {network.position[0]?.toFixed(4)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Security: {network.securityLevel || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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