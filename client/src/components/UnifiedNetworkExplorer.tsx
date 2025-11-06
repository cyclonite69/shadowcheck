/**
 * UnifiedNetworkExplorer - Combined view for observations and access points
 *
 * Features:
 * - Toggle between raw observations and aggregated access points
 * - Unified filtering across both views
 * - Consistent column structure
 * - Multi-column sorting with column reordering
 * - Infinite scroll pagination
 * - Export capabilities
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { Layers, Network, Download, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedFilterPanel } from './UnifiedFilterPanel';
import { UnifiedDataTable } from './UnifiedDataTable';
import { useInfiniteAccessPoints, flattenAccessPoints, getTotalCount as getAPTotalCount } from '@/hooks/useInfiniteAccessPoints';
import { useInfiniteNetworkObservations } from '@/hooks/useInfiniteNetworkObservations';
import { flattenNetworkObservations, getTotalNetworkCount } from '@/types';
import type { UnifiedFilters } from '@/lib/unifiedFilters';
import { filtersToQueryParams } from '@/lib/unifiedFilters';
import { getDefaultVisibleColumns } from '@/lib/unifiedColumns';
import { type Updater } from '@tanstack/react-table';

type ViewMode = 'observations' | 'access-points';

// Define a custom SortConfig interface for clarity and API consistency
interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

export function UnifiedNetworkExplorer() {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('observations');

  // Filter state
  const [filters, setFilters] = useState<UnifiedFilters>({});

  // Column configuration
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    getDefaultVisibleColumns().map(c => c.id)
  );
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortingState>([]);

  // Convert unified filters to API params
  const apiFilters = filtersToQueryParams(filters);

  // Fetch observations
  const observationsQuery = useInfiniteNetworkObservations({
    filters: {
      search: filters.search,
      radioTypes: filters.radioTypes,
      minSignal: filters.minSignal,
      maxSignal: filters.maxSignal,
      sortBy: sortConfig.length > 0 ? sortConfig[0].id : undefined, // Pass primary sort
      sortDir: sortConfig.length > 0 ? (sortConfig[0].desc ? 'desc' : 'asc') : undefined, // Pass primary sort direction
    },
    pageSize: 500,
    enabled: viewMode === 'observations',
  });

  // Fetch access points
  const accessPointsQuery = useInfiniteAccessPoints({
    filters: {
      search: filters.search,
      radioTypes: filters.radioTypes,
      minSignal: filters.minSignal,
      maxSignal: filters.maxSignal,
      dataQuality: filters.dataQuality,
      encryption: filters.encryption,
      sortBy: sortConfig.length > 0 ? sortConfig[0].id : undefined, // Pass primary sort
      sortDir: sortConfig.length > 0 ? (sortConfig[0].desc ? 'desc' : 'asc') : undefined, // Pass primary sort direction
    },
    pageSize: 500,
    enabled: viewMode === 'access-points',
  });

  // Get data based on view mode
  const data = viewMode === 'observations'
    ? flattenNetworkObservations(observationsQuery.data?.pages)
    : flattenAccessPoints(accessPointsQuery.data?.pages);

  const totalCount = viewMode === 'observations'
    ? getTotalNetworkCount(observationsQuery.data?.pages)
    : getAPTotalCount(accessPointsQuery.data?.pages);

  const isLoading = viewMode === 'observations'
    ? observationsQuery.isLoading
    : accessPointsQuery.isLoading;

  const isFetching = viewMode === 'observations'
    ? observationsQuery.isFetching
    : accessPointsQuery.isFetching;

  // Handle view mode toggle
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'observations' ? 'access-points' : 'observations');
    // Reset sort when switching views
    setSortConfig([]);
  };

  // Export data as CSV
  const exportToCSV = () => {
    if (data.length === 0) return;

    // Get headers
    const headers = visibleColumns.join(',');

    // Get rows
    const rows = data.map((row: Record<string, any>) => {
      return visibleColumns.map(colId => {
        const value = row[colId];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',');
    });

    // Create CSV
    const csv = [headers, ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowcheck-${viewMode}-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Refresh data
  const refreshData = () => {
    if (viewMode === 'observations') {
      observationsQuery.refetch();
    } else {
      accessPointsQuery.refetch();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-200">
                Network Explorer
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {viewMode === 'observations'
                  ? 'Individual network observations'
                  : 'Aggregated access points'
                } • {totalCount.toLocaleString()} total • {data.length.toLocaleString()} loaded
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setViewMode('observations')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                    viewMode === 'observations'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Layers className="h-4 w-4" />
                  Observations
                </button>
                <button
                  onClick={() => setViewMode('access-points')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                    viewMode === 'access-points'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Network className="h-4 w-4" />
                  Access Points
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={refreshData}
                disabled={isFetching}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
                Refresh
              </button>

              <button
                onClick={exportToCSV}
                disabled={data.length === 0}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              <strong>Tips:</strong> Click column headers to sort. Shift+Click for multi-column sorting.
              Drag column headers to reorder. Use filters below to narrow results.
              Toggle between Observations (raw data) and Access Points (aggregated view).
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UnifiedFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
      />

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
              <p className="text-sm text-slate-400">Loading {viewMode}...</p>
            </div>
          </div>
        ) : (
          <UnifiedDataTable
            data={data}
            viewMode={viewMode}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            columnOrder={columnOrder}
            onColumnOrderChange={setColumnOrder}
            sortConfig={sortConfig.map(s => ({ columnId: s.id, direction: s.desc ? 'desc' : 'asc' }))}
            onSortChange={(custom) => setSortConfig(custom.map(c => ({ id: c.columnId, desc: c.direction === 'desc' })))}
            onRowClick={(row) => {
              console.log('Row clicked:', row);
              // Could expand row details, show on map, etc.
            }}
          />
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex-shrink-0 border-t border-slate-700 px-6 py-3 bg-slate-800/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Showing {data.length.toLocaleString()} of {totalCount.toLocaleString()} {viewMode}
            </span>
            {filters.radioTypes && filters.radioTypes.length > 0 && (
              <span>
                Filtered by: {filters.radioTypes.join(', ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {sortConfig.length > 0 && (
              <span>
                Sorted by: {sortConfig.map((s: { id: string; desc: boolean }) => s.id).join(', ')}
              </span>
            )}
            <span>
              {visibleColumns.length} columns visible
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
