/**
 * Lightweight map component for embedding threat observation points
 * Optimized for showing a single network's GPS trail
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Home, Navigation, Maximize2, X } from 'lucide-react';

interface ThreatMapEmbedProps {
  bssid: string;
  observations?: Array<{
    latitude: number;
    longitude: number;
    observed_at: string;
    distance_from_home_km: string;
    signal_strength: number;
    timestamp_ms?: number;
    altitude?: number;
    accuracy?: number;
    ssid?: string;
    frequency?: number;
    capabilities?: string;
    radio_type?: string;
  }>;
  height?: string;
  showControls?: boolean;
}

export function ThreatMapEmbed({
  bssid,
  observations = [],
  height = '400px',
  showControls = true
}: ThreatMapEmbedProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const fullscreenMapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const fullscreenMap = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch Mapbox token
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    }
  });

  // Fetch home location
  const { data: markers } = useQuery({
    queryKey: ['/api/v1/markers'],
    queryFn: async () => {
      const res = await fetch('/api/v1/markers');
      const json = await res.json();
      return json.ok ? json.data : [];
    }
  });

  const homeMarker = markers?.find((m: any) => m.type === 'home');
  const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  // DEBUG: Log component lifecycle
  console.log('[ThreatMapEmbed] MOUNTING for BSSID:', bssid, {
    hasToken: !!mapboxToken,
    observationCount: observations.length,
  });

  // Helper function to initialize a map instance
  const initializeMap = (container: HTMLDivElement, mapRef: React.MutableRefObject<mapboxgl.Map | null>) => {
    if (!mapboxToken || sortedObservations.length === 0) return null;
    if (mapRef.current) return mapRef.current;

    mapboxgl.accessToken = mapboxToken;

    // Calculate bounds from observations
    const bounds = new mapboxgl.LngLatBounds();
    sortedObservations.forEach(obs => {
      bounds.extend([obs.longitude, obs.latitude]);
    });

    // Add home location to bounds if available
    if (homeMarker) {
      const homeLng = homeMarker.location.coordinates[0];
      const homeLat = homeMarker.location.coordinates[1];
      bounds.extend([homeLng, homeLat]);
    }

    // Initialize map
    const newMap = new mapboxgl.Map({
      container: container,
      style: 'mapbox://styles/mapbox/dark-v11',
      bounds: bounds,
      fitBoundsOptions: {
        padding: 50
      }
    });

    newMap.on('load', () => {
      // Add home marker if available
      if (homeMarker) {
        const homeLng = homeMarker.location.coordinates[0];
        const homeLat = homeMarker.location.coordinates[1];

        // Add home circle
        newMap.addSource('home-zone', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [homeLng, homeLat]
            },
            properties: {}
          }
        });

        newMap.addLayer({
          id: 'home-zone-circle',
          type: 'circle',
          source: 'home-zone',
          paint: {
            'circle-radius': 20,
            'circle-color': '#10b981',
            'circle-opacity': 0.3,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#10b981',
            'circle-stroke-opacity': 0.8
          }
        });

        // Add home icon marker
        new mapboxgl.Marker({
          color: '#10b981',
          scale: 0.8
        })
          .setLngLat([homeLng, homeLat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML('<div class="text-sm font-semibold">🏠 Home</div>')
          )
          .addTo(newMap);
      }

      // Add observation points
      const features = sortedObservations.map((obs, idx) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [obs.longitude, obs.latitude]
        },
        properties: {
          sequence: idx + 1,
          time: obs.observed_at,
          timestamp_ms: obs.timestamp_ms || new Date(obs.observed_at).getTime(),
          latitude: obs.latitude,
          longitude: obs.longitude,
          distance: obs.distance_from_home_km,
          signal: obs.signal_strength,
          altitude: obs.altitude || 0,
          accuracy: obs.accuracy || 0,
          ssid: obs.ssid || 'Hidden',
          frequency: obs.frequency || 0,
          capabilities: obs.capabilities || 'Unknown',
          radio_type: obs.radio_type || 'Unknown'
        }
      }));

      newMap.addSource('observations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      // Draw line connecting observations (GPS trail)
      if (sortedObservations.length > 1) {
        newMap.addSource('observation-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: sortedObservations.map(obs => [obs.longitude, obs.latitude])
            },
            properties: {}
          }
        });

        newMap.addLayer({
          id: 'observation-trail',
          type: 'line',
          source: 'observation-line',
          paint: {
            'line-color': '#ef4444',
            'line-width': 2,
            'line-opacity': 0.6,
            'line-dasharray': [2, 2]
          }
        });
      }

      // Add observation points
      newMap.addLayer({
        id: 'observation-points',
        type: 'circle',
        source: 'observations',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'sequence'],
            1, 10,
            sortedObservations.length, 14
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'sequence'],
            1, '#fbbf24',
            sortedObservations.length, '#ef4444'
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 1.0
        }
      });

      // Add text labels
      newMap.addLayer({
        id: 'observation-labels',
        type: 'symbol',
        source: 'observations',
        layout: {
          'text-field': ['to-string', ['get', 'sequence']],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5
        }
      });

      // Add click handler for observation points
      newMap.on('click', 'observation-points', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties;
        if (!props) return;
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        const timestamp = new Date(props.time);
        const dateStr = timestamp.toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        const timeStr = timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const popupHTML = `
          <div style="font-family: monospace; min-width: 280px; max-width: 320px; padding: 4px;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                        color: #fbbf24;
                        padding: 8px;
                        margin: -8px -8px 8px -8px;
                        border-bottom: 2px solid #fbbf24;
                        font-weight: bold;
                        font-size: 13px;">
              📡 OBSERVATION #${props.sequence}
            </div>
            <div style="font-size: 11px; line-height: 1.6; color: #1e293b;">
              <div style="background: #f1f5f9; padding: 6px; margin-bottom: 6px; border-radius: 3px;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold; margin-bottom: 2px;">⏰ TIMESTAMP</div>
                <div style="font-weight: bold;">${dateStr} ${timeStr}</div>
                <div style="color: #64748b; font-size: 9px;">${props.timestamp_ms}ms</div>
              </div>
              <div style="background: #f1f5f9; padding: 6px; margin-bottom: 6px; border-radius: 3px;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold; margin-bottom: 2px;">📍 GEOLOCATION</div>
                <div><span style="color: #64748b;">LAT:</span> ${Number(props.latitude).toFixed(6)}°</div>
                <div><span style="color: #64748b;">LON:</span> ${Number(props.longitude).toFixed(6)}°</div>
                <div><span style="color: #64748b;">ALT:</span> ${props.altitude}m</div>
                <div><span style="color: #64748b;">ACC:</span> ±${props.accuracy}m</div>
              </div>
              <div style="background: ${parseFloat(props.distance) < 0.5 ? '#dcfce7' : '#fee2e2'};
                          padding: 6px; margin-bottom: 6px; border-radius: 3px;
                          border-left: 3px solid ${parseFloat(props.distance) < 0.5 ? '#10b981' : '#ef4444'};">
                <div style="color: #64748b; font-size: 9px; font-weight: bold; margin-bottom: 2px;">📏 DISTANCE FROM HOME</div>
                <div style="font-weight: bold; font-size: 14px; color: ${parseFloat(props.distance) < 0.5 ? '#059669' : '#dc2626'};">
                  ${props.distance} km
                </div>
                <div style="color: #64748b; font-size: 9px;">
                  ${parseFloat(props.distance) < 0.5 ? '🟢 HOME ZONE' : '🔴 AWAY'}
                </div>
              </div>
              <div style="background: #f1f5f9; padding: 6px; margin-bottom: 6px; border-radius: 3px;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold; margin-bottom: 2px;">📶 SIGNAL INTELLIGENCE</div>
                <div><span style="color: #64748b;">Signal:</span> <strong>${props.signal} dBm</strong></div>
                <div><span style="color: #64748b;">Frequency:</span> ${props.frequency} MHz</div>
                <div><span style="color: #64748b;">Radio:</span> ${props.radio_type}</div>
              </div>
              <div style="background: #f1f5f9; padding: 6px; border-radius: 3px;">
                <div style="color: #64748b; font-size: 9px; font-weight: bold; margin-bottom: 2px;">🔐 NETWORK DETAILS</div>
                <div><span style="color: #64748b;">SSID:</span> ${props.ssid}</div>
                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
                  ${props.capabilities}
                </div>
              </div>
            </div>
          </div>
        `;

        new mapboxgl.Popup({ maxWidth: '340px' })
          .setLngLat(coordinates)
          .setHTML(popupHTML)
          .addTo(newMap);
      });

      // Change cursor on hover
      newMap.on('mouseenter', 'observation-points', () => {
        newMap.getCanvas().style.cursor = 'pointer';
      });

      newMap.on('mouseleave', 'observation-points', () => {
        newMap.getCanvas().style.cursor = '';
      });
    });

    return newMap;
  };

  // Sort observations chronologically (oldest first) - MEMOIZED to prevent re-renders
  const sortedObservations = useMemo(() => {
    return [...observations].sort((a, b) => {
      const timeA = new Date(a.observed_at).getTime();
      const timeB = new Date(b.observed_at).getTime();
      return timeA - timeB;
    });
  }, [observations]);

  // Initialize embedded map
  useEffect(() => {
    if (!mapContainer.current) return;

    const initializedMap = initializeMap(mapContainer.current, map);
    if (initializedMap) {
      map.current = initializedMap;
      initializedMap.on('load', () => setMapLoaded(true));
    }

    // Cleanup
    return () => {
      console.log('[ThreatMapEmbed] UNMOUNTING/CLEANUP for BSSID:', bssid);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
    };
  }, [mapboxToken, sortedObservations, homeMarker, bssid]);

  // Initialize fullscreen map when entering fullscreen mode
  useEffect(() => {
    if (!isFullscreen || !fullscreenMapContainer.current) return;

    const initializedMap = initializeMap(fullscreenMapContainer.current, fullscreenMap);
    if (initializedMap) {
      fullscreenMap.current = initializedMap;
    }

    // Cleanup fullscreen map
    return () => {
      if (fullscreenMap.current) {
        fullscreenMap.current.remove();
        fullscreenMap.current = null;
      }
    };
  }, [isFullscreen, mapboxToken, sortedObservations, homeMarker]);

  if (!mapboxToken) {
    return (
      <div className="w-full flex items-center justify-center bg-slate-900/50 rounded-lg" style={{ height }}>
        <div className="text-center space-y-2 p-6">
          <MapPin className="h-12 w-12 mx-auto text-slate-600" />
          <p className="text-sm text-slate-400">Map configuration missing</p>
        </div>
      </div>
    );
  }

  if (observations.length === 0) {
    return (
      <div className="w-full flex items-center justify-center bg-slate-900/50 rounded-lg" style={{ height }}>
        <div className="text-center space-y-2 p-6">
          <MapPin className="h-12 w-12 mx-auto text-slate-600" />
          <p className="text-sm text-slate-400">No observation data available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Map Container */}
        <div
          ref={mapContainer}
          className="w-full rounded-lg overflow-hidden"
          style={{ height }}
        />

        {/* Stats Overlay */}
        {showControls && mapLoaded && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Navigation className="h-3 w-3 text-blue-400" />
              <span className="text-slate-300">{sortedObservations.length} GPS points</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-red-400" />
              <span className="text-slate-300">
                {Math.max(...sortedObservations.map(o => parseFloat(o.distance_from_home_km))).toFixed(2)} km max
              </span>
            </div>
            {homeMarker && (
              <div className="flex items-center gap-2">
                <Home className="h-3 w-3 text-green-400" />
                <span className="text-slate-300">Home reference</span>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Button */}
        {showControls && mapLoaded && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 p-2 hover:bg-slate-800 transition-colors"
            title="View fullscreen"
          >
            <Maximize2 className="h-4 w-4 text-slate-300" />
          </button>
        )}

        {/* Legend */}
        {showControls && mapLoaded && (
          <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 space-y-2 text-xs">
            <div className="font-semibold text-slate-300 mb-2">Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-300">Home location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-slate-300">Older observations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-300">Recent observations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500 opacity-60" style={{ borderTop: '2px dashed' }}></div>
              <span className="text-slate-300">GPS trail</span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-slate-900/90 border-b border-slate-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Threat Observation Map</h3>
                <p className="text-sm text-slate-400 font-mono">{bssid}</p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
              title="Exit fullscreen"
            >
              <X className="h-5 w-5 text-slate-300" />
            </button>
          </div>

          {/* Fullscreen Map Container */}
          <div
            ref={fullscreenMapContainer}
            className="absolute inset-0 top-16"
            style={{ height: 'calc(100vh - 4rem)' }}
          />

          {/* Fullscreen Stats Overlay */}
          <div className="absolute top-20 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Navigation className="h-3 w-3 text-blue-400" />
              <span className="text-slate-300">{sortedObservations.length} GPS points</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-red-400" />
              <span className="text-slate-300">
                {Math.max(...sortedObservations.map(o => parseFloat(o.distance_from_home_km))).toFixed(2)} km max
              </span>
            </div>
            {homeMarker && (
              <div className="flex items-center gap-2">
                <Home className="h-3 w-3 text-green-400" />
                <span className="text-slate-300">Home reference</span>
              </div>
            )}
          </div>

          {/* Fullscreen Legend */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 space-y-2 text-xs">
            <div className="font-semibold text-slate-300 mb-2">Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-300">Home location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-slate-300">Older observations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-300">Recent observations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500 opacity-60" style={{ borderTop: '2px dashed' }}></div>
              <span className="text-slate-300">GPS trail</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
