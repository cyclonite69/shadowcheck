import React from 'react';

export default function NetworkTooltip() {
  const wifiIcon = (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
    </svg>
  );

  const tooltipStyle = {
    transform: 'scale(0.7)',
    transformOrigin: 'top left'
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      {/* Semi-transparent dark background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Tooltip card */}
      <div className="relative w-80 bg-gray-950 bg-opacity-95 rounded-xl border border-gray-700 p-5 shadow-2xl backdrop-blur-sm" style={tooltipStyle}>

        {/* Header: Network name and icon */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-white">(hidden)</h3>
          <div className="w-8 h-8 text-cyan-400 flex-shrink-0 pt-0.5">
            {wifiIcon}
          </div>
        </div>

        {/* MAC Address */}
        <div className="text-xs text-gray-300 font-mono mb-4 border-b border-gray-700 pb-3">
          MAC: CE:94:35:1E:8B:2F
        </div>

        {/* Technical specs */}
        <div className="space-y-2.5 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Frequency</span>
            <span className="text-gray-200 font-medium">2.412 GHz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Signal</span>
            <span className="text-amber-300 font-semibold">-68 dBm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Encryption</span>
            <span className="text-gray-200 font-medium">WPA2</span>
          </div>
        </div>

        {/* Location data - highlighted blue box */}
        <div className="bg-blue-950 bg-opacity-50 border border-blue-700 rounded-lg p-3 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-300">Lat</span>
            <span className="text-gray-100 font-mono text-xs">42°59&apos;2.87&quot; N</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-300">Lon</span>
            <span className="text-gray-100 font-mono text-xs">83°45&apos;3.05&quot; W</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-300">Altitude</span>
            <span className="text-gray-100 font-medium">656.17 ft MSL</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs border-t border-gray-700 pt-3 flex justify-between">
          <span className="text-orange-400 font-semibold">Seen:</span>
          <span className="text-orange-400 font-semibold">01/28/2025, 03:00:00 AM</span>
        </div>
      </div>
    </div>
  );
}
