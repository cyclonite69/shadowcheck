import { createRoot, Root } from "react-dom/client";
import OriginalTooltip from "@/components/ref-tooltip/OriginalTooltip";
import "@/components/ref-tooltip/ref-tooltip.css";

/**
 * wireTooltipNetwork(map, pointLayerId = "networks", options?)
 * options:
 *   - env: "urban" | "suburban" | "rural"    (default "urban")
 *   - min: minimum radius in meters          (default 8)
 *   - max: maximum radius in meters          (default 250)
 *
 * Hover: draws likely range (polygon ring) sized by signal + freq + env.
 * Click: shows your OriginalTooltip and "locks" it until background click or ESC.
 */

type Env = "urban" | "suburban" | "rural";
type Opts = { env?: Env; min?: number; max?: number };

const EARTH_R = 6378137; // meters
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

// Draw a geodesic circle polygon (no extra deps)
function circlePolygon(lon: number, lat: number, radiusMeters: number, steps = 96) {
  const latR = toRad(lat), lonR = toRad(lon), ang = radiusMeters / EARTH_R;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const b = (i * 2 * Math.PI) / steps;
    const sinLat = Math.sin(latR) * Math.cos(ang) + Math.cos(latR) * Math.sin(ang) * Math.cos(b);
    const dLat = Math.asin(sinLat);
    const y = Math.sin(b) * Math.sin(ang) * Math.cos(latR);
    const x = Math.cos(ang) - Math.sin(latR) * sinLat;
    const dLon = lonR + Math.atan2(y, x);
    coords.push([toDeg(dLon), toDeg(dLat)]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} } as const;
}

/**
 * Radius model (simple, tunable):
 * - Base radius from RSSI (dBm) → meters
 * - Adjust by frequency band (2.4 < 5 < 6 GHz attenuation)
 * - Adjust by environment profile (urban has more clutter)
 *
 * This is not RF-accurate; it’s a pragmatic visual heuristic.
 */
function radiusFromSignalFreqEnv(
  signal?: number,
  frequency?: number,
  env: Env = "urban",
  min = 8,
  max = 250
) {
  // 1) Base meters from RSSI (piecewise)
  let base: number;
  if (typeof signal !== "number") base = 60;
  else if (signal >= -45) base = 10;
  else if (signal >= -55) base = 18;
  else if (signal >= -65) base = 30;
  else if (signal >= -75) base = 55;
  else if (signal >= -85) base = 95;
  else base = 150;

  // 2) Frequency band multiplier (rough)
  // 2.4 GHz ≈ best penetration, 5 GHz ≈ moderate, 6 GHz ≈ worst
  const f = Number(frequency ?? 0);
  const bandMul =
    f >= 5900 ? 0.75 :     // 6 GHz
    f >= 4900 ? 0.9  :     // 5 GHz
    f >= 2300 ? 1.0  :     // 2.4 GHz
                 0.95;     // unknown/other

  // 3) Environment multiplier
  const envMul =
    env === "urban" ? 0.85 :
    env === "suburban" ? 1.0 :
    1.15; // rural

  // Clamp to [min, max]
  return Math.max(min, Math.min(max, Math.round(base * bandMul * envMul)));
}

// Tooltip root
function ensureTooltipRoot() {
  let el = document.getElementById("sc-tooltip-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "sc-tooltip-root";
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  return el as HTMLDivElement;
}

export function wireTooltipNetwork(map: any, pointLayerId = "networks", opts: Opts = {}) {
  const tipRoot = ensureTooltipRoot();
  const env: Env = (opts.env ?? (window as any).SC_ENV ?? "urban") as Env;
  const min = typeof opts.min === "number" ? opts.min : 8;
  const max = typeof opts.max === "number" ? opts.max : 250;

  let tooltipLocked = false;
  let reactRoot: Root | null = null;

  // Add range source
  if (!map.getSource("range")) {
    map.addSource("range", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  }

  // Insert range layers **BELOW** the point layer so clicks still hit points
  const beforeId = pointLayerId;

  if (!map.getLayer("range-fill")) {
    map.addLayer(
      {
        id: "range-fill",
        type: "fill",
        source: "range",
        paint: { "fill-color": "#22d3ee", "fill-opacity": 0.08 }
      },
      beforeId
    );
  }
  if (!map.getLayer("range-outline")) {
    map.addLayer(
      {
        id: "range-outline",
        type: "line",
        source: "range",
        paint: { "line-color": "#22d3ee", "line-width": 1.5, "line-opacity": 0.6 }
      },
      beforeId
    );
  }

  const hideTooltip = () => {
    tipRoot.style.left = "-9999px";
    tipRoot.style.top = "-9999px";
    if (reactRoot) {
      reactRoot.unmount();
      reactRoot = null;
    }
  };
  const clearRange = () => {
    // Check if map is still valid and has the source before trying to clear it
    if (map && typeof map.getSource === 'function') {
      const source = map.getSource("range");
      if (source && typeof source.setData === 'function') {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    }
  };

  // HOVER → update rings only; keep tooltip if locked
  map.on("mousemove", pointLayerId, (e: any) => {
    const f = e.features?.[0];
    if (!f) { clearRange(); return; }

    const p = f.properties || {};
    const [lon, lat] = (f.geometry?.coordinates || []) as [number, number];
    const signal = p.signal !== undefined ? Number(p.signal) : (p.rssi ?? p.dbm);
    const frequency = Number(p.frequency ?? p.freq ?? p.freq_mhz);

    const r = radiusFromSignalFreqEnv(
      typeof signal === "number" ? Number(signal) : undefined,
      Number.isFinite(frequency) ? frequency : undefined,
      env,
      min,
      max
    );

    const poly = circlePolygon(Number(lon), Number(lat), r, 96);
    (map.getSource("range") as any).setData({ type: "FeatureCollection", features: [poly] });

    map.setFilter?.("hover", ["==", "uid", p.uid ?? -1]);
    if (!tooltipLocked) hideTooltip();
  });

  map.on("mouseleave", pointLayerId, () => {
    clearRange();
    map.setFilter?.("hover", ["==", "uid", -1]);
    if (!tooltipLocked) hideTooltip();
  });

  // CLICK → lock tooltip (merge geometry + aliases so lat/lon/alt/seen show)
  map.on("click", pointLayerId, (e: any) => {
    const f = e.features?.[0];
    if (!f) return;

    const raw: any = f.properties || {};
    const coords: any = (f.geometry && (f.geometry as any).coordinates) || [];
    const lon = Number(raw.lon ?? coords[0]);
    const lat = Number(raw.lat ?? coords[1]);

    const props = {
      ...raw,
      lon,
      lat,
      // identifiers
      bssid: raw.bssid ?? raw.mac ?? raw.address,
      ssid:  raw.ssid  ?? raw.essid,
      vendor: raw.vendor ?? raw.oui_vendor ?? raw.oui,
      // radio
      signal: (raw.signal ?? raw.rssi ?? raw.dbm),
      frequency: (raw.frequency ?? raw.freq ?? raw.freq_mhz),
      channel:   (raw.channel   ?? raw.ch),
      security:  (raw.security  ?? raw.encryption ?? raw.encryptionValue),
      // altitude
      alt: (raw.alt ?? raw.altitude ?? raw.altitude_m ?? raw.ele ?? raw.elevation),
      // timestamps (prefer last/observed for "Seen")
      // timestamps (normalize all into seen)
      seen: (raw.observed_at ?? raw.last_seen ?? raw.lastupd ?? raw.time ?? raw.seen),
      // styling
      colour: (raw.colour ?? raw.color)
    };

    const evt = e.originalEvent as MouseEvent;
    const x = Math.min(window.innerWidth - 420, (evt?.clientX ?? 0) + 12);
    const y = Math.min(window.innerHeight - 260, (evt?.clientY ?? 0) + 12);
    tipRoot.style.left = `${x}px`;
    tipRoot.style.top = `${y}px`;

    if (!reactRoot) {
      reactRoot = createRoot(tipRoot);
    }
    reactRoot.render(<OriginalTooltip {...props} />);
    tooltipLocked = true;
  });

  // Click background → unlock + hide
  map.on("click", (e: any) => {
    const feats = map.queryRenderedFeatures?.(e.point, { layers: [pointLayerId] }) || [];
    if (!feats.length) { tooltipLocked = false; hideTooltip(); }
  });

  // ESC to close
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { tooltipLocked = false; hideTooltip(); }
  });

  return () => { tooltipLocked = false; hideTooltip(); clearRange(); };
}
