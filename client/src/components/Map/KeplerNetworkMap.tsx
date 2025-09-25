import { useState, useEffect, useRef } from 'react';
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

// Kepler.gl imports
import KeplerGl from '@kepler.gl/components';
import { addDataToMap } from '@kepler.gl/actions';
import { processGeojson } from '@kepler.gl/processors';

export default function KeplerNetworkMap() {
  const mapRef = useRef<any>(null);
  const [keplerConfig, setKeplerConfig] = useState({});
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

  const { data: analytics } = useQuery({
    queryKey: ['/api/v1/g63/analytics'],
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
        // Update Kepler.gl view state
        if (mapRef.current) {
          const newMapState = {
            ...mapRef.current.getMapState(),
            latitude,
            longitude,
            zoom: 14
          };
          mapRef.current.updateMap(newMapState);
        }
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

  // Process and filter data for Kepler.gl
  useEffect(() => {
    if (!visualizationData || !mapRef.current) return;

    const allFeatures = (visualizationData as any)?.data?.features || [];
    console.log('Processing features for Kepler.gl:', allFeatures.length);

    // Filter features based on radio type selection
    const filteredFeatures = allFeatures.filter((feature: any) => {
      const radioType = feature.properties.radio_type;
      return radioFilters[radioType as keyof typeof radioFilters];
    });

    // Convert to GeoJSON for Kepler.gl
    const geojsonData = {
      type: 'FeatureCollection',
      features: filteredFeatures
    };

    // Process data and add to Kepler.gl
    const processedData = processGeojson(geojsonData);
    
    // Handle potential null data
    if (!processedData) {
      console.warn('Failed to process geojson data');
      return;
    }
    
    const datasets = [{
      info: {
        label: 'Network Observations',
        id: 'networks'
      },
      data: processedData
    }] as any;

    // Define Kepler.gl configuration for SIGINT visualization
    const config = {
      version: 'v1' as const,
      config: {
        visState: {
          filters: [],
          layers: [
            {
              id: 'networks-layer',
              type: 'point',
              config: {
                dataId: 'networks',
                label: 'Network Observations',
                color: [30, 150, 190],
                columns: {
                  lat: 'coordinates[1]',
                  lng: 'coordinates[0]',
                  altitude: null
                },
                isVisible: true,
                visConfig: {
                  radius: 10,
                  fixedRadius: false,
                  opacity: 0.8,
                  outline: false,
                  thickness: 2,
                  strokeColor: null,
                  colorRange: {
                    name: 'Global Warming',
                    type: 'sequential',
                    category: 'Uber',
                    colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                  },
                  strokeColorRange: {
                    name: 'Global Warming',
                    type: 'sequential',
                    category: 'Uber',
                    colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                  },
                  radiusRange: [4, 15],
                  filled: true
                },
                hidden: false,
                textLabel: [
                  {
                    field: null,
                    color: [255, 255, 255],
                    size: 18,
                    offset: [0, 0],
                    anchor: 'start',
                    alignment: 'center'
                  }
                ]
              },
              visualChannels: {
                colorField: {
                  name: 'radio_type',
                  type: 'string'
                },
                colorScale: 'ordinal',
                sizeField: {
                  name: 'signal_strength',
                  type: 'real'
                },
                sizeScale: 'linear'
              }
            }
          ],
          interactionConfig: {
            tooltip: {
              fieldsToShow: {
                networks: [
                  { name: 'ssid', format: null },
                  { name: 'bssid', format: null },
                  { name: 'radio_type', format: null },
                  { name: 'signal_strength', format: null },
                  { name: 'security_level', format: null }
                ]
              },
              compareMode: false,
              compareType: 'absolute',
              enabled: true
            },
            brush: {
              size: 0.5,
              enabled: false
            },
            geocoder: {
              enabled: false
            },
            coordinate: {
              enabled: false
            }
          },
          layerBlending: 'normal',
          splitMaps: [],
          animationConfig: {
            currentTime: null,
            speed: 1
          }
        },
        mapState: {
          bearing: 0,
          dragRotate: false,
          latitude: 43.023,
          longitude: -83.697,
          pitch: 0,
          zoom: 12,
          isSplit: false
        },
        mapStyle: {
          styleType: 'dark',
          topLayerGroups: {},
          visibleLayerGroups: {
            label: true,
            road: true,
            border: false,
            building: true,
            water: true,
            land: true,
            '3d building': false
          },
          threeDBuildingColor: [9.665468314072013, 17.18305478057247, 31.1442867897876],
          mapStyles: {}
        }
      }
    };

    // Dispatch action to add data to map
    if (mapRef.current?.props?.dispatch) {
      mapRef.current.props.dispatch(
        addDataToMap({
          datasets,
          config,
          options: {
            centerMap: false,
            readOnly: false
          }
        })
      );
    }

  }, [visualizationData, radioFilters]);

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
              Advanced SIGINT Visualization ({(visualizationData as any)?.data?.features?.filter((f: any) => 
                radioFilters[f.properties.radio_type as keyof typeof radioFilters]
              ).length || 0} observations)
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
              <KeplerGl
                ref={mapRef}
                id="keplergl-map"
                width={800}
                height={500}
                mapboxApiAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                onSaveConfig={setKeplerConfig}
              />
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
            Individual Observations ({(visualizationData as any)?.data?.features?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {((visualizationData as any)?.data?.features || []).map((feature: any, index: number) => {
              const props = feature.properties;
              const coords = feature.geometry?.coordinates;
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
                        <div className={`w-2 h-2 rounded-full ${
                          props.radio_type === 'wifi' ? 'bg-green-500' :
                          props.radio_type === 'ble' ? 'bg-purple-500' :
                          props.radio_type === 'bluetooth' ? 'bg-blue-500' :
                          props.radio_type === 'cellular' ? 'bg-red-500' : 'bg-slate-500'
                        }`}></div>
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
            {((visualizationData as any)?.data?.features || []).length === 0 && (
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