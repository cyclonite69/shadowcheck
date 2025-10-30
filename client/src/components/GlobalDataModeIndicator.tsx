/**
 * Global Data Mode Indicator
 * Compact display showing current federation settings in sidebar footer
 */

import { useDataFederation } from '@/contexts/DataFederationContext';
import { Database, Layers, Radio } from 'lucide-react';
import { iconColors } from '@/lib/iconColors';

export function GlobalDataModeIndicator() {
  const { mergeMode, selectedSources, selectedRadioTypes, dataSourceType } = useDataFederation();

  // Mode display names
  const modeNames: Record<typeof mergeMode, string> = {
    unified: 'Unified',
    deduplicated: 'Deduped',
    deduplicated_fuzzy: 'Fuzzy Dedup',
    smart_merged: 'Smart Merge',
    precision_merged: 'Precision',
    hybrid: 'Hybrid',
  };

  // Radio type badges (WiGLE standard types only)
  const radioTypeBadges: Record<'W' | 'B' | 'C', { label: string; color: string }> = {
    W: { label: 'WiFi', color: 'bg-blue-500/20 text-blue-400' },
    B: { label: 'BT', color: 'bg-purple-500/20 text-purple-400' },
    C: { label: 'Cell', color: 'bg-green-500/20 text-green-400' },
  };

  // Filter out any invalid radio types from localStorage
  const validRadioTypes = selectedRadioTypes.filter((type): type is 'W' | 'B' | 'C' => 
    type === 'W' || type === 'B' || type === 'C'
  );

  return (
    <div className="flex flex-col gap-2 text-[10px] text-slate-400 border-t border-slate-800/50 pt-3">
      {/* Mode Indicator */}
      <div className="flex items-center gap-2">
        <Layers className="h-3 w-3 text-purple-400" />
        <span className="text-slate-500">Mode:</span>
        <span className="font-semibold text-purple-400">{modeNames[mergeMode]}</span>
      </div>

      {/* Source Count */}
      <div className="flex items-center gap-2">
        <Database className="h-3 w-3 text-blue-400" />
        <span className="text-slate-500">Sources:</span>
        <span className="font-semibold text-blue-400">{selectedSources.length}</span>
      </div>

      {/* Radio Types */}
      <div className="flex items-center gap-2 flex-wrap">
        <Radio className="h-3 w-3 text-green-400" />
        <span className="text-slate-500">Types:</span>
        <div className="flex gap-1 flex-wrap">
          {validRadioTypes.map((type) => (
            <span
              key={type}
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${radioTypeBadges[type].color}`}
            >
              {radioTypeBadges[type].label}
            </span>
          ))}
        </div>
      </div>

      {/* Surveillance Data Source */}
      <div className="flex items-center gap-2 text-[9px] text-slate-500 border-t border-slate-800/30 pt-2">
        <span>Surveillance:</span>
        <span className="font-semibold text-slate-400">{dataSourceType}</span>
      </div>
    </div>
  );
}
