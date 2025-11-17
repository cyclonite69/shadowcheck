import React from "react";
import { formatForensicsTime } from "@/lib/dateUtils";
import { parseWiFiSecurity } from "@/lib/securityUtils";
import "./ref-tooltip.css";

function toFeet(m?: number | string) {
  const n = typeof m === "string" ? Number(m) : m;
  if (typeof n !== "number" || !isFinite(n)) return null;
  return (n * 3.28084).toFixed(2);
}

function ghz(f?: number | string) {
  if (f == null || f === "") return null;
  const num = Number(f);
  if (!isFinite(num)) return null;
  const val = num > 100 ? (num / 1000) : num;
  return `${val.toFixed(3)} GHz`;
}

// Format coordinates to DMS (Degrees Minutes Seconds)
function formatDMS(decimal: number | null | undefined, isLat: boolean): string {
  if (decimal == null || !isFinite(decimal)) return 'N/A';
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);
  const direction = decimal >= 0
    ? (isLat ? 'N' : 'E')
    : (isLat ? 'S' : 'W');
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
}

/**
 * Dark modal-style tooltip with DMS coordinates
 * Matches the NetworkTooltip design provided by user
 */
export default function MinimalTooltip(props: any) {
  const p = props || {};
  const ssid = p.ssid || "(hidden)";
  const mac = (p.bssid || p.mac || "—").slice(0, 17);

  // Signal
  const sig = ((): number | undefined => {
    const v = p.signal ?? p.rssi ?? p.dbm ?? p.db ?? p.level ?? p.sig;
    const n = Number(v);
    return isFinite(n) ? n : undefined;
  })();

  // Frequency
  const freqRaw = p.frequency ?? p.freq ?? p.freq_mhz ?? p.mhz ?? p.freq_ghz;
  const freqDisp = ghz(freqRaw);

  // Security
  const encRaw = p.security ?? p.encryption ?? p.encryptionValue;
  const secInfo = parseWiFiSecurity(encRaw);

  // Coordinates
  const lat = Number(p.lat ?? p.latitude);
  const lon = Number(p.lon ?? p.lng ?? p.longitude);
  const hasCoords = isFinite(lat) && isFinite(lon);

  // Altitude
  let altMeters: number | undefined;
  {
    const m = Number(p.alt ?? p.altitude ?? p.altitude_m ?? p.ele ?? p.elevation);
    if (isFinite(m)) altMeters = m;
    else {
      const ft = Number(p.alt_ft ?? p.altitude_ft ?? p.ele_ft ?? p.elevation_ft ?? p.msl);
      if (isFinite(ft)) altMeters = ft / 3.28084;
    }
  }
  const altFeet = altMeters != null ? toFeet(altMeters) : null;

  // Timestamp
  const seen = formatForensicsTime(p.seen || p.observed_at || p.last_seen || p.lastupd || p.time);

  // WiFi icon
  const wifiIcon = (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
    </svg>
  );

  return (
    <div
      className="relative w-80 bg-gray-950 bg-opacity-95 rounded-xl border border-gray-700 p-5 shadow-2xl backdrop-blur-sm"
      style={{ transform: 'scale(0.7)', transformOrigin: 'top left' }}
    >
      {/* Header: Network name and icon */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-white">
          {ssid}
        </h3>
        <div className="w-8 h-8 text-cyan-400 flex-shrink-0 pt-0.5">
          {wifiIcon}
        </div>
      </div>

      {/* MAC Address */}
      <div className="text-xs text-gray-300 font-mono mb-4 border-b border-gray-700 pb-3">
        MAC: {mac}
      </div>

      {/* Technical specs */}
      <div className="space-y-2.5 text-sm mb-4">
        {freqDisp && (
          <div className="flex justify-between">
            <span className="text-gray-400">Frequency</span>
            <span className="text-gray-200 font-medium">{freqDisp}</span>
          </div>
        )}
        {sig != null && (
          <div className="flex justify-between">
            <span className="text-gray-400">Signal</span>
            <span className="text-amber-300 font-semibold">{sig} dBm</span>
          </div>
        )}
        {secInfo && (
          <div className="flex justify-between">
            <span className="text-gray-400">Encryption</span>
            <span className="text-gray-200 font-medium">{secInfo.short}</span>
          </div>
        )}
      </div>

      {/* Location data - highlighted blue box */}
      {hasCoords && (
        <div className="bg-blue-950 bg-opacity-50 border border-blue-700 rounded-lg p-3 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-300">Lat</span>
            <span className="text-gray-100 font-mono text-xs">
              {formatDMS(lat, true)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-300">Lon</span>
            <span className="text-gray-100 font-mono text-xs">
              {formatDMS(lon, false)}
            </span>
          </div>
          {altFeet && (
            <div className="flex justify-between">
              <span className="text-blue-300">Altitude</span>
              <span className="text-gray-100 font-medium">{altFeet} ft MSL</span>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      {seen && (
        <div className="text-xs border-t border-gray-700 pt-3 flex justify-between">
          <span className="text-orange-400 font-semibold">Seen:</span>
          <span className="text-orange-400 font-semibold">{seen}</span>
        </div>
      )}
    </div>
  );
}
