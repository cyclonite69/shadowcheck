/**
 * NetworkObservationsTableView - Enhanced table for locations_legacy data
 *
 * Features:
 * - Virtual scrolling for 436K+ observations
 * - Multi-column sorting (Shift+Click)
 * - SSID search (queries locations_legacy truth source)
 * - Dynamic column visibility
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2, Wifi, Signal, ArrowUpDown, ArrowUp, ArrowDown, Bluetooth, Radio, HelpCircle } from 'lucide-react';
import { type NetworkObservation, flattenNetworkObservations, getTotalNetworkCount } from '@/hooks/useInfiniteNetworkObservations';
import { cn } from '@/lib/utils';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import { useNetworkObservationColumns } from '@/hooks/useNetworkObservationColumns';
import { iconColors } from '@/lib/iconColors';
import { NetworkLocationModal } from './NetworkLocationModal';

interface NetworkObservationsTableViewProps {
  queryResult: UseInfiniteQueryResult<any, Error>;
  columnConfig: ReturnType<typeof useNetworkObservationColumns>;
}

type SortColumn = 'ssid' | 'bssid' | 'signal' | 'frequency' | 'type' | 'observations' | 'seen' | 'channel' | 'latitude' | 'longitude' | 'altitude' | 'accuracy' | 'security' | 'manufacturer';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

/**
 * Format frequency from Hz to MHz/GHz
 */
function formatFrequency(frequency: number | null): string {
  if (!frequency) return '-';

  if (frequency >= 1000) {
    return `${(frequency / 1000).toFixed(3)} GHz`;
  }

  return `${frequency} MHz`;
}

/**
 * Format signal strength
 */
function formatSignal(dbm: number | null): string {
  if (dbm === null || dbm === undefined) return '-';
  return `${dbm} dBm`;
}

/**
 * Get signal color
 */
function getSignalColor(dbm: number | null): string {
  if (!dbm) return 'text-slate-500';
  if (dbm >= -50) return 'text-green-400';
  if (dbm >= -70) return 'text-yellow-400';
  if (dbm >= -85) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Format timestamp
 */
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoString;
  }
}

/**
 * Get radio type icon and label with intelligent Kismet → WiGLE classification
 * Kismet uses different type codes that need interpretation:
 * - E = "Ethernet" but actually means Bluetooth (freq 7936) or WiFi bridges
 * - L = LTE (should be Cellular)
 * - G = GPRS/GSM (should be Cellular)
 * - N = Unknown/NFC
 */
function getRadioTypeDisplay(observation: { type: string; frequency?: number | null }): { icon: JSX.Element; label: string } {
  const type = observation.type?.toUpperCase();
  const freq = observation.frequency || 0;

  // Analyze Kismet 'E' type by frequency
  if (type === 'E') {
    if (freq === 7936 || freq === 0 || !freq) {
      return {
        icon: <Bluetooth className={`h-4 w-4 ${iconColors.secondary.text}`} />,
        label: 'BT'
      };
    } else if ((freq >= 2412 && freq <= 2484) || (freq >= 5000 && freq <= 7125)) {
      return {
        icon: <Wifi className={`h-4 w-4 ${iconColors.primary.text}`} />,
        label: 'WiFi'
      };
    }
    return {
      icon: <HelpCircle className={`h-4 w-4 ${iconColors.neutral.text}`} />,
      label: 'Unknown'
    };
  }

  // Standard WiGLE types
  switch (type) {
    case 'W':
      return {
        icon: <Wifi className={`h-4 w-4 ${iconColors.primary.text}`} />,
        label: 'WiFi'
      };
    case 'B':
      return {
        icon: <Bluetooth className={`h-4 w-4 ${iconColors.secondary.text}`} />,
        label: 'BT'
      };
    case 'C':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.info.text}`} />,
        label: 'Cellular'
      };

    // Cellular variants
    case 'L':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.info.text}`} />,
        label: 'LTE'
      };
    case 'G':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.info.text}`} />,
        label: 'GSM'
      };

    // Unknown types
    case 'N':
    case '?':
      return {
        icon: <HelpCircle className={`h-4 w-4 ${iconColors.neutral.text}`} />,
        label: 'Unknown'
      };

    default:
      return {
        icon: <HelpCircle className={`h-4 w-4 ${iconColors.neutral.text}`} />,
        label: type || '-'
      };
  }
}

/**
 * Format coordinate
 */
function formatCoordinate(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return num.toFixed(6);
}

/**
 * Format altitude
 */
function formatAltitude(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)}m`;
}

/**
 * Format accuracy
 */
function formatAccuracy(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return `±${value.toFixed(1)}m`;
}

/**
 * Table header with sorting
 */
function SortableHeader({
  column,
  sortConfig,
  onSort,
  children,
}: {
  column: SortColumn;
  sortConfig: SortConfig[];
  onSort: (column: SortColumn, shiftKey: boolean) => void;
  children: React.ReactNode;
}) {
  const sortIndex = sortConfig.findIndex((s) => s.column === column);
  const config = sortIndex >= 0 ? sortConfig[sortIndex] : null;

  const SortIcon = config
    ? config.direction === 'asc'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:bg-slate-800 transition-colors select-none bg-slate-900 border-b border-slate-700"
      onClick={(e) => onSort(column, e.shiftKey)}
      title="Click to sort, Shift+Click for multi-column sort"
    >
      <div className="flex items-center gap-2">
        {children}
        <SortIcon className={cn('h-3 w-3', config ? 'text-blue-400' : 'text-slate-600')} />
        {sortConfig.length > 1 && config && (
          <span className="text-xs text-blue-400">{sortIndex + 1}</span>
        )}
      </div>
    </th>
  );
}

export function NetworkObservationsTableView({ queryResult, columnConfig }: NetworkObservationsTableViewProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = queryResult;

  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<Set<string>>(new Set());
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkObservation | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Toggle network selection
  const toggleNetworkSelection = (bssid: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedNetworks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bssid)) {
        newSet.delete(bssid);
      } else {
        newSet.add(bssid);
      }
      return newSet;
    });
  };

  // Select all visible networks
  const selectAll = () => {
    const allBssids = new Set(sortedObservations.map(obs => obs.bssid));
    setSelectedNetworks(allBssids);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedNetworks(new Set());
  };

  // Define all column metadata
  const columnMetadata: Record<string, { label: string; width: string; sortable: boolean }> = {
    select: { label: '', width: '50px', sortable: false },
    type: { label: 'Type', width: '80px', sortable: true },
    ssid: { label: 'SSID', width: '200px', sortable: true },
    bssid: { label: 'BSSID', width: '180px', sortable: true },
    manufacturer: { label: 'Manufacturer', width: '200px', sortable: true },
    signal: { label: 'Signal', width: '100px', sortable: true },
    frequency: { label: 'Frequency', width: '120px', sortable: true },
    channel: { label: 'Channel', width: '80px', sortable: true },
    security: { label: 'Security', width: '150px', sortable: true },
    observations: { label: 'Obs', width: '80px', sortable: true },
    latitude: { label: 'Latitude', width: '120px', sortable: true },
    longitude: { label: 'Longitude', width: '120px', sortable: true },
    altitude: { label: 'Altitude', width: '100px', sortable: true },
    accuracy: { label: 'Accuracy', width: '100px', sortable: true },
    seen: { label: 'Last Seen', width: 'flex-1', sortable: true },
  };

  // Get visible columns in order
  const visibleColumns = useMemo(() => {
    return Object.keys(columnMetadata).filter((id) => columnConfig.isColumnVisible(id));
  }, [columnConfig]);

  // Flatten all pages
  const allObservations = useMemo(() => flattenNetworkObservations(data?.pages), [data?.pages]);
  const totalCount = getTotalNetworkCount(data?.pages);

  // Apply sorting
  const sortedObservations = useMemo(() => {
    if (sortConfig.length === 0) return allObservations;

    return [...allObservations].sort((a, b) => {
      for (const { column, direction } of sortConfig) {
        let comparison = 0;

        switch (column) {
          case 'ssid':
            comparison = (a.ssid || '').localeCompare(b.ssid || '');
            break;
          case 'bssid':
            comparison = a.bssid.localeCompare(b.bssid);
            break;
          case 'manufacturer':
            comparison = (a.manufacturer || '').localeCompare(b.manufacturer || '');
            break;
          case 'signal':
            const signalA = a.signal_strength ?? -999;
            const signalB = b.signal_strength ?? -999;
            comparison = signalA - signalB;
            break;
          case 'frequency':
            comparison = (a.frequency || 0) - (b.frequency || 0);
            break;
          case 'channel':
            comparison = (a.channel || 0) - (b.channel || 0);
            break;
          case 'type':
            comparison = (a.type || '').localeCompare(b.type || '');
            break;
          case 'security':
            comparison = (a.encryption || '').localeCompare(b.encryption || '');
            break;
          case 'observations':
            comparison = a.observation_count - b.observation_count;
            break;
          case 'latitude':
            const latA = a.latitude ? parseFloat(a.latitude) : -999;
            const latB = b.latitude ? parseFloat(b.latitude) : -999;
            comparison = latA - latB;
            break;
          case 'longitude':
            const lonA = a.longitude ? parseFloat(a.longitude) : -999;
            const lonB = b.longitude ? parseFloat(b.longitude) : -999;
            comparison = lonA - lonB;
            break;
          case 'altitude':
            comparison = (a.altitude ?? -999) - (b.altitude ?? -999);
            break;
          case 'accuracy':
            comparison = (a.accuracy ?? -999) - (b.accuracy ?? -999);
            break;
          case 'seen':
            const dateA = new Date(a.observed_at || 0).getTime();
            const dateB = new Date(b.observed_at || 0).getTime();
            comparison = dateA - dateB;
            break;
        }

        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [allObservations, sortConfig]);

  // Handle sorting
  const handleSort = (column: SortColumn, shiftKey: boolean) => {
    setSortConfig((prev) => {
      if (shiftKey) {
        // Multi-column sort
        const existingIndex = prev.findIndex((s) => s.column === column);
        if (existingIndex >= 0) {
          // Toggle direction
          const newConfig = [...prev];
          newConfig[existingIndex] = {
            column,
            direction: prev[existingIndex].direction === 'asc' ? 'desc' : 'asc',
          };
          return newConfig;
        } else {
          // Add new column
          return [...prev, { column, direction: 'asc' }];
        }
      } else {
        // Single column sort
        const existing = prev.find((s) => s.column === column);
        if (existing) {
          return [{ column, direction: existing.direction === 'asc' ? 'desc' : 'asc' }];
        }
        return [{ column, direction: 'asc' }];
      }
    });
  };

  // Helper to render cell content
  const renderCellContent = (columnId: string, obs: NetworkObservation) => {
    switch (columnId) {
      case 'select':
        return (
          <div className="px-4 py-3 flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedNetworks.has(obs.bssid)}
              onChange={(e) => toggleNetworkSelection(obs.bssid, e as any)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
          </div>
        );
      case 'type':
        const radioType = getRadioTypeDisplay(obs);
        return (
          <div className="px-4 py-3 flex items-center gap-2">
            {radioType.icon}
            <span className="text-slate-300 text-xs uppercase">
              {radioType.label}
            </span>
          </div>
        );
      case 'ssid':
        return (
          <span className="px-4 py-3 text-slate-200 font-medium truncate block">
            {obs.ssid || <span className="text-slate-500 italic">Hidden</span>}
          </span>
        );
      case 'bssid':
        return (
          <code className="px-4 py-3 text-xs text-slate-400 truncate block">{obs.bssid.toUpperCase()}</code>
        );
      case 'manufacturer':
        return (
          <span className="px-4 py-3 text-slate-300 text-xs truncate block" title={obs.manufacturer || 'Unknown'}>
            {obs.manufacturer || <span className="text-slate-500 italic">Unknown</span>}
          </span>
        );
      case 'signal':
        return (
          <span className={cn('px-4 py-3 font-mono text-xs truncate block', getSignalColor(obs.signal_strength))}>
            {formatSignal(obs.signal_strength)}
          </span>
        );
      case 'frequency':
        return (
          <span className="px-4 py-3 text-slate-300 text-xs truncate block">
            {formatFrequency(obs.frequency)}
          </span>
        );
      case 'channel':
        return (
          <span className="px-4 py-3 text-slate-300 text-xs truncate block">
            {obs.channel || '-'}
          </span>
        );
      case 'security':
        return (
          <span className="px-4 py-3 text-slate-400 text-xs truncate block">
            {obs.encryption || '-'}
          </span>
        );
      case 'observations':
        return (
          <span className="px-4 py-3 block">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {obs.observation_count}
            </span>
          </span>
        );
      case 'latitude':
        return (
          <span className="px-4 py-3 text-slate-400 text-xs font-mono truncate block">
            {formatCoordinate(obs.latitude)}
          </span>
        );
      case 'longitude':
        return (
          <span className="px-4 py-3 text-slate-400 text-xs font-mono truncate block">
            {formatCoordinate(obs.longitude)}
          </span>
        );
      case 'altitude':
        return (
          <span className="px-4 py-3 text-slate-400 text-xs truncate block">
            {formatAltitude(obs.altitude)}
          </span>
        );
      case 'accuracy':
        return (
          <span className="px-4 py-3 text-slate-400 text-xs truncate block">
            {formatAccuracy(obs.accuracy)}
          </span>
        );
      case 'seen':
        return (
          <span className="px-4 py-3 text-slate-400 text-xs truncate block">
            {formatTimestamp(obs.observed_at)}
          </span>
        );
      default:
        return <span className="px-4 py-3 block">-</span>;
    }
  };

  // Virtual scrolling
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: sortedObservations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Infinite scroll trigger
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) return;

    if (
      lastItem.index >= sortedObservations.length - 10 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    sortedObservations.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Loading network observations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Signal className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Failed to load observations</h3>
          <p className="text-sm text-slate-400">{error?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (sortedObservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <Wifi className="h-12 w-12 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-300">No observations found</h3>
          <p className="text-sm text-slate-500">Try adjusting your filters or check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">
              Showing {sortedObservations.length.toLocaleString()} of {totalCount.toLocaleString()} observations
            </h3>
            {sortConfig.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>Sorted by: {sortConfig.map((s) => s.column).join(', ')}</span>
                <button
                  onClick={() => setSortConfig([])}
                  className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading more...
            </div>
          )}
        </div>
      </div>

      {/* Virtual Scrollable Table */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700">
          <div className="flex text-sm">
            {visibleColumns.map((columnId) => {
              const meta = columnMetadata[columnId];
              const sortIndex = sortConfig.findIndex((s) => s.column === columnId);
              const config = sortIndex >= 0 ? sortConfig[sortIndex] : null;
              const SortIcon = config
                ? config.direction === 'asc'
                  ? ArrowUp
                  : ArrowDown
                : ArrowUpDown;

              return (
                <div
                  key={columnId}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase',
                    meta.sortable && 'cursor-pointer hover:bg-slate-800 transition-colors select-none'
                  )}
                  style={
                    meta.width === 'flex-1'
                      ? { flex: 1 }
                      : { width: meta.width, flexShrink: 0 }
                  }
                  onClick={meta.sortable ? (e) => handleSort(columnId as SortColumn, e.shiftKey) : undefined}
                  title={meta.sortable ? 'Click to sort, Shift+Click for multi-column sort' : undefined}
                >
                  <div className="flex items-center gap-2">
                    {meta.label}
                    {meta.sortable && (
                      <>
                        <SortIcon className={cn('h-3 w-3', config ? 'text-blue-400' : 'text-slate-600')} />
                        {sortConfig.length > 1 && config && (
                          <span className="text-xs text-blue-400">{sortIndex + 1}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Virtual Rows */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const obs = sortedObservations[virtualRow.index];
            if (!obs) return null;

            return (
              <div
                key={`${obs.bssid}-${virtualRow.index}`}
                className="flex border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-sm cursor-pointer"
                onClick={() => setSelectedNetwork(obs)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                title="Click to view location on map"
              >
                {visibleColumns.map((columnId) => {
                  const meta = columnMetadata[columnId];
                  return (
                    <div
                      key={columnId}
                      style={
                        meta.width === 'flex-1'
                          ? { flex: 1 }
                          : { width: meta.width, flexShrink: 0 }
                      }
                    >
                      {renderCellContent(columnId, obs)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
        {isFetchingNextPage ? (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more observations...</span>
          </div>
        ) : hasNextPage ? (
          <p className="text-xs text-slate-500 text-center">Scroll down to load more</p>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            ✓ All {totalCount.toLocaleString()} observations loaded
          </p>
        )}
      </div>

      {/* Location Modal */}
      {selectedNetwork && (
        <NetworkLocationModal
          network={selectedNetwork}
          onClose={() => setSelectedNetwork(null)}
        />
      )}
    </div>
  );
}
