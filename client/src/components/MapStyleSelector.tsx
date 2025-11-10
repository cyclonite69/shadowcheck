/**
 * MapStyleSelector - Globe-icon based map style selector
 * Allows switching between Dark, Standard, and Satellite map styles
 */

import { useState } from 'react';

// Map style configurations
export type MapStyle = 'dark' | 'standard' | 'satellite';

interface MapStyleConfig {
  id: MapStyle;
  name: string;
  url: string;
  icon: JSX.Element;
}

const MAP_STYLES: MapStyleConfig[] = [
  {
    id: 'dark',
    name: 'Dark Globe',
    url: 'mapbox://styles/mapbox/dark-v11',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#1a2a3a" stroke="#4a5a6a" strokeWidth="0.5"/>
        {/* Vertical lines (longitude) */}
        <path d="M12 2 L12 22" stroke="#374151" strokeWidth="0.5" opacity="0.4"/>
        <path d="M7 3 Q7 12 7 21" stroke="#374151" strokeWidth="0.5" opacity="0.3" fill="none"/>
        <path d="M17 3 Q17 12 17 21" stroke="#374151" strokeWidth="0.5" opacity="0.3" fill="none"/>
        {/* Horizontal lines (latitude) */}
        <path d="M2 12 L22 12" stroke="#374151" strokeWidth="0.5" opacity="0.4"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#374151" strokeWidth="0.5" opacity="0.3" fill="none"/>
        <ellipse cx="12" cy="12" rx="10" ry="6.5" stroke="#374151" strokeWidth="0.5" opacity="0.2" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'standard',
    name: 'Standard',
    url: 'mapbox://styles/mapbox/streets-v12',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#f5f5f5" stroke="#9ca3af" strokeWidth="0.5"/>
        {/* Vertical lines (longitude) */}
        <path d="M12 2 L12 22" stroke="#d1d5db" strokeWidth="0.6" opacity="0.6"/>
        <path d="M7 3 Q7 12 7 21" stroke="#d1d5db" strokeWidth="0.5" opacity="0.5" fill="none"/>
        <path d="M17 3 Q17 12 17 21" stroke="#d1d5db" strokeWidth="0.5" opacity="0.5" fill="none"/>
        {/* Horizontal lines (latitude) */}
        <path d="M2 12 L22 12" stroke="#d1d5db" strokeWidth="0.6" opacity="0.6"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#d1d5db" strokeWidth="0.5" opacity="0.5" fill="none"/>
        <ellipse cx="12" cy="12" rx="10" ry="6.5" stroke="#d1d5db" strokeWidth="0.5" opacity="0.4" fill="none"/>
        {/* Street-like details */}
        <circle cx="8" cy="8" r="0.8" fill="#6b7280" opacity="0.4"/>
        <circle cx="16" cy="9" r="0.6" fill="#6b7280" opacity="0.4"/>
        <circle cx="14" cy="15" r="0.7" fill="#6b7280" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Earth base with gradient-like effect using multiple circles */}
        <circle cx="12" cy="12" r="10" fill="#1e3a5f"/>
        <circle cx="12" cy="12" r="10" fill="url(#earthGradient)" opacity="0.7"/>

        {/* Landmass patterns */}
        <path d="M8 6 Q10 7 12 6 Q14 5 16 7" fill="#4a7c59" opacity="0.6"/>
        <path d="M5 11 Q7 13 9 12 Q11 11 10 14" fill="#4a7c59" opacity="0.5"/>
        <path d="M14 13 Q16 14 18 13 Q19 12 17 16" fill="#5a8c69" opacity="0.5"/>
        <path d="M6 16 Q8 18 10 17" fill="#4a7c59" opacity="0.4"/>

        {/* Ocean texture with subtle lines */}
        <path d="M3 8 Q5 9 7 8" stroke="#2a5a8f" strokeWidth="0.3" opacity="0.3" fill="none"/>
        <path d="M15 10 Q17 11 19 10" stroke="#2a5a8f" strokeWidth="0.3" opacity="0.3" fill="none"/>

        {/* Cloud cover */}
        <ellipse cx="9" cy="10" rx="2" ry="1" fill="white" opacity="0.15"/>
        <ellipse cx="16" cy="15" rx="1.5" ry="0.8" fill="white" opacity="0.12"/>

        <defs>
          <radialGradient id="earthGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Outer glow */}
        <circle cx="12" cy="12" r="10" stroke="#4a90e2" strokeWidth="0.5" opacity="0.3" fill="none"/>
      </svg>
    ),
  },
];

interface MapStyleSelectorProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
  className?: string;
}

export function MapStyleSelector({ currentStyle, onStyleChange, className = '' }: MapStyleSelectorProps) {
  const [hoveredStyle, setHoveredStyle] = useState<MapStyle | null>(null);

  return (
    <div className={`flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded px-1.5 py-1 ${className}`}>
      {MAP_STYLES.map((style) => {
        const isSelected = currentStyle === style.id;
        const isHovered = hoveredStyle === style.id;

        return (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            onMouseEnter={() => setHoveredStyle(style.id)}
            onMouseLeave={() => setHoveredStyle(null)}
            aria-label={`Switch to ${style.name} map style`}
            title={style.name}
            className={`
              relative p-1.5 rounded transition-all duration-200
              ${isSelected
                ? 'bg-cyan-500/20 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'hover:bg-slate-700/50'
              }
              ${isHovered && !isSelected ? 'scale-110' : ''}
              focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800
            `}
          >
            {style.icon}

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Export style URL getter for easy integration
export function getMapStyleUrl(style: MapStyle): string {
  return MAP_STYLES.find(s => s.id === style)?.url || MAP_STYLES[0].url;
}
