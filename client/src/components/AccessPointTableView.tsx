/**
 * AccessPointTableView - Infinite scroll table with virtual scrolling
 *
 * Features:
 * - Virtual scrolling via @tanstack/react-virtual (handles 100K+ rows)
 * - Infinite pagination with IntersectionObserver
 * - Dynamic column management via useColumnPreferences
 * - Data formatting matching existing NetworkTableView style
 * - Dark theme with slate color palette
 */

import { useRef, useEffect, useMemo } from 'react';
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { Loader2, Wifi, Signal, Shield, ShieldAlert, ShieldCheck, ShieldX, ShieldQuestion } from 'lucide-react';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { type AccessPoint, flattenAccessPoints, getTotalCount } from '@/hooks/useInfiniteAccessPoints';
import { parseSecurityClassification, SECURITY_CLASSIFICATION } from '@/lib/wirelessClassification';
import { cn } from '@/lib/utils';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

interface AccessPointTableViewProps {
  queryResult: UseInfiniteQueryResult<any, Error>;
}

/**
 * Format MAC address to uppercase with colons
 */
function formatMacAddress(mac: string): string {
  return mac.toUpperCase();
}

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
 * Get security classification badge with comprehensive risk assessment
 */
function getSecurityBadge(encryption?: string | null) {
  if (!encryption) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <ShieldQuestion className="h-3 w-3" />
        Unknown
      </span>
    );
  }

  const securityClass = parseSecurityClassification(encryption);
  const metadata = SECURITY_CLASSIFICATION[securityClass];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'acceptable':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'optimal':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical':
        return ShieldX;
      case 'high':
        return ShieldAlert;
      case 'moderate':
      case 'acceptable':
        return ShieldCheck;
      case 'optimal':
        return ShieldCheck;
      default:
        return Shield;
    }
  };

  const Icon = getRiskIcon(metadata.risk);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
        getRiskColor(metadata.risk)
      )}
      title={`${metadata.label} - ${metadata.description}`}
    >
      <Icon className="h-3 w-3" />
      {metadata.label}
    </span>
  );
}

/**
 * Table header cell component
 */
function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase',
        'bg-slate-900 border-b border-slate-700',
        className
      )}
    >
      {children}
    </th>
  );
}

/**
 * Table cell component
 */
function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-sm text-slate-300', className)}>
      {children}
    </td>
  );
}

export function AccessPointTableView({ queryResult }: AccessPointTableViewProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = queryResult;

  const { isColumnVisible } = useColumnPreferences();

  // Flatten all pages into single array
  const allAccessPoints = useMemo(() => flattenAccessPoints(data?.pages), [data?.pages]);
  const totalCount = getTotalCount(data?.pages);

  // Refs for virtual scrolling
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: allAccessPoints.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // 48px row height
    overscan: 5, // Render 5 extra rows above/below viewport
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Infinite scroll trigger - fetch when scrolled near bottom
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) return;

    // Trigger fetch when last visible item is within 10 items of the end
    if (
      lastItem.index >= allAccessPoints.length - 10 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    allAccessPoints.length,
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
          <p className="text-sm text-slate-400">Loading access points...</p>
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
          <h3 className="text-lg font-semibold text-slate-200">Failed to load access points</h3>
          <p className="text-sm text-slate-400">{error?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (allAccessPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <Wifi className="h-12 w-12 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-300">No access points found</h3>
          <p className="text-sm text-slate-500">
            Try adjusting your filters or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Table Header Info */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">
            Showing {allAccessPoints.length.toLocaleString()} of {totalCount.toLocaleString()} access points
          </h3>
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
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <table className="w-full text-sm">
            {/* Sticky Header */}
            <thead className="sticky top-0 z-10">
              <tr>
                {/* Always visible core columns */}
                <TableHeader>MAC Address</TableHeader>
                <TableHeader>Network Name</TableHeader>
                <TableHeader>Security</TableHeader>
                <TableHeader>Radio Tech</TableHeader>
                <TableHeader>Signal</TableHeader>

                {/* Conditional columns */}
                {isColumnVisible('primary_frequency_hz') && <TableHeader>Frequency</TableHeader>}
                {isColumnVisible('manufacturer') && <TableHeader>Manufacturer</TableHeader>}
                {isColumnVisible('oui_prefix_hex') && <TableHeader>OUI</TableHeader>}
                {isColumnVisible('is_hidden_network') && <TableHeader>Hidden</TableHeader>}
                {isColumnVisible('is_mobile_device') && <TableHeader>Mobile</TableHeader>}
                {isColumnVisible('data_quality') && <TableHeader>Quality</TableHeader>}
                {isColumnVisible('total_observations') && <TableHeader>Obs</TableHeader>}
                {isColumnVisible('unique_data_sources') && <TableHeader>Sources</TableHeader>}
                {isColumnVisible('mobility_confidence_score') && <TableHeader>Mobility</TableHeader>}
                {isColumnVisible('first_seen') && <TableHeader>First Seen</TableHeader>}
                {isColumnVisible('last_seen') && <TableHeader>Last Seen</TableHeader>}
                {isColumnVisible('record_created_at') && <TableHeader>Created</TableHeader>}
                {isColumnVisible('record_updated_at') && <TableHeader>Updated</TableHeader>}
                {isColumnVisible('location') && <TableHeader>Location</TableHeader>}
              </tr>
            </thead>

            {/* Virtual Rows */}
            <tbody>
              {virtualItems.map((virtualRow: VirtualItem) => {
                const ap = allAccessPoints[virtualRow.index];
                if (!ap) return null;

                return (
                  <tr
                    key={ap.access_point_id}
                    id={`ap-row-${ap.access_point_id}`}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {/* Core columns */}
                    <TableCell>
                      <code className="text-xs text-slate-400">
                        {formatMacAddress(ap.mac_address)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-200 font-medium">
                        {ap.current_network_name || (
                          <span className="text-slate-500 italic">Hidden</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getSecurityBadge(ap.most_recent_encryption)}
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-300 text-xs uppercase">
                        {ap.radio_technology}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('font-mono text-xs', getSignalColor(ap.max_signal_observed_dbm))}>
                        {formatSignal(ap.max_signal_observed_dbm)}
                      </span>
                    </TableCell>

                    {/* Conditional columns */}
                    {isColumnVisible('primary_frequency_hz') && (
                      <TableCell>{formatFrequency(ap.primary_frequency_hz)}</TableCell>
                    )}
                    {isColumnVisible('manufacturer') && (
                      <TableCell>
                        <span className="text-slate-400 text-xs">
                          {ap.manufacturer || '-'}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('oui_prefix_hex') && (
                      <TableCell>
                        <code className="text-xs text-slate-500">{ap.oui_prefix_hex || '-'}</code>
                      </TableCell>
                    )}
                    {isColumnVisible('is_hidden_network') && (
                      <TableCell>
                        <span className="text-xs">
                          {ap.is_hidden_network ? '✓' : '-'}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('is_mobile_device') && (
                      <TableCell>
                        <span className="text-xs">
                          {ap.is_mobile_device ? '✓' : '-'}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('data_quality') && (
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                            getQualityBadgeClass(ap.data_quality)
                          )}
                        >
                          {ap.data_quality}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('total_observations') && (
                      <TableCell>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {ap.total_observations}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('unique_data_sources') && (
                      <TableCell>
                        <span className="text-slate-400 text-xs">
                          {ap.unique_data_sources}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('mobility_confidence_score') && (
                      <TableCell>
                        <span className="text-slate-400 text-xs">
                          {ap.mobility_confidence_score !== null
                            ? (ap.mobility_confidence_score * 100).toFixed(0) + '%'
                            : '-'}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('first_seen') && (
                      <TableCell>
                        <span className="text-slate-400 text-xs">
                          {formatTimestamp(ap.first_seen)}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('last_seen') && (
                      <TableCell>
                        <span className="text-slate-400 text-xs">
                          {formatTimestamp(ap.last_seen)}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('record_created_at') && (
                      <TableCell>
                        <span className="text-slate-500 text-xs">
                          {formatTimestamp(ap.record_created_at)}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('record_updated_at') && (
                      <TableCell>
                        <span className="text-slate-500 text-xs">
                          {formatTimestamp(ap.record_updated_at)}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('location') && (
                      <TableCell>
                        <span className="text-slate-400 text-xs font-mono">
                          {formatLocation(ap.location_geojson)}
                        </span>
                      </TableCell>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with loading/end state */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
        {isFetchingNextPage ? (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more access points...</span>
          </div>
        ) : hasNextPage ? (
          <p className="text-xs text-slate-500 text-center">
            Scroll down to load more networks
          </p>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            ✓ All {totalCount.toLocaleString()} access points loaded
          </p>
        )}
      </div>
    </div>
  );
}
