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
import type { Row, Header, Cell, HeaderGroup } from '@tanstack/react-table';
import type { NetworkObservation } from '@/types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2, Wifi, Signal, ArrowUpDown, ArrowUp, ArrowDown, Bluetooth, Radio, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import { useNetworkObservationColumns } from '@/hooks/useNetworkObservationColumns';
import { iconColors } from '@/lib/iconColors';
import { NetworkLocationModal } from './NetworkLocationModal';
import {
  ColumnDef,
  ColumnOrderState,
  ColumnVisibility,
  flexRender,
  getCoreRowModel,
  Header,
  Row,
  Cell,
  HeaderGroup,
  useReactTable,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import type { NetworkObservation } from '@/types';
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



function DraggableColumnHeader({ header }: { header: Header<NetworkObservation, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 text-left text-xs font-semibold text-slate-400 uppercase"
    >
      {header.isPlaceholder
        ? null
        : flexRender(
            header.column.columnDef.header,
            header.getContext()
          )}
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
}: NetworkObservationsTableViewProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkObservation | null>(null);
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
      size: 80,
    },
    {
      accessorKey: 'ssid',
      header: 'SSID',
      cell: ({ row }) => (
        <span className="text-slate-200 font-medium truncate block">
          {row.original.ssid || <span className="text-slate-500 italic">Hidden</span>}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: 'bssid',
      header: 'BSSID',
      cell: ({ row }) => (
        <code className="text-xs text-slate-400 truncate block">{row.original.bssid.toUpperCase()}</code>
      ),
      size: 180,
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
      cell: ({ row }) => (
        <span className="text-slate-300 text-xs truncate block" title={row.original.manufacturer || 'Unknown'}>
          {row.original.manufacturer || <span className="text-slate-500 italic">Unknown</span>}
        </span>
      ),
      enableSorting: true,
      size: 200,
    },
    {
      accessorKey: 'signal_strength',
      header: 'Signal',
      cell: ({ row }) => (
        <span className={cn('font-mono text-xs truncate block', getSignalColor(row.original.signal_strength))}>
          {formatSignal(row.original.signal_strength)}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ row }) => (
        <span className="text-slate-300 text-xs truncate block">
          {formatFrequency(row.original.frequency)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ row }) => (
        <span className="text-slate-300 text-xs truncate block">
          {row.original.channel || '-'}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: 'encryption',
      header: 'Security',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs truncate block">
          {row.original.encryption || '-'}
        </span>
      ),
      size: 150,
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
      size: 100,
    },
    {
      accessorKey: 'latitude',
      header: 'Latitude',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs font-mono truncate block">
          {formatCoordinate(row.original.latitude)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'longitude',
      header: 'Longitude',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs font-mono truncate block">
          {formatCoordinate(row.original.longitude)}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'altitude',
      header: 'Altitude',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs truncate block">
          {formatAltitude(row.original.altitude)}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'accuracy',
      header: 'Accuracy',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs truncate block">
          {formatAccuracy(row.original.accuracy)}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'observed_at',
      header: 'Last Seen',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs truncate block">
          {formatTimestamp(row.original.observed_at)}
        </span>
      ),
      size: 150,
    },
  ], []);

  const table = useReactTable({
    data: allObservations,
    columns,
    state: {
      columnVisibility: columnConfig.columnVisibility,
      columnOrder: columnConfig.columnOrder,
      sorting: sorting,
    },
    onSortingChange: onSortingChange,
    onColumnVisibilityChange: columnConfig.setColumnVisibility,
    onColumnOrderChange: columnConfig.setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
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

      const activeHeader = useMemo(() => {
      if (!activeId) return null;
      const header = table.getHeaderGroups().flatMap((g: HeaderGroup<NetworkObservation>) => g.headers).find((h: Header<NetworkObservation, unknown>) => h.id === activeId);
      return header;
    }, [activeId, table]);
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
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700">
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<NetworkObservation>) => (
                <ResizablePanelGroup direction="horizontal" key={headerGroup.id} className="flex">
                  <SortableContext
                    items={columnConfig.columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header: Header<NetworkObservation, unknown>) => {
                      const { header } = header.getHeaderProps(headerGroup.getHeaderGroupProps() as HeaderGroup<NetworkObservation>) as Header<NetworkObservation, unknown>;
                      return (
                      <DraggableColumnHeader key={header.id} header={header as Header<NetworkObservation, unknown>} />
                    )})}
                </ResizablePanelGroup>
              ))}
            </thead>
            <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
              {virtualItems.map((virtualRow) => {
                const { row } = table.getRowModel().rows[virtualRow.index] as Row<NetworkObservation>;
                if (!row) return null;

                prepareRow(row as Row<NetworkObservation>);

                return (
                  <tr
                    key={row.id}
                    className="flex absolute w-full border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-sm cursor-pointer"
                    onClick={() => setSelectedNetwork(row.original)}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    title="Click to view location on map"
                  >
                    {row.getVisibleCells().map((cell: Cell<NetworkObservation, unknown>) => {
                      const { cell } = cell.getCellProps() as Cell<NetworkObservation, unknown>;
                      return (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="p-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )})}
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          {/* Footer content */}
        </div>

        {selectedNetwork && (
          <NetworkLocationModal
            network={{ ...selectedNetwork, latitude: String(selectedNetwork.latitude || ''), longitude: String(selectedNetwork.longitude || '') }}
            onClose={() => setSelectedNetwork(null)}
          />
        )}
      </div>
      <DragOverlay>
        {activeHeader ? (
          <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
            {flexRender(activeHeader.column.columnDef.header, activeHeader.getContext())}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
