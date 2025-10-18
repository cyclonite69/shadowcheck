import { RefreshCw, Download } from 'lucide-react';

interface FloatingActionsProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export function FloatingActions({ onRefresh, onExport }: FloatingActionsProps) {
  return (
    <div className="fixed bottom-4 right-4 md:hidden z-40">
      <div className="bg-slate-800 rounded-full p-2 shadow-lg border border-border/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="w-12 h-12 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            data-testid="fab-refresh"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4 text-primary" />
          </button>
          <button
            onClick={onExport}
            className="w-12 h-12 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            data-testid="fab-export"
            title="Export Data"
          >
            <Download className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}