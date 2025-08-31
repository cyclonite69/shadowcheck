import React from "react";
import "./ref-tooltip.css";

/** Helpers (match your viewer logic) */
function signalClass(signal?: number) {
  if (typeof signal !== "number") return "signal-weak";
  if (signal >= -50) return "signal-strong";
  if (signal >= -70) return "signal-medium";
  return "signal-weak";
}
function toFeet(m?: number) { if (typeof m !== "number") return "—"; const ft = m*3.28084; return ft.toFixed(2); }
function toDMS(coord?: number, isLat?: boolean) {
  if (typeof coord !== "number" || !isFinite(coord)) return "—";
  const abs = Math.abs(coord);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(2);
  const hemi = isLat ? (coord >= 0 ? "N":"S") : (coord >= 0 ? "E":"W");
  return `${deg}°${min}′${sec}″ ${hemi}`;
}
function formatDisplayTime(isoString?: string) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  return d.toLocaleString();
}
function WifiIcon({ color = "#22d3ee" }: { color?: string }) {
  // SVG path derived from your app's wifiIcon()
  return (
    <svg className="protocol-icon" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
      <path d="M12 14c-1.7 0-3.3.6-4.6 1.8a1 1 0 1 0 1.4 1.4A5 5 0 0 1 12 16a5 5 0 0 1 3.2 1.2 1 1 0 1 0 1.3-1.5A6.9 6.9 0 0 0 12 14z"/>
      <path d="M12 9.5c-3 0-5.8 1.1-8 3.2a1 1 0 1 0 1.4 1.4c1.8-1.8 4.1-2.7 6.6-2.7 2.5 0 4.8.9 6.6 2.7a1 1 0 1 0 1.4-1.4c-2.2-2.1-5.1-3.2-8-3.2z"/>
      <path d="M12 5c-4.3 0-8.3 1.6-11.3 4.6a1 1 0 1 0 1.4 1.4C4.6 7.5 8.2 6 12 6s7.4 1.5 9.9 4a1 1 0 1 0 1.4-1.4C20.3 6.6 16.3 5 12 5z"/>
    </svg>
  );
}

/** The tooltip uses the SAME structure & classnames your viewer built */
export default function OriginalTooltip(props: any) {
  const p = props || {};
  const ssid = p.ssid || "(hidden)";
  const mac = p.mac || p.bssid || "—";
  const freq = p.freq ?? p.frequency ?? p.freq_mhz ?? "—";
  const enc  = (p.encryptionValue || p.security || "Unknown")?.toString().toUpperCase();
  const sig  = typeof p.signal === "number" ? p.signal : undefined;
  const lat  = typeof p.lat === "number" ? p.lat : undefined;
  const lon  = typeof p.lon === "number" ? p.lon : undefined;
  const altFeet = toFeet(typeof p.alt === "number" ? p.alt : undefined);
  const seen = formatDisplayTime(p.time || p.lastupd || p.observed_at || p.last_seen);
  const colour = (p.colour || p.color) as string | undefined;

  return (
    <div className="tooltip">
      <div className="ssid">
        <span>{ssid}</span>
        <WifiIcon color={colour || "#22d3ee"} />
      </div>

      <div className="tech-data">
        <span className="label">MAC:</span>
        <span className="value">{mac}</span>
      </div>

      <div className="tech-data">
        <span className="label">Frequency:</span>
        <span className="value">{freq}</span>
      </div>

      <div className="tech-data">
        <span className="label">Signal:</span>
        <span className={`value ${signalClass(sig)}`}>{typeof sig === "number" ? `${sig} dBm` : "—"}</span>
      </div>

      <div className="tech-data">
        <span className="label">Encryption:</span>
        <span className="value">{enc}</span>
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
          <span className="value">{altFeet} ft MSL</span>
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
