import React from "react";
import { formatForensicsTime } from "@/lib/dateUtils";
import { parseWiFiSecurity, parseNonWiFiSecurity, getSecurityLevelColor, getSecurityLevelIcon } from "@/lib/securityUtils";
import "./ref-tooltip.css";

function signalClass(signal?: number) {
  if (typeof signal !== "number" || !isFinite(signal)) return "signal-weak";
  if (signal >= -50) return "signal-strong";
  if (signal >= -70) return "signal-medium";
  return "signal-weak";
}
function toFeet(m?: number | string) {
  const n = typeof m === "string" ? Number(m) : m;
  if (typeof n !== "number" || !isFinite(n)) return "—";
  const ft = n * 3.28084;
  return ft.toFixed(2);
}
function toDMS(coord?: number, isLat?: boolean) {
  if (typeof coord !== "number" || !isFinite(coord)) return "—";
  const abs = Math.abs(coord);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(2);
  const hemi = isLat ? (coord >= 0 ? "N" : "S") : (coord >= 0 ? "E" : "W");
  return `${deg}°${min}′${sec}″ ${hemi}`;
}
function ghz(f?: number | string) {
  if (f == null || f === "") return "—";
  const num = Number(f);
  if (!isFinite(num)) return String(f);
  // If value looks like MHz (e.g., 2437), convert. If already GHz (e.g., 2.437), keep.
  const val = num > 100 ? (num / 1000) : num;
  return `${val.toFixed(3)} GHz`;
}
// Enhanced signal strength with precise dBm values
function formatSignalStrength(sig?: number): string {
  if (typeof sig !== "number" || !isFinite(sig)) return "—";
  return `${sig} dBm`;
}
function WifiIcon({ color = "#22d3ee" }: { color?: string }) {
  return (
    <svg className="protocol-icon" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
      <path d="M12 14c-1.7 0-3.3.6-4.6 1.8a1 1 0 1 0 1.4 1.4A5 5 0 0 1 12 16a5 5 0 0 1 3.2 1.2 1 1 0 1 0 1.3-1.5A6.9 6.9 0 0 0 12 14z"/>
      <path d="M12 9.5c-3 0-5.8 1.1-8 3.2a1 1 0 1 0 1.4 1.4c1.8-1.8 4.1-2.7 6.6-2.7 2.5 0 4.8.9 6.6 2.7a1 1 0 1 0 1.4-1.4c-2.2-2.1-5.1-3.2-8-3.2z"/>
      <path d="M12 5c-4.3 0-8.3 1.6-11.3 4.6a1 1 0 1 0 1.4 1.4C4.6 7.5 8.2 6 12 6s7.4 1.5 9.9 4a1 1 0 1 0 1.4-1.4C20.3 6.6 16.3 5 12 5z"/>
    </svg>
  );
}

export default function OriginalTooltip(props: any) {
  const p = props || {};
  const ssid = p.ssid || "(hidden)";
  const mac = p.bssid || p.mac || "—";

  // frequency: prefer p.frequency, else p.freq/_mhz/_ghz; display in GHz
  const freqRaw = p.frequency ?? p.freq ?? p.freq_mhz ?? p.mhz ?? p.freq_ghz;
  const freqDisp = ghz(freqRaw);

  // signal: normalize & show dBm
  const sig = ((): number | undefined => {
    const v = p.signal ?? p.rssi ?? p.dbm ?? p.db ?? p.level ?? p.sig;
    const n = Number(v);
    return isFinite(n) ? n : undefined;
  })();

  // Enhanced security parsing with radio type detection
  const radioType = p.radio_type || 'wifi';
  const encRaw = p.security ?? p.encryption ?? p.encryptionValue;
  const secInfo = radioType === 'wifi' 
    ? parseWiFiSecurity(encRaw)
    : parseNonWiFiSecurity(encRaw, radioType);

  // coords
  const lat = typeof p.lat === "number" ? p.lat : undefined;
  const lon = typeof p.lon === "number" ? p.lon : undefined;

  // altitude: prefer meters (p.alt), else feet fields (converted to meters -> feet display)
  let altMeters: number | undefined;
  {
    const m = Number(p.alt ?? p.altitude ?? p.altitude_m ?? p.ele ?? p.elevation);
    if (isFinite(m)) altMeters = m;
    else {
      const ft = Number(p.alt_ft ?? p.altitude_ft ?? p.ele_ft ?? p.elevation_ft ?? p.msl);
      if (isFinite(ft)) altMeters = ft / 3.28084;
    }
  }
  const altFeetDisp = altMeters != null ? toFeet(altMeters) : "—";

  // Enhanced timestamp with UTC precision
  const seen = formatForensicsTime(p.seen || p.observed_at || p.last_seen || p.lastupd || p.time);

  const color = (p.colour || p.color) as string | undefined;

  return (
    <div className="tooltip">
      <div className="ssid">
        <span>{ssid}</span>
        <WifiIcon color={color || "#22d3ee"} />
      </div>

      <div className="tech-data">
        <span className="label">MAC:</span>
        <span className="value">{mac}</span>
      </div>

      <div className="tech-data">
        <span className="label">Frequency:</span>
        <span className="value">{freqDisp}</span>
      </div>

      <div className="tech-data">
        <span className="label">Signal:</span>
        <span className={`value ${signalClass(sig)}`}>{formatSignalStrength(sig)}</span>
      </div>

      <div className="tech-data">
        <span className="label">Security:</span>
        <span className={`value ${getSecurityLevelColor(secInfo.level).replace('text-', '')}`}>
          <i className={`${getSecurityLevelIcon(secInfo.level)} mr-1`}></i>
          {secInfo.short}
        </span>
      </div>

      <div className="location-block">
        <div className="tech-data">
          <span className="label">Lat:</span>
          <span className="value">{toDMS(lat, true)}</span>
        </div>
        <div className="tech-data">
          <span className="label">Lon:</span>
          <span className="value">{toDMS(lon, false)}</span>
        </div>
        <div className="tech-data">
          <span className="label">Altitude:</span>
          <span className="value">{altFeetDisp} ft MSL</span>
        </div>
      </div>

      {seen && (
        <div className="seen">
          <span className="seen-label">Seen:</span> {seen}
        </div>
      )}
    </div>
  );
}
