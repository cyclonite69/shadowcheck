/**
 * ObservationColumnSelector - Column visibility for network observations
 */

import { useState } from 'react';
import { Settings, Eye, EyeOff, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useNetworkObservationColumns, OBSERVATION_COLUMNS } from '@/hooks/useNetworkObservationColumns';
import { cn } from '@/lib/utils';

export function ObservationColumnSelector() {
  const {
    columnVisibility,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetToDefaults,
    visibleCount,
    totalCount,
  } = useNetworkObservationColumns();

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Columns</span>
          <span className="text-xs text-slate-500">
            ({visibleCount}/{totalCount})
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Manage Columns</DialogTitle>
          <DialogDescription className="text-slate-400">
            Customize which columns are displayed in the observations table.
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 py-2 border-y border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={showAllColumns}
            className="gap-2 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <Eye className="h-3 w-3" />
            Show All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={hideAllColumns}
            className="gap-2 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <EyeOff className="h-3 w-3" />
            Hide Optional
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="gap-2 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        {/* Scrollable Column List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OBSERVATION_COLUMNS.map((column) => {
              const isVisible = columnVisibility[column.id];
              const isDisabled = column.alwaysVisible;

              return (
                <div
                  key={column.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                    isVisible
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-slate-900 border-slate-800',
                    isDisabled && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <Checkbox
                    id={`column-${column.id}`}
                    checked={isVisible}
                    onCheckedChange={() => !isDisabled && toggleColumn(column.id)}
                    disabled={isDisabled}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={`column-${column.id}`}
                      className={cn(
                        'text-sm font-medium leading-none cursor-pointer',
                        isVisible ? 'text-slate-200' : 'text-slate-400',
                        isDisabled && 'cursor-not-allowed'
                      )}
                    >
                      {column.label}
                      {isDisabled && (
                        <span className="ml-2 text-xs text-slate-500">(required)</span>
                      )}
                    </Label>
                    {column.description && (
                      <p className="text-xs text-slate-500 leading-snug">
                        {column.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-slate-500">
              {visibleCount} of {totalCount} columns visible
            </p>
            <DialogClose asChild>
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setOpen(false)}
              >
                <Check className="h-4 w-4" />
                OK
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
