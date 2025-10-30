/**
 * Radio Type Filter Component
 * Multi-select filter for WiGLE radio types (WiFi, Bluetooth, Cellular)
 */

import { type RadioType } from '@/contexts/DataFederationContext';
import { Wifi, Bluetooth, Radio } from 'lucide-react';

interface RadioTypeFilterProps {
  selectedTypes: RadioType[];
  onSelectionChange: (types: RadioType[]) => void;
}

export function RadioTypeFilter({ selectedTypes, onSelectionChange }: RadioTypeFilterProps) {
  const radioTypes: {
    value: RadioType;
    label: string;
    description: string;
    icon: typeof Wifi;
    color: string;
  }[] = [
    {
      value: 'W',
      label: 'WiFi',
      description: '802.11 wireless networks (2.4/5/6 GHz)',
      icon: Wifi,
      color: 'blue',
    },
    {
      value: 'B',
      label: 'Bluetooth',
      description: 'Bluetooth/BLE devices',
      icon: Bluetooth,
      color: 'purple',
    },
    {
      value: 'C',
      label: 'Cellular',
      description: 'GSM/UMTS/LTE/5G networks',
      icon: Radio,
      color: 'green',
    },
  ];

  const toggleType = (type: RadioType) => {
    if (selectedTypes.includes(type)) {
      onSelectionChange(selectedTypes.filter((t) => t !== type));
    } else {
      onSelectionChange([...selectedTypes, type]);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-slate-700',
        bg: isSelected ? 'bg-blue-500/10' : 'bg-slate-800/30',
        shadow: isSelected ? 'shadow-lg shadow-blue-500/20' : '',
        text: isSelected ? 'text-blue-400' : 'text-slate-500',
        hover: 'hover:border-slate-600 hover:bg-slate-800/50',
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-slate-700',
        bg: isSelected ? 'bg-purple-500/10' : 'bg-slate-800/30',
        shadow: isSelected ? 'shadow-lg shadow-purple-500/20' : '',
        text: isSelected ? 'text-purple-400' : 'text-slate-500',
        hover: 'hover:border-slate-600 hover:bg-slate-800/50',
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-slate-700',
        bg: isSelected ? 'bg-green-500/10' : 'bg-slate-800/30',
        shadow: isSelected ? 'shadow-lg shadow-green-500/20' : '',
        text: isSelected ? 'text-green-400' : 'text-slate-500',
        hover: 'hover:border-slate-600 hover:bg-slate-800/50',
      },
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {radioTypes.map((type) => {
        const isSelected = selectedTypes.includes(type.value);
        const Icon = type.icon;
        const colorClasses = getColorClasses(type.color, isSelected);

        return (
          <button
            key={type.value}
            onClick={() => toggleType(type.value)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${colorClasses.border} ${colorClasses.bg} ${colorClasses.shadow} ${!isSelected && colorClasses.hover}`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                <span className={`font-semibold ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                  {type.label}
                </span>
              </div>
              <div className="text-xs text-slate-400">{type.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
