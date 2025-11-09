/**
 * AccessPointsExplorerView - Dense table with collapsible map panel
 *
 * DEFAULT: Full-width table (dense, efficient listing)
 * ON DEMAND: Map slides in from right (spatial visualization)
 *
 * Features:
 * - Table-first design (map hidden by default)
 * - Spatial filtering (works with or without map visible)
 * - Multi-select checkboxes
 * - Expandable rows to show observations
 * - Smooth animations
 * - 126K networks with infinite scroll
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useInfiniteAccessPoints, type AccessPointFilters, flattenAccessPoints, getTotalCount } from '@/hooks/useInfiniteAccessPoints';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { ObservationsExpandedRow } from './ObservationsExpandedRow';
import { ColumnSelector } from './ColumnSelector';
import {
  MapPin,
  Map as MapIcon,
  X,
  ChevronDown,
  ChevronRight,
  Target,
  Home,
  Loader2,
  Filter,
  Wifi,
  Signal,
  Check,
  Eye,
  Bluetooth
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccessPoint } from '@/hooks/useInfiniteAccessPoints';

/**
 * Format frequency from Hz to MHz/GHz
 */
function formatFrequency(frequencyHz: number | null): string {
  if (!frequencyHz) return '-';
  if (frequencyHz >= 1_000_000_000) {
    return `${(frequencyHz / 1_000_000_000).toFixed(3)} GHz`;
  }
  return `${(frequencyHz / 1_000_000).toFixed(0)} MHz`;
}

/**
 * Format signal strength with dBm unit
 */
function formatSignal(dbm: number | null): string {
  if (dbm === null || dbm === undefined) return '-';
  return `${dbm} dBm`;
}

/**
 * Get signal strength color
 */
function getSignalColor(dbm: number | null): string {
  if (!dbm) return 'text-slate-500';
  if (dbm >= -50) return 'text-green-400';
  if (dbm >= -70) return 'text-yellow-400';
  if (dbm >= -85) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Format timestamp to YYYY-MM-DD HH:mm:ss
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format location from GeoJSON
 */
function formatLocation(locationGeojson: AccessPoint['location_geojson']): string {
  if (!locationGeojson || !locationGeojson.coordinates) return 'N/A';
  const [lng, lat] = locationGeojson.coordinates;
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Get data quality badge styling
 */
function getQualityBadgeClass(quality: 'high' | 'medium' | 'low'): string {
  switch (quality) {
    case 'high':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'low':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
}

/**
 * Format MAC address to uppercase
 */
function formatMacAddress(mac: string): string {
  return mac.toUpperCase();
}

export function AccessPointsExplorerView() {
  // State
  const [filters, setFilters] = useState<AccessPointFilters>({
    search: '',
    radioTypes: [],
    minSignal: undefined,
    maxSignal: undefined,
    dataQuality: [],
    bbox: undefined,
    radiusSearch: undefined,
  });

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isRadiusMode, setIsRadiusMode] = useState(false);
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // MAC addresses
  const [spatialFilterMenuOpen, setSpatialFilterMenuOpen] = useState(false);
  const [radioTypeFilter, setRadioTypeFilter] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const { isColumnVisible } = useColumnPreferences();

  // Calculate dynamic colspan for expanded rows (1 checkbox + 4 core + optional columns)
  const optionalColumns = [
    'primary_frequency_hz',
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
    'location',
  ];
  const visibleOptionalCount = optionalColumns.filter((col) => isColumnVisible(col)).length;
  const totalColspan = 1 + 4 + visibleOptionalCount; // checkbox + 4 core + optional

  // Fetch config for Mapbox token
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    },
  });

  // Fetch access points
  const queryResult = useInfiniteAccessPoints({
    filters: {
      ...filters,
      radioTypes: radioTypeFilter ? [radioTypeFilter] : [],
    },
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

  const allAccessPoints = flattenAccessPoints(queryResult.data?.pages);
  const totalCount = getTotalCount(queryResult.data?.pages);

  // Virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: allAccessPoints.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Infinite scroll
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= allAccessPoints.length - 10 &&
      queryResult.hasNextPage &&
      !queryResult.isFetchingNextPage
    ) {
      queryResult.fetchNextPage();
    }
  }, [virtualItems, allAccessPoints.length, queryResult]);

  // Initialize map when shown
  useEffect(() => {
    if (!isMapVisible || !mapContainerRef.current || mapRef.current) return;

    const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';
    if (!mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-83.6968461, 43.02342188],
      zoom: 12,
    });

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
            radiusMeters: 1000,
          },
          bbox: undefined,
        }));
        setIsRadiusMode(false);
        setSpatialFilterMenuOpen(false);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isMapVisible, config, isRadiusMode]);

  // Update map markers
  useEffect(() => {
    if (!mapRef.current || !isMapVisible) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for networks with locations
    allAccessPoints.forEach((network) => {
      if (!network.location_geojson?.coordinates) return;

      const [lng, lat] = network.location_geojson.coordinates;
      const isSelected = selectedNetworkIds.has(network.access_point_id);

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = isSelected ? '16px' : '12px';
      el.style.height = isSelected ? '16px' : '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = isSelected ? '#3b82f6' : '#22c55e';
      el.style.border = `2px solid ${isSelected ? '#60a5fa' : 'rgba(255,255,255,0.5)'}`;
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.2s';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div class="text-xs p-2">
              <div class="font-bold text-white">${network.current_network_name || 'Hidden Network'}</div>
              <div class="text-slate-400 font-mono">${network.mac_address}</div>
              <div class="text-slate-500 mt-1">${network.total_observations} observations</div>
            </div>
          `)
        )
        .addTo(mapRef.current!);

      // Scroll to row on marker click
      el.addEventListener('click', () => {
        const row = document.getElementById(`ap-row-${network.access_point_id}`);
        row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      markersRef.current.push(marker);
    });
  }, [allAccessPoints, isMapVisible, selectedNetworkIds]);

  // Draw radius circle
  useEffect(() => {
    if (!mapRef.current || !filters.radiusSearch) return;

    const map = mapRef.current;
    const { lng, lat, radiusMeters } = filters.radiusSearch;

    if (map.getLayer('radius-circle')) {
      map.removeLayer('radius-circle');
      map.removeSource('radius-circle');
    }

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

    map.flyTo({ center: [lng, lat], zoom: 14 });

    return () => {
      if (map.getLayer('radius-circle')) {
        map.removeLayer('radius-circle');
        map.removeSource('radius-circle');
      }
    };
  }, [filters.radiusSearch]);

  // Spatial filter presets
  const applySpatialPreset = (preset: string) => {
    const home = { lat: 43.02342188, lng: -83.6968461 };

    switch (preset) {
      case 'near-home':
        setFilters((prev) => ({
          ...prev,
          radiusSearch: { ...home, radiusMeters: 500 },
          bbox: undefined,
        }));
        break;
      case 'local-area':
        setFilters((prev) => ({
          ...prev,
          radiusSearch: { ...home, radiusMeters: 5000 },
          bbox: undefined,
        }));
        break;
      case 'clear':
        setFilters((prev) => ({
          ...prev,
          radiusSearch: undefined,
          bbox: undefined,
        }));
        break;
    }
    setSpatialFilterMenuOpen(false);
  };

  // Multi-select handlers
  const toggleSelectAll = () => {
    if (selectedNetworkIds.size === allAccessPoints.length) {
      setSelectedNetworkIds(new Set());
    } else {
      setSelectedNetworkIds(new Set(allAccessPoints.map((ap) => ap.access_point_id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedNetworkIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNetworkIds(newSet);
  };

  // Row expansion for observations
  const toggleRowExpansion = (macAddress: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(macAddress)) {
      newSet.delete(macAddress);
    } else {
      newSet.add(macAddress);
    }
    setExpandedRows(newSet);
  };

  // Show selected networks on map
  const showSelectedOnMap = () => {
    if (!mapRef.current || selectedNetworkIds.size === 0) return;

    setIsMapVisible(true);

    // Get bounds of selected networks
    const selectedNetworks = allAccessPoints.filter((ap) =>
      selectedNetworkIds.has(ap.access_point_id) && ap.location_geojson
    );

    if (selectedNetworks.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      selectedNetworks.forEach((ap) => {
        if (ap.location_geojson?.coordinates) {
          bounds.extend(ap.location_geojson.coordinates as [number, number]);
        }
      });

      setTimeout(() => {
        mapRef.current?.fitBounds(bounds, { padding: 50 });
      }, 300);
    }
  };

  // Format helpers
  const formatMacAddress = (mac: string) => mac.toUpperCase();
  const formatSignal = (dbm: number | null) => (dbm ? `${dbm} dBm` : '-');
  const getSignalColor = (dbm: number | null) => {
    if (!dbm) return 'text-slate-500';
    if (dbm >= -50) return 'text-green-400';
    if (dbm >= -70) return 'text-yellow-400';
    if (dbm >= -85) return 'text-orange-400';
    return 'text-red-400';
  };

  if (queryResult.isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Loading access points...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-4 gap-4 p-4 flex-shrink-0">
        {/* WiFi Card */}
        <div
          className={cn(
            "bg-slate-800/50 border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
            radioTypeFilter === "wifi" ? "border-blue-500 bg-blue-900/20" : "border-slate-700 hover:bg-slate-700/50"
          )}
          onClick={() => setRadioTypeFilter(radioTypeFilter === "wifi" ? null : "wifi")}
        >
          <Wifi className="h-8 w-8 text-blue-400" />
          <p className="text-lg font-semibold text-slate-200 mt-2">WiFi</p>
          <p className="text-sm text-slate-400">123,456 Networks</p> {/* Placeholder */}
        </div>

        {/* Cellular Card */}
        <div
          className={cn(
            "bg-slate-800/50 border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
            radioTypeFilter === "cellular" ? "border-green-500 bg-green-900/20" : "border-slate-700 hover:bg-slate-700/50"
          )}
          onClick={() => setRadioTypeFilter(radioTypeFilter === "cellular" ? null : "cellular")}
        >
          <Signal className="h-8 w-8 text-green-400" />
          <p className="text-lg font-semibold text-slate-200 mt-2">Cellular</p>
          <p className="text-sm text-slate-400">78,901 Networks</p> {/* Placeholder */}
        </div>

        {/* Bluetooth Card */}
        <div
          className={cn(
            "bg-slate-800/50 border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
            radioTypeFilter === "bluetooth" ? "border-purple-500 bg-purple-900/20" : "border-slate-700 hover:bg-slate-700/50"
          )}
          onClick={() => setRadioTypeFilter(radioTypeFilter === "bluetooth" ? null : "bluetooth")}
        >
          <Bluetooth className="h-8 w-8 text-purple-400" />
          <p className="text-lg font-semibold text-slate-200 mt-2">Bluetooth</p>
          <p className="text-sm text-slate-400">23,456 Devices</p> {/* Placeholder */}
        </div>

        {/* BLE Card */}
        <div
          className={cn(
            "bg-slate-800/50 border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
            radioTypeFilter === "ble" ? "border-red-500 bg-red-900/20" : "border-slate-700 hover:bg-slate-700/50"
          )}
          onClick={() => setRadioTypeFilter(radioTypeFilter === "ble" ? null : "ble")}
        >
          <Bluetooth className="h-8 w-8 text-red-400" /> {/* Using Bluetooth icon for BLE */}
          <p className="text-lg font-semibold text-slate-200 mt-2">BLE</p>
          <p className="text-sm text-slate-400">9,876 Devices</p> {/* Placeholder */}
        </div>
      </div>
      {/* Collapsible Filter Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg",
            filtersExpanded ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={cn("h-4 w-4 transition-transform", filtersExpanded ? "rotate-180" : "")} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">
            Access Points Explorer
          </h2>
          <span className="text-sm text-slate-400">
            {allAccessPoints.length.toLocaleString()} / {totalCount.toLocaleString()} networks
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Spatial Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSpatialFilterMenuOpen(!spatialFilterMenuOpen)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                (filters.radiusSearch || filters.bbox)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              <Filter className="h-4 w-4" />
              Spatial Filters
              <ChevronDown className="h-3 w-3" />
            </button>

            {spatialFilterMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsRadiusMode(true);
                      setIsMapVisible(true);
                      setSpatialFilterMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded flex items-center gap-2"
                  >
                    <Target className="h-4 w-4 text-purple-400" />
                    Radius Search (click map)
                  </button>

                  <button
                    onClick={() => applySpatialPreset('near-home')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded flex items-center gap-2"
                  >
                    <Home className="h-4 w-4 text-green-400" />
                    Near Home (500m)
                  </button>

                  <button
                    onClick={() => applySpatialPreset('local-area')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-blue-400" />
                    Local Area (5km)
                  </button>

                  {(filters.radiusSearch || filters.bbox) && (
                    <>
                      <div className="border-t border-slate-700 my-2" />
                      <button
                        onClick={() => applySpatialPreset('clear')}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 rounded flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Clear Filters
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column Selector */}
          <ColumnSelector />

          {/* Show/Hide Map Toggle */}
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
                <X className="h-4 w-4" />
                Hide Map
              </>
            ) : (
              <>
                <MapIcon className="h-4 w-4" />
                Show Map
              </>
            )}
          </button>

          {/* Show Selected on Map (only when selections exist) */}
          {selectedNetworkIds.size > 0 && (
            <button
              onClick={showSelectedOnMap}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Show {selectedNetworkIds.size} on Map
            </button>
          )}
        </div>
      </div>

      {/* Multi-select toolbar (when networks selected) */}
      {selectedNetworkIds.size > 0 && (
        <div className="px-4 py-2 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span className="font-semibold">{selectedNetworkIds.size} networks selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedNetworkIds(new Set())}
              className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 rounded transition-all"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table (full width when map hidden, 60% when visible) */}
        <div
          className={cn(
            'transition-all duration-300 overflow-hidden',
            isMapVisible ? 'w-[60%]' : 'w-full'
          )}
        >
          <div className="h-full overflow-auto bg-slate-900" ref={parentRef}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              <table className="w-full text-sm border-collapse" style={{tableLayout: "fixed"}}>
                <thead className="sticky top-0 z-10 bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "50px"}}>
                      <input
                        type="checkbox"
                        checked={selectedNetworkIds.size === allAccessPoints.length}
                        onChange={toggleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "150px"}}>
                      MAC Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "200px"}}>
                      Network Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "100px"}}>
                      Radio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "100px"}}>
                      Signal
                    </th>
                    {isColumnVisible('primary_frequency_hz') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "110px"}}>
                        Frequency
                      </th>
                    )}
                    {isColumnVisible('manufacturer') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "150px"}}>
                        Manufacturer
                      </th>
                    )}
                    {isColumnVisible('oui_prefix_hex') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "100px"}}>
                        OUI
                      </th>
                    )}
                    {isColumnVisible('is_hidden_network') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "80px"}}>
                        Hidden
                      </th>
                    )}
                    {isColumnVisible('is_mobile_device') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "80px"}}>
                        Mobile
                      </th>
                    )}
                    {isColumnVisible('data_quality') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "100px"}}>
                        Quality
                      </th>
                    )}
                    {isColumnVisible('total_observations') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "120px"}}>
                        Observations
                      </th>
                    )}
                    {isColumnVisible('unique_data_sources') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "90px"}}>
                        Sources
                      </th>
                    )}
                    {isColumnVisible('mobility_confidence_score') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "90px"}}>
                        Mobility
                      </th>
                    )}
                    {isColumnVisible('first_seen') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "160px"}}>
                        First Seen
                      </th>
                    )}
                    {isColumnVisible('last_seen') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "160px"}}>
                        Last Seen
                      </th>
                    )}
                    {isColumnVisible('record_created_at') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "160px"}}>
                        Created
                      </th>
                    )}
                    {isColumnVisible('record_updated_at') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "160px"}}>
                        Updated
                      </th>
                    )}
                    {isColumnVisible('location') && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700" style={{width: "180px"}}>
                        Location
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {virtualItems.map((virtualRow) => {
                    const ap = allAccessPoints[virtualRow.index];
                    if (!ap) return null;

                    const isSelected = selectedNetworkIds.has(ap.access_point_id);
                    const isExpanded = expandedRows.has(ap.mac_address);

                    return (
                      <>
                        <tr
                          key={ap.access_point_id}
                          id={`ap-row-${ap.access_point_id}`}
                          className={cn(
                            'border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer',
                            isSelected && 'bg-blue-900/20'
                          )}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          onClick={() => toggleSelect(ap.access_point_id)}
                        >
                          <td className="px-4 py-3 text-xs text-slate-300" style={{width: "50px"}}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(ap.access_point_id)}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400" style={{width: "150px"}}>
                            <code className="font-mono">
                              {formatMacAddress(ap.mac_address)}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300" style={{width: "200px"}}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(ap.mac_address);
                                }}
                                className="text-slate-500 hover:text-slate-300"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <span className="text-slate-200 font-medium">
                                {ap.current_network_name || (
                                  <span className="text-slate-500 italic">Hidden</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300" style={{width: "100px"}}>
                            <span className="uppercase">{ap.radio_technology}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300" style={{width: "100px"}}>
                            <span className={cn('font-mono', getSignalColor(ap.max_signal_observed_dbm))}>
                              {formatSignal(ap.max_signal_observed_dbm)}
                            </span>
                          </td>
                          {isColumnVisible('primary_frequency_hz') && (
                            <td className="px-4 py-3 text-xs text-slate-300" style={{width: "110px"}}>
                              {formatFrequency(ap.primary_frequency_hz)}
                            </td>
                          )}
                          {isColumnVisible('manufacturer') && (
                            <td className="px-4 py-3 text-xs text-slate-400" style={{width: "150px"}}>
                              {ap.manufacturer || '-'}
                            </td>
                          )}
                          {isColumnVisible('oui_prefix_hex') && (
                            <td className="px-4 py-3 text-xs text-slate-500" style={{width: "100px"}}>
                              <code className="font-mono">{ap.oui_prefix_hex || '-'}</code>
                            </td>
                          )}
                          {isColumnVisible('is_hidden_network') && (
                            <td className="px-4 py-3 text-xs text-slate-300 text-center" style={{width: "80px"}}>
                              {ap.is_hidden_network ? '✓' : '-'}
                            </td>
                          )}
                          {isColumnVisible('is_mobile_device') && (
                            <td className="px-4 py-3 text-xs text-slate-300 text-center" style={{width: "80px"}}>
                              {ap.is_mobile_device ? '✓' : '-'}
                            </td>
                          )}
                          {isColumnVisible('data_quality') && (
                            <td className="px-4 py-3 text-xs text-slate-300" style={{width: "100px"}}>
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                                  getQualityBadgeClass(ap.data_quality)
                                )}
                              >
                                {ap.data_quality}
                              </span>
                            </td>
                          )}
                          {isColumnVisible('total_observations') && (
                            <td className="px-4 py-3 text-xs text-slate-300" style={{width: "120px"}}>
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {ap.total_observations}
                              </span>
                            </td>
                          )}
                          {isColumnVisible('unique_data_sources') && (
                            <td className="px-4 py-3 text-xs text-slate-400" style={{width: "90px"}}>
                              {ap.unique_data_sources}
                            </td>
                          )}
                          {isColumnVisible('mobility_confidence_score') && (
                            <td className="px-4 py-3 text-xs text-slate-400" style={{width: "90px"}}>
                              {ap.mobility_confidence_score !== null
                                ? (ap.mobility_confidence_score * 100).toFixed(0) + '%'
                                : '-'}
                            </td>
                          )}
                          {isColumnVisible('first_seen') && (
                            <td className="px-4 py-3 text-xs text-slate-400" style={{width: "160px"}}>
                              {formatTimestamp(ap.first_seen)}
                            </td>
                          )}
                          {isColumnVisible('last_seen') && (
                            <td className="px-4 py-3 text-xs text-slate-400" style={{width: "160px"}}>
                              {formatTimestamp(ap.last_seen)}
                            </td>
                          )}
                          {isColumnVisible('record_created_at') && (
                            <td className="px-4 py-3 text-xs text-slate-500" style={{width: "160px"}}>
                              {formatTimestamp(ap.record_created_at)}
                            </td>
                          )}
                          {isColumnVisible('record_updated_at') && (
                            <td className="px-4 py-3 text-xs text-slate-500" style={{width: "160px"}}>
                              {formatTimestamp(ap.record_updated_at)}
                            </td>
                          )}
                          {isColumnVisible('location') && (
                            <td className="px-4 py-3 text-xs text-slate-400 font-mono" style={{width: "180px"}}>
                              {formatLocation(ap.location_geojson)}
                            </td>
                          )}
                        </tr>
                        {isExpanded && (
                          <ObservationsExpandedRow macAddress={ap.mac_address} colSpan={totalColspan} />
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Map Panel (slides in from right) */}
        {isMapVisible && (
          <div className="w-[40%] relative border-l border-slate-700 animate-in slide-in-from-right duration-300">
            <div ref={mapContainerRef} className="absolute inset-0" />

            {/* Map overlay info */}
            <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-700 text-slate-300">
              <div className="text-sm font-semibold">
                {allAccessPoints.filter((ap) => ap.location_geojson).length} with location
              </div>
              {queryResult.isFetching && (
                <div className="text-xs text-blue-400 mt-1">Updating...</div>
              )}
            </div>

            {/* Radius mode hint */}
            {isRadiusMode && (
              <div className="absolute inset-0 bg-blue-600/10 border-4 border-blue-500 border-dashed pointer-events-none flex items-center justify-center">
                <div className="bg-slate-900/90 px-6 py-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-400">Click anywhere on the map</p>
                  <p className="text-sm text-slate-400 mt-1">to set radius search center</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
