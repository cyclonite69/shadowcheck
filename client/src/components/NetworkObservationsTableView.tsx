/**
 * NetworkObservationsTableView - Enhanced table for locations_legacy data
 *
 * Features:
 * - Virtual scrolling for 436K+ observations
 * - Multi-column sorting (Shift+Click)
 * - SSID search (queries locations_legacy truth source)
 * - Dynamic column visibility
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import type { Row, Header, Cell, HeaderGroup, SortingState, Updater } from '@tanstack/react-table';
import { NetworkObservation } from '@/types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2, Wifi, Signal, ArrowUpDown, ArrowUp, ArrowDown, Bluetooth, Radio, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import { useNetworkObservationColumns } from '@/hooks/useNetworkObservationColumns';
import { iconColors } from '@/lib/iconColors';
import { categorizeSecurityType, getSecurityTypeStyle } from '@/lib/securityDecoder';
import { NetworkSecurityPill } from '@/components/NetworkSecurityPill';
import { TruncatedCell } from '@/components/TruncatedCell';
import {
  ColumnDef,
  ColumnOrderState,
  ColumnVisibility,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';

import { flattenNetworkObservations, getTotalNetworkCount } from '@/types';

interface NetworkObservationsTableViewProps {
  data: NetworkObservation[];
  columnConfig: ReturnType<typeof useNetworkObservationColumns>;
  sorting: SortingState;
  onSortingChange: (updater: Updater<SortingState>) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selectedRows?: Record<string, boolean>;
  onSelectedRowsChange?: (selectedRows: Record<string, boolean>) => void;
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
 * Get radio type icon and label based on WiGLE type codes
 * WiGLE Type Codes (https://api.wigle.net/csvFormat.html):
 * - W = WiFi (802.11)
 * - B = BT (Bluetooth Classic)
 * - E = BLE (Bluetooth Low Energy)
 * - G = GSM (2G cellular)
 * - C = CDMA (2G/3G cellular)
 * - D = WCDMA (3G cellular)
 * - L = LTE (4G cellular)
 * - N = NR (5G New Radio)
 */
export function getRadioTypeDisplay(observation: { type: string; frequency?: number | null }): { icon: JSX.Element; label: string } {
  const type = observation.type?.toUpperCase();

  // Standard WiGLE types
  switch (type) {
    case 'WIFI':
    case 'W':
      return {
        icon: <Wifi className={`h-4 w-4 ${iconColors.primary.text}`} />,
        label: 'WiFi'
      };
    case 'BT':
    case 'B':
      return {
        icon: <Bluetooth className={`h-4 w-4 ${iconColors.secondary.text}`} />,
        label: 'BT'
      };
    case 'BLE':
    case 'E':
      return {
        icon: <Bluetooth className={`h-4 w-4 ${iconColors.warning.text}`} />,
        label: 'BLE'
      };
    case 'GSM':
    case 'G':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.info.text}`} />,
        label: 'GSM'
      };
    case 'CDMA':
    case 'C':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.info.text}`} />,
        label: 'CDMA'
      };
    case 'WCDMA':
    case 'D':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.info.text}`} />,
        label: 'WCDMA'
      };
    case 'LTE':
    case 'L':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.info.text}`} />,
        label: 'LTE'
      };
    case 'NR':
    case 'N':
      return {
        icon: <Radio className={`h-4 w-4 ${iconColors.success.text}`} />,
        label: '5G'
      };

    // Unknown types
    case '?':
    case 'UNKNOWN':
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
  return `${value.toFixed(1)}m`;
}



function DraggableColumnHeader({ header }: { header: Header<NetworkObservation, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.id,
  });

  // Handle column sorting with shift-click for multi-sort
  const handleClick = (e: React.MouseEvent) => {
    console.log('[CLICK] Header clicked:', header.id, 'shift:', e.shiftKey, 'at', new Date().getTime());
    e.stopPropagation();

    if (e.shiftKey) {
      // Shift-click: multi-sort mode (keep other sorts, add this column)
      header.column.toggleSorting(undefined, true);
    } else {
      // Regular click: single-sort mode (clear other sorts)
      header.column.toggleSorting(undefined, false);
    }
  };

  const style = {
    width: header.getSize(),
    ...(transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition,
    } : {})
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-4 text-left text-xs font-semibold text-slate-400 uppercase relative group cursor-move"
    >
      {/* Drag handle zone (left side) - use drag listeners here */}
      <div
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-2 hover:bg-blue-500/20"
        title="Drag to reorder"
      />

      {/* Clickable header content - NO listeners here */}
      <button
        onClick={handleClick}
        className="w-full text-left hover:text-slate-200 transition-colors flex items-center gap-2"
        title="Click to sort • Shift+Click for multi-sort"
      >
        <span className="flex-1">
          {header.isPlaceholder
            ? null
            : flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}
        </span>

        {/* Sort indicator */}
        <div className="flex-shrink-0">
          {header.column.getIsSorted() ? (
            header.column.getIsSorted() === 'desc' ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )
          ) : null}
        </div>
      </button>
    </th>
  );
}

export function NetworkObservationsTableView({
  data: allObservations,
  columnConfig,
  sorting,
  onSortingChange,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
  selectedRows = {},
  onSelectedRowsChange = () => {},
}: NetworkObservationsTableViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<NetworkObservation>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={(e) => table.toggleAllRowsSelected(!!e.target.checked)}
          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const radioType = getRadioTypeDisplay(row.original);
        return (
          <div className="flex items-center gap-2">
            {radioType.icon}
            <span className="text-slate-300 text-xs uppercase">
              {radioType.label}
            </span>
          </div>
        );
      },
      size: 90,
      minSize: 90,
      maxSize: 90,
    },
    {
      accessorKey: 'ssid',
      header: 'SSID',
      cell: ({ row }) => (
        <TruncatedCell
          text={row.original.ssid}
          className="text-slate-200 font-medium text-xs"
          fallback={<span className="text-slate-500 italic">Hidden</span>}
        />
      ),
      size: 140,
      minSize: 120,
      maxSize: 180,
    },
    {
      accessorKey: 'bssid',
      header: 'BSSID',
      cell: ({ row }) => (
        <code className="text-xs text-slate-400 truncate block">{row.original.bssid.toUpperCase()}</code>
      ),
      size: 135,
      minSize: 135,
      maxSize: 135,
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
      cell: ({ row }) => (
        <TruncatedCell
          text={row.original.manufacturer}
          className="text-slate-300 text-xs"
          fallback={<span className="text-slate-500 italic">Unknown</span>}
        />
      ),
      enableSorting: true,
      size: 150,
      minSize: 140,
      maxSize: 180,
    },
    {
      accessorKey: 'signal_strength',
      header: 'Signal',
      cell: ({ row }) => (
        <span className={cn('font-mono text-xs truncate block', getSignalColor(row.original.signal_strength))}>
          {formatSignal(row.original.signal_strength)}
        </span>
      ),
      size: 85,
      minSize: 85,
      maxSize: 85,
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ row }) => (
        <span className="text-slate-300 text-xs truncate block">
          {formatFrequency(row.original.frequency)}
        </span>
      ),
      size: 100,
      minSize: 100,
      maxSize: 100,
    },
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ row }) => (
        <span className="text-slate-300 text-xs text-center block">
          {row.original.channel || '-'}
        </span>
      ),
      size: 70,
      minSize: 70,
      maxSize: 70,
    },
    {
      accessorKey: 'capabilities',
      header: 'Security',
      cell: ({ row }) => {
        const securityType = categorizeSecurityType(row.original.capabilities, row.original.type);
        return <NetworkSecurityPill type={securityType} radioType={row.original.type} />;
      },
      size: 120,
      minSize: 100,
      maxSize: 140,
    },
    {
      accessorKey: 'observation_count',
      header: 'Obs',
      cell: ({ row }) => (
        <span className="block">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {row.original.observation_count}
          </span>
        </span>
      ),
      size: 70,
      minSize: 70,
      maxSize: 70,
    },
    {
      accessorKey: 'latitude',
      header: 'Latitude',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs font-mono truncate block">
          {formatCoordinate(row.original.latitude)}
        </span>
      ),
      size: 95,
      minSize: 95,
      maxSize: 95,
    },
    {
      accessorKey: 'longitude',
      header: 'Longitude',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs font-mono truncate block">
          {formatCoordinate(row.original.longitude)}
        </span>
      ),
      size: 95,
      minSize: 95,
      maxSize: 95,
    },
    {
      accessorKey: 'altitude',
      header: 'Altitude',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs truncate block">
          {formatAltitude(row.original.altitude)}
        </span>
      ),
      size: 85,
      minSize: 85,
      maxSize: 85,
    },
    {
      accessorKey: 'accuracy',
      header: 'Accuracy',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs truncate block">
          {formatAccuracy(row.original.accuracy)}
        </span>
      ),
      size: 80,
      minSize: 80,
      maxSize: 80,
    },
    {
      accessorKey: 'observed_at',
      header: 'Last Seen',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs truncate block">
          {formatTimestamp(row.original.observed_at)}
        </span>
      ),
      size: 145,
      minSize: 145,
      maxSize: 145,
    },
  ], []);

  const table = useReactTable({
    data: allObservations,
    columns,
    state: {
      columnVisibility: columnConfig.columnVisibility,
      columnOrder: columnConfig.columnOrder,
      sorting: sorting,
      rowSelection: selectedRows,
    },
    onSortingChange: onSortingChange,
    onColumnVisibilityChange: columnConfig.setColumnVisibility,
    onColumnOrderChange: columnConfig.setColumnOrder,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(selectedRows) : updater;
      onSelectedRowsChange(newSelection);
    },
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(), // Add this if you want client-side sorting too
    manualPagination: true,
    enableMultiSort: true,
    enableSortingRemoval: false,
    enableRowSelection: true,
    getRowId: (row, index) => index.toString(),
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  function handleDragStart(event: DragEndEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = columnConfig.columnOrder.indexOf(active.id as string);
      const newIndex = columnConfig.columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove(columnConfig.columnOrder, oldIndex, newIndex);
      columnConfig.setColumnOrder(newOrder);
    }
    setActiveId(null);
  }

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;
    if (lastItem.index >= table.getRowModel().rows.length - 10 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualItems, table.getRowModel().rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message || 'Unknown error'}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div className="flex flex-col h-full bg-slate-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          {/* Header content */}
        </div>

        {/* Virtual Scrollable Table */}
        <div ref={parentRef} className="flex-1 overflow-auto">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700">
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<NetworkObservation>) => (
                <tr key={headerGroup.id}>
                  <SortableContext
                    items={columnConfig.columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((headerItem: Header<NetworkObservation, unknown>) => {
                      return (
                        <DraggableColumnHeader key={headerItem.id} header={headerItem} />
                      );
                    })}
                  </SortableContext>
                </tr>
              ))}
            </thead>
            <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
              {virtualItems.map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index];
                if (!row) return null;



                return (
                  <tr
                    key={row.id}
                    className="absolute w-full border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-xs"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cellItem: Cell<NetworkObservation, unknown>) => {
                      return (
                      <td
                        key={cellItem.id}
                        style={{ width: cellItem.column.getSize() }}
                        className="p-4"
                      >
                        {flexRender(
                          cellItem.column.columnDef.cell,
                          cellItem.getContext()
                        )}
                      </td>
                    )})}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          {/* Footer content */}
        </div>
      </div>
      <DragOverlay>
        {activeId && table ? (
          <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
            {table.getHeaderGroups().flatMap((g: HeaderGroup<NetworkObservation>) => g.headers).find((h: Header<NetworkObservation, unknown>) => h.id === activeId)?.id}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
