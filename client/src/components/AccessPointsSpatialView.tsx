/**
 * AccessPointsSpatialView - Integrated Map + Table view for Access Points
 *
 * Features:
 * - Mapbox GL JS map showing network locations
 * - AccessPointTableView with infinite scroll
 * - Spatial filtering (bbox, radius search)
 * - Bidirectional sync (map ↔ table)
 * - Multi-select support
 * - Expandable rows to show observations
 */

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AccessPointTableView } from './AccessPointTableView';
import { AccessPointsFilterPanel } from './AccessPointsFilterPanel';
import { useInfiniteAccessPoints, type AccessPointFilters } from '@/hooks/useInfiniteAccessPoints';
import { MapPin, Circle, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessPointsSpatialViewProps {
  defaultFilters?: Partial<AccessPointFilters>;
}

export function AccessPointsSpatialView({ defaultFilters = {} }: AccessPointsSpatialViewProps) {
  // State management
  const [filters, setFilters] = useState<AccessPointFilters>({
    ...defaultFilters,
    search: '',
    radioTypes: [],
    minSignal: undefined,
    maxSignal: undefined,
    dataQuality: [],
    bbox: undefined,
    radiusSearch: undefined,
  });

  const [selectedNetworkIds /*, setSelectedNetworkIds*/] = useState<Set<number>>(new Set());
  const [mapCenter /*, setMapCenter*/] = useState<[number, number]>([-83.6968461, 43.02342188]); // Default: home
  const [isRadiusMode, setIsRadiusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch Mapbox token
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    },
  });

  // Fetch access points with filters
  const queryResult = useInfiniteAccessPoints({
    filters,
    columns: [
      'location_geojson',
      'primary_frequency_hz',
      'max_signal_observed_dbm',
      'manufacturer',
      'oui_prefix_hex',
      'is_hidden_network',
      'is_mobile_device',
      'data_quality',
      'total_observations',
      'unique_data_sources',
      'mobility_confidence_score',
      'first_seen',
      'last_seen',
      'record_created_at',
      'record_updated_at',
    ],
    pageSize: 500,
  });

  const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !mapboxToken || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: mapCenter,
      zoom: 12,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Handle map clicks for radius search
    map.on('click', (e) => {
      if (isRadiusMode) {
        const { lng, lat } = e.lngLat;
        setFilters((prev) => ({
          ...prev,
          radiusSearch: {
            lng,
            lat,
            radiusMeters: 1000, // Default 1km
          },
          bbox: undefined, // Clear bbox when using radius
        }));
        setIsRadiusMode(false);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, mapCenter, isRadiusMode]);

  // Update map markers when data changes
  useEffect(() => {
    if (!mapRef.current || !queryResult.data) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers for networks with locations
    const pages = queryResult.data.pages;
    const allNetworks = pages.flatMap((page) => page.data);

    allNetworks.forEach((network) => {
      if (!network.location_geojson?.coordinates) return;

      const [lng, lat] = network.location_geojson.coordinates;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = selectedNetworkIds.has(network.access_point_id)
        ? '#3b82f6'
        : '#22c55e';
      el.style.border = '2px solid rgba(255,255,255,0.5)';
      el.style.cursor = 'pointer';

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div class="text-xs">
              <div class="font-bold">${network.current_network_name || 'Hidden Network'}</div>
              <div class="text-slate-400">${network.mac_address}</div>
              <div class="text-slate-500">${network.total_observations} observations</div>
            </div>
          `)
        )
        .addTo(mapRef.current!);

      // Handle marker click
      el.addEventListener('click', () => {
        // Scroll table to this network
        const row = document.getElementById(`ap-row-${network.access_point_id}`);
        row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      markersRef.current.push(marker);
    });
  }, [queryResult.data, selectedNetworkIds]);

  // Draw radius circle when radius search is active
  useEffect(() => {
    if (!mapRef.current || !filters.radiusSearch) return;

    const map = mapRef.current;
    const { lng, lat, radiusMeters } = filters.radiusSearch;

    // Remove existing radius layer
    if (map.getLayer('radius-circle')) {
      map.removeLayer('radius-circle');
      map.removeSource('radius-circle');
    }

    // Add radius circle
    map.addSource('radius-circle', {
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
      id: 'radius-circle',
      type: 'circle',
      source: 'radius-circle',
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

    // Center map on radius
    map.flyTo({ center: [lng, lat], zoom: 14 });

    return () => {
      if (map.getLayer('radius-circle')) {
        map.removeLayer('radius-circle');
        map.removeSource('radius-circle');
      }
    };
  }, [filters.radiusSearch]);

  // Handle row click in table
  // const handleTableRowClick = useCallback((accessPointId: number, location: [number, number] | null) => {
  //   if (location && mapRef.current) {
  //     mapRef.current.flyTo({ center: location, zoom: 15 });
  //   }
  // }, []);

  // Spatial filter controls
  const clearSpatialFilters = () => {
    setFilters((prev) => ({
      ...prev,
      bbox: undefined,
      radiusSearch: undefined,
    }));
    setIsRadiusMode(false);
  };

  const updateRadiusDistance = (radiusMeters: number) => {
    if (filters.radiusSearch) {
      setFilters((prev) => ({
        ...prev,
        radiusSearch: { ...prev.radiusSearch!, radiusMeters },
      }));
    }
  };

  if (!mapboxToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col bg-slate-900',
      isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
    )}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">Access Points - Spatial View</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Spatial Filter Controls */}
          <button
            onClick={() => setIsRadiusMode(!isRadiusMode)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              isRadiusMode
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
            title="Click map to search by radius"
          >
            <Circle className="h-4 w-4" />
            {isRadiusMode ? 'Click Map' : 'Radius Search'}
          </button>

          {(filters.bbox || filters.radiusSearch) && (
            <button
              onClick={clearSpatialFilters}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Spatial Filter
            </button>
          )}

          {filters.radiusSearch && (
            <select
              value={filters.radiusSearch.radiusMeters}
              onChange={(e) => updateRadiusDistance(Number(e.target.value))}
              className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm border border-slate-600"
            >
              <option value="100">100m</option>
              <option value="500">500m</option>
              <option value="1000">1km</option>
              <option value="2000">2km</option>
              <option value="5000">5km</option>
              <option value="10000">10km</option>
            </select>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AccessPointsFilterPanel filters={filters} onFiltersChange={setFilters} />

      {/* Main Content: Split View (Map | Table) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Map */}
        <div className="w-1/2 relative border-r border-slate-700">
          <div ref={mapContainerRef} className="absolute inset-0" />

          {/* Map Stats Overlay */}
          <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-700 text-slate-300">
            <div className="text-sm font-semibold">
              {queryResult.data?.pages[0]?.metadata.total.toLocaleString() || 0} Networks
            </div>
            {queryResult.isFetching && (
              <div className="text-xs text-blue-400 mt-1">Updating...</div>
            )}
          </div>

          {/* Radius Mode Hint */}
          {isRadiusMode && (
            <div className="absolute inset-0 bg-blue-600/10 border-4 border-blue-500 border-dashed pointer-events-none flex items-center justify-center">
              <div className="bg-slate-900/90 px-6 py-4 rounded-lg text-center">
                <p className="text-lg font-bold text-blue-400">Click anywhere on the map</p>
                <p className="text-sm text-slate-400 mt-1">to set radius search center</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Table */}
        <div className="w-1/2">
          <AccessPointTableView queryResult={queryResult} />
        </div>
      </div>
    </div>
  );
}
