import React from "react";
import { formatForensicsTime } from "@/lib/dateUtils";
import { parseWiFiSecurity, getSecurityLevelColor } from "@/lib/securityUtils";
import "./ref-tooltip.css";

function signalClass(signal?: number) {
  if (typeof signal !== "number" || !isFinite(signal)) return "signal-weak";
  if (signal >= -50) return "signal-strong";
  if (signal >= -70) return "signal-medium";
  return "signal-weak";
}

function toFeet(m?: number | string) {
  const n = typeof m === "string" ? Number(m) : m;
  if (typeof n !== "number" || !isFinite(n)) return null;
  return (n * 3.28084).toFixed(0);
}

function ghz(f?: number | string) {
  if (f == null || f === "") return null;
  const num = Number(f);
  if (!isFinite(num)) return null;
  const val = num > 100 ? (num / 1000) : num;
  return `${val.toFixed(1)} GHz`;
}

/**
 * Minimal inline tooltip - shows only essential data
 * Hover-only, no click lock, disappears on mouse leave
 */
export default function MinimalTooltip(props: any) {
  const p = props || {};
  const ssid = p.ssid || "(hidden)";
  const mac = (p.bssid || p.mac || "—").slice(0, 17); // Trim to standard MAC length

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

  const color = (p.colour || p.color || "#22d3ee") as string;

  return (
    <div className="minimal-tooltip">
      <div className="minimal-tooltip-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill={color} className="inline mr-1.5">
          <path d="M12 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
          <path d="M12 14c-1.7 0-3.3.6-4.6 1.8a1 1 0 1 0 1.4 1.4A5 5 0 0 1 12 16a5 5 0 0 1 3.2 1.2 1 1 0 1 0 1.3-1.5A6.9 6.9 0 0 0 12 14z"/>
        </svg>
        <span className="minimal-tooltip-ssid">{ssid}</span>
      </div>

      <div className="minimal-tooltip-body">
        <div className="minimal-tooltip-row">
          <span className="minimal-tooltip-label">MAC</span>
          <span className="minimal-tooltip-value">{mac}</span>
        </div>

        {sig != null && (
          <div className="minimal-tooltip-row">
            <span className="minimal-tooltip-label">Signal</span>
            <span className={`minimal-tooltip-value ${signalClass(sig)}`}>{sig} dBm</span>
          </div>
        )}

        {freqDisp && (
          <div className="minimal-tooltip-row">
            <span className="minimal-tooltip-label">Freq</span>
            <span className="minimal-tooltip-value">{freqDisp}</span>
          </div>
        )}

        <div className="minimal-tooltip-row">
          <span className="minimal-tooltip-label">Security</span>
          <span className={`minimal-tooltip-value ${getSecurityLevelColor(secInfo.level).replace('text-', '')}`}>
            {secInfo.short}
          </span>
        </div>

        {altFeet && (
          <div className="minimal-tooltip-row">
            <span className="minimal-tooltip-label">Alt</span>
            <span className="minimal-tooltip-value">{altFeet} ft</span>
          </div>
        )}

        {seen && (
          <div className="minimal-tooltip-seen">
            {seen}
          </div>
        )}
      </div>
    </div>
  );
}
