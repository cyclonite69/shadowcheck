/**
 * UnifiedDataTable - Standardized table component for all ShadowCheck views
 *
 * Features:
 * - Multi-column sorting (Shift+Click to add secondary sorts)
 * - Column reordering (drag and drop)
 * - Column visibility toggle
 * - Virtual scrolling for large datasets
 * - Responsive design
 * - Works with both observations and access points data
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  UNIFIED_COLUMNS,
  type UnifiedColumnConfig,
  extractColumnValue,
  formatColumnValue,
} from '@/lib/unifiedColumns';

interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

interface UnifiedDataTableProps {
  data: any[];
  viewMode: 'observations' | 'access-points';
  visibleColumns?: string[]; // Column IDs to show
  onVisibleColumnsChange?: (columns: string[]) => void;
  columnOrder?: string[]; // Order of columns
  onColumnOrderChange?: (order: string[]) => void;
  sortConfig?: SortConfig[];
  onSortChange?: (config: SortConfig[]) => void;
  onRowClick?: (row: any) => void;
  className?: string;
}

export function UnifiedDataTable({
  data,
  viewMode,
  visibleColumns,
  onVisibleColumnsChange,
  columnOrder,
  onColumnOrderChange,
  sortConfig = [],
  onSortChange,
  onRowClick,
  className,
}: UnifiedDataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Determine which columns to display
  const displayColumns = useMemo(() => {
    // Start with all columns
    let cols = [...UNIFIED_COLUMNS];

    // Filter by visibility
    if (visibleColumns) {
      cols = cols.filter(col => visibleColumns.includes(col.id));
    } else {
      cols = cols.filter(col => col.defaultVisible);
    }

    // Apply custom order
    if (columnOrder) {
      cols.sort((a, b) => {
        const aIndex = columnOrder.indexOf(a.id);
        const bIndex = columnOrder.indexOf(b.id);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return cols;
  }, [visibleColumns, columnOrder]);

  // Sort data based on sort config
  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const sort of sortConfig) {
        const aValue = extractColumnValue(sort.columnId, a, viewMode);
        const bValue = extractColumnValue(sort.columnId, b, viewMode);

        // Handle null/undefined
        if (aValue === null || aValue === undefined) return sort.direction === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sort.direction === 'asc' ? -1 : 1;

        // Compare values
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }

        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [data, sortConfig, viewMode]);

  // Virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  // Handle column sort (multi-column with Shift)
  const handleSort = (columnId: string, event: React.MouseEvent) => {
    if (!onSortChange) return;

    const existingIndex = sortConfig.findIndex(s => s.columnId === columnId);
    let newSortConfig: SortConfig[];

    if (event.shiftKey) {
      // Multi-column sort
      if (existingIndex >= 0) {
        // Toggle direction or remove
        const current = sortConfig[existingIndex];
        if (current.direction === 'asc') {
          newSortConfig = sortConfig.map((s, i) =>
            i === existingIndex ? { ...s, direction: 'desc' as const } : s
          );
        } else {
          newSortConfig = sortConfig.filter((_, i) => i !== existingIndex);
        }
      } else {
        // Add new sort column
        newSortConfig = [...sortConfig, { columnId, direction: 'asc' }];
      }
    } else {
      // Single column sort
      if (existingIndex === 0 && sortConfig.length === 1) {
        // Toggle direction
        const current = sortConfig[0];
        newSortConfig = current.direction === 'asc'
          ? [{ columnId, direction: 'desc' }]
          : [];
      } else {
        // Set as primary sort
        newSortConfig = [{ columnId, direction: 'asc' }];
      }
    }

    onSortChange(newSortConfig);
  };

  // Column drag and drop
  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDropTargetColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedColumn || !onColumnOrderChange) return;

    const currentOrder = columnOrder || displayColumns.map(c => c.id);
    const draggedIndex = currentOrder.indexOf(draggedColumn);
    const targetIndex = currentOrder.indexOf(targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    onColumnOrderChange(newOrder);
    setDraggedColumn(null);
    setDropTargetColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDropTargetColumn(null);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    if (!onVisibleColumnsChange) return;

    const current = visibleColumns || displayColumns.map(c => c.id);
    const updated = current.includes(columnId)
      ? current.filter(id => id !== columnId)
      : [...current, columnId];

    onVisibleColumnsChange(updated);
  };

  // Get sort indicator for column
  const getSortIndicator = (columnId: string) => {
    const sortIndex = sortConfig.findIndex(s => s.columnId === columnId);
    if (sortIndex === -1) return null;

    const sort = sortConfig[sortIndex];
    const Icon = sort.direction === 'asc' ? ArrowUp : ArrowDown;
    const label = sortConfig.length > 1 ? `${sortIndex + 1}` : '';

    return (
      <span className="inline-flex items-center gap-0.5 ml-1">
        <Icon className="h-3 w-3" />
        {label && <span className="text-xs">{label}</span>}
      </span>
    );
  };

  return (
    <div className={cn('flex flex-col h-full bg-slate-900', className)}>
      {/* Column Settings */}
      {showColumnSettings && (
        <div className="absolute top-0 right-0 z-50 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 m-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-200">Column Settings</h4>
            <button
              onClick={() => setShowColumnSettings(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {UNIFIED_COLUMNS.map(column => (
              <label
                key={column.id}
                className="flex items-center gap-2 text-sm text-slate-300 hover:bg-slate-700/50 p-2 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns?.includes(column.id) ?? column.defaultVisible}
                  onChange={() => toggleColumnVisibility(column.id)}
                  className="rounded border-slate-600"
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto" ref={parentRef}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900">
              <tr>
                {displayColumns.map(column => {
                  const sortIndicator = getSortIndicator(column.id);
                  const isDragging = draggedColumn === column.id;
                  const isDropTarget = dropTargetColumn === column.id;

                  return (
                    <th
                      key={column.id}
                      draggable={!!onColumnOrderChange}
                      onDragStart={() => handleDragStart(column.id)}
                      onDragOver={(e) => handleDragOver(e, column.id)}
                      onDrop={(e) => handleDrop(e, column.id)}
                      onDragEnd={handleDragEnd}
                      style={{ width: column.width }}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700 transition-all',
                        isDragging && 'opacity-50',
                        isDropTarget && 'bg-blue-900/30 border-blue-500',
                        onColumnOrderChange && 'cursor-move'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {onColumnOrderChange && (
                          <GripVertical className="h-3 w-3 text-slate-600" />
                        )}
                        <button
                          onClick={(e) => column.sortable && handleSort(column.id, e)}
                          className={cn(
                            'flex items-center gap-1 hover:text-slate-200 transition-colors',
                            !column.sortable && 'cursor-default'
                          )}
                          title={
                            column.sortable
                              ? 'Click to sort, Shift+Click for multi-column sort'
                              : column.description
                          }
                        >
                          <span>{column.label}</span>
                          {column.sortable && (
                            sortIndicator || <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = sortedData[virtualRow.index];
                if (!row) return null;

                return (
                  <tr
                    key={virtualRow.index}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {displayColumns.map(column => {
                      const value = extractColumnValue(column.id, row, viewMode);
                      const formatted = formatColumnValue(column.id, value, row);

                      return (
                        <td
                          key={column.id}
                          className="px-4 py-3 text-sm text-slate-300"
                          style={{ width: column.width }}
                        >
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with column settings toggle */}
      {onVisibleColumnsChange && (
        <div className="border-t border-slate-700 px-4 py-2 flex items-center justify-between bg-slate-800/50">
          <span className="text-xs text-slate-400">
            {sortedData.length.toLocaleString()} rows • {displayColumns.length} columns
            {sortConfig.length > 0 && ` • Sorted by ${sortConfig.length} column${sortConfig.length > 1 ? 's' : ''}`}
          </span>
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
          >
            <Settings className="h-3 w-3" />
            Column Settings
          </button>
        </div>
      )}
    </div>
  );
}
