/**
 * SpatialQueryInterfaceV2 - Redesigned with embedded Mapbox map
 *
 * Matches premium card design from surveillance page
 * Features:
 * - Embedded Mapbox map with GPS button
 * - Radius search by clicking map
 * - Bounding box drawing
 * - Query presets
 * - Results table below map
 * - Consistent UI with rest of app
 */

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  Crosshair,
  Square,
  Circle,
  Home,
  Search,
  Loader2,
  Eye,
  EyeOff,
  Navigation,
  Filter,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HOME_LAT = 43.02342188;
const HOME_LON = -83.6968461;

interface SpatialQuery {
  type: 'radius' | 'bbox';
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

export function SpatialQueryInterfaceV2() {
  // State
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [query, setQuery] = useState<SpatialQuery | null>(null);
  const [isRadiusMode, setIsRadiusMode] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Fetch Mapbox token
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    },
  });

  const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  // Initialize map
  useEffect(() => {
    if (!isMapVisible || !mapContainerRef.current || mapRef.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [HOME_LON, HOME_LAT],
      zoom: 12,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add home marker
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([HOME_LON, HOME_LAT])
      .setPopup(new mapboxgl.Popup().setHTML('<div class="text-xs p-2"><strong>Home</strong></div>'))
      .addTo(map);

    // Handle map clicks for radius search
    map.on('click', (e) => {
      if (isRadiusMode) {
        const { lng, lat } = e.lngLat;
        setQuery({
          type: 'radius',
          lat,
          lng,
          radiusMeters: 1000, // Default 1km
        });
        setIsRadiusMode(false);
        executeQuery({ type: 'radius', lat, lng, radiusMeters: 1000 });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isMapVisible, mapboxToken, isRadiusMode]);

  // Draw radius circle when query active
  useEffect(() => {
    if (!mapRef.current || !query || query.type !== 'radius') return;

    const map = mapRef.current;
    const { lng, lat, radiusMeters } = query;

    if (!lng || !lat || !radiusMeters) return;

    // Remove existing layers
    if (map.getLayer('query-circle')) {
      map.removeLayer('query-circle');
      map.removeSource('query-circle');
    }

    // Add circle
    map.addSource('query-circle', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        properties: {},
      },
    });

    map.addLayer({
      id: 'query-circle',
      type: 'circle',
      source: 'query-circle',
      paint: {
        'circle-radius': {
          stops: [
            [0, 0],
            [20, radiusMeters],
          ],
          base: 2,
        },
        'circle-color': '#3b82f6',
        'circle-opacity': 0.2,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#3b82f6',
      },
    });

    // Add center marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<div class="text-xs p-2">
            <strong>Query Center</strong><br/>
            Radius: ${radiusMeters}m
          </div>`
        )
      )
      .addTo(map);

    map.flyTo({ center: [lng, lat], zoom: 14 });

    return () => {
      if (map.getLayer('query-circle')) {
        map.removeLayer('query-circle');
        map.removeSource('query-circle');
      }
    };
  }, [query]);

  // Get user's GPS location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
          });

          // Add marker for user location
          new mapboxgl.Marker({ color: '#f59e0b' })
            .setLngLat([longitude, latitude])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                '<div class="text-xs p-2"><strong>Your Location</strong></div>'
              )
            )
            .addTo(mapRef.current);
        }
      },
      (error) => {
        alert(`Geolocation error: ${error.message}`);
      }
    );
  };

  // Execute spatial query
  const executeQuery = async (q: SpatialQuery) => {
    try {
      let url = '/api/v1/access-points?';

      if (q.type === 'radius' && q.lat && q.lng && q.radiusMeters) {
        url += `radius_lat=${q.lat}&radius_lng=${q.lng}&radius_meters=${q.radiusMeters}&limit=100`;
      } else if (q.type === 'bbox' && q.bbox) {
        url += `bbox=${q.bbox.join(',')}&limit=100`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.ok) {
        setSearchResults(json.data);

        // Add result markers to map
        if (mapRef.current) {
          json.data.forEach((ap: any) => {
            if (!ap.location_geojson?.coordinates) return;

            const [lng, lat] = ap.location_geojson.coordinates;

            new mapboxgl.Marker({ color: '#8b5cf6' })
              .setLngLat([lng, lat])
              .setPopup(
                new mapboxgl.Popup().setHTML(`
                  <div class="text-xs p-2">
                    <strong>${ap.current_network_name || 'Hidden'}</strong><br/>
                    <span class="text-slate-400">${ap.mac_address}</span><br/>
                    <span class="text-slate-500">${ap.total_observations} observations</span>
                  </div>
                `)
              )
              .addTo(mapRef.current!);
          });
        }
      }
    } catch (error) {
      console.error('Query failed:', error);
    }
  };

  // Query presets
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'near-home': {
        const nearHomeQuery = {
          type: 'radius' as const,
          lat: HOME_LAT,
          lng: HOME_LON,
          radiusMeters: 500,
        };
        setQuery(nearHomeQuery);
        executeQuery(nearHomeQuery);
        break;
      }

      case 'local-area': {
        const localQuery = {
          type: 'radius' as const,
          lat: HOME_LAT,
          lng: HOME_LON,
          radiusMeters: 5000,
        };
        setQuery(localQuery);
        executeQuery(localQuery);
        break;
      }

      case 'current-location':
        if (userLocation) {
          const currentQuery = {
            type: 'radius' as const,
            lat: userLocation[1],
            lng: userLocation[0],
            radiusMeters: 1000,
          };
          setQuery(currentQuery);
          executeQuery(currentQuery);
        } else {
          getUserLocation();
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <div className="premium-card overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-container w-10 h-10">
                <MapPin className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Spatial Query Map</h3>
                <p className="text-sm text-slate-400">Click map to search networks by location</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* GPS Button */}
              <button
                onClick={getUserLocation}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-all flex items-center gap-2"
                title="Get my GPS location"
              >
                <Navigation className="h-4 w-4" />
                GPS
              </button>

              {/* Toggle Map Visibility */}
              <button
                onClick={() => setIsMapVisible(!isMapVisible)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  isMapVisible
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                {isMapVisible ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Map
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Map
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        {isMapVisible && (
          <div className="relative" style={{ height: '500px' }}>
            <div ref={mapContainerRef} className="absolute inset-0" />

            {/* Map Controls Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {/* Query Presets */}
              <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Quick Filters
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => applyPreset('near-home')}
                    className="w-full px-3 py-1.5 text-xs text-left bg-slate-700 hover:bg-slate-600 text-slate-300 rounded flex items-center gap-2 transition-all"
                  >
                    <Home className="h-3 w-3 text-green-400" />
                    Near Home (500m)
                  </button>
                  <button
                    onClick={() => applyPreset('local-area')}
                    className="w-full px-3 py-1.5 text-xs text-left bg-slate-700 hover:bg-slate-600 text-slate-300 rounded flex items-center gap-2 transition-all"
                  >
                    <MapPin className="h-3 w-3 text-blue-400" />
                    Local Area (5km)
                  </button>
                  <button
                    onClick={() => applyPreset('current-location')}
                    className="w-full px-3 py-1.5 text-xs text-left bg-slate-700 hover:bg-slate-600 text-slate-300 rounded flex items-center gap-2 transition-all"
                  >
                    <Crosshair className="h-3 w-3 text-orange-400" />
                    Current Location
                  </button>
                </div>
              </div>

              {/* Radius Search Mode */}
              <button
                onClick={() => setIsRadiusMode(!isRadiusMode)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  isRadiusMode
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800/90 backdrop-blur-sm text-slate-300 border border-slate-700 hover:bg-slate-700'
                )}
              >
                <Circle className="h-4 w-4" />
                {isRadiusMode ? 'Click Map Now' : 'Radius Search'}
              </button>
            </div>

            {/* Query Info Overlay */}
            {query && (
              <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 z-10">
                <div className="text-xs text-slate-300">
                  <div className="font-semibold mb-1">Active Query</div>
                  {query.type === 'radius' && (
                    <>
                      <div>Type: Radius</div>
                      <div>Center: {query.lat?.toFixed(5)}, {query.lng?.toFixed(5)}</div>
                      <div>Radius: {query.radiusMeters}m</div>
                      <div className="mt-2 text-blue-400">{searchResults.length} results</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Radius Mode Hint */}
            {isRadiusMode && (
              <div className="absolute inset-0 bg-blue-600/10 border-4 border-blue-500 border-dashed pointer-events-none flex items-center justify-center">
                <div className="bg-slate-900/90 px-6 py-4 rounded-lg text-center backdrop-blur-sm">
                  <p className="text-lg font-bold text-blue-400">Click anywhere on the map</p>
                  <p className="text-sm text-slate-400 mt-1">to search networks within 1km radius</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Card */}
      {searchResults.length > 0 && (
        <div className="premium-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="icon-container w-10 h-10">
                  <Database className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    Query Results ({searchResults.length})
                  </h3>
                  <p className="text-sm text-slate-400">
                    Networks found within search area
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                    MAC Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                    Network Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                    Radio Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                    Signal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                    Observations
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {searchResults.map((ap, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-300">
                      <code className="text-xs text-slate-400">{ap.mac_address}</code>
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-medium">
                      {ap.current_network_name || (
                        <span className="text-slate-500 italic">Hidden</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs uppercase">
                      {ap.radio_technology}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {ap.max_signal_observed_dbm ? `${ap.max_signal_observed_dbm} dBm` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {ap.total_observations}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {ap.location_geojson?.coordinates
                        ? `${ap.location_geojson.coordinates[1].toFixed(4)}, ${ap.location_geojson.coordinates[0].toFixed(4)}`
                        : 'No location'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!query && searchResults.length === 0 && (
        <div className="premium-card p-12 text-center">
          <Search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            No active query
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Use the quick filters or enable radius search mode to find networks
          </p>
        </div>
      )}
    </div>
  );
}
