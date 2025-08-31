#!/usr/bin/env bash
set -euo pipefail

ROOT="client/src"
COMP="$ROOT/components"
MAP="$ROOT/components/Map"
REF="$COMP/ref-tooltip"

mkdir -p "$REF" "$MAP"

# 1) CSS for the original class names (compact but faithful)
cat > "$REF/ref-tooltip.css" <<'CSS'
.tooltip{background:rgba(18,18,18,0.99);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:8px 10px;line-height:1.19;max-width:240px;min-width:160px;overflow:visible;box-shadow:0 8px 28px rgba(0,0,0,.5)}
.ssid{font-size:13px;font-weight:600;margin-bottom:2px;display:flex;justify-content:space-between;align-items:center;white-space:nowrap;overflow:hidden}
.ssid span{max-width:130px;min-width:0;overflow:hidden;text-overflow:ellipsis;display:inline-block}
.protocol-icon{width:15px;height:15px;margin-left:6px;opacity:.9;align-self:flex-start;display:inline-block;vertical-align:middle}
.tech-data{display:flex;flex-wrap:nowrap;margin-bottom:1px;align-items:baseline}
.label{color:#aaa;min-width:59px;max-width:59px;font-weight:400;font-size:11px;white-space:nowrap}
.value{font-family:'SF Mono','Consolas','Inconsolata','Roboto Mono',monospace;color:#e5e7eb;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:11.5px}
.location-block{margin:4px 0 1px 0;padding:3px 5px 2px 5px;background:rgba(255,255,255,0.04);border-radius:2px;border-left:2px solid #2081ff}
.tooltip .seen{margin-top:4px;padding-top:3px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;color:#e5e7eb}
.tooltip .seen-label{color:#aaa;font-weight:400;margin-right:2px;font-size:11px}
.tooltip .tech-data:last-of-type{margin-bottom:0}
.signal-strong{color:#34d399}
.signal-medium{color:#f59e0b}
.signal-weak{color:#ef4444}
CSS

# 2) Your OriginalTooltip reconstructed as React
cat > "$REF/OriginalTooltip.tsx" <<'TSX'
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
TSX

# 3) Hover rings + click → your OriginalTooltip
cat > "$MAP/wireTooltipNetwork.tsx" <<'TSX'
import ReactDOM from "react-dom";
import OriginalTooltip from "@/components/ref-tooltip/OriginalTooltip";
import "@/components/ref-tooltip/ref-tooltip.css";

// geodesic circle (no deps)
function circlePolygon(lon:number, lat:number, rMeters:number, steps=96){
  const R=6378137,toRad=Math.PI/180,toDeg=180/Math.PI,latR=lat*toRad,lonR=lon*toRad,ang=rMeters/R,coords:[number,number][]=[];
  for(let i=0;i<=steps;i++){const b=(i*2*Math.PI)/steps;const sinLat=Math.sin(latR)*Math.cos(ang)+Math.cos(latR)*Math.sin(ang)*Math.cos(b);
    const dLat=Math.asin(sinLat);const y=Math.sin(b)*Math.sin(ang)*Math.cos(latR);const x=Math.cos(ang)-Math.sin(latR)*sinLat;
    const dLon=lonR+Math.atan2(y,x);coords.push([dLon*toDeg,dLat*toDeg]);}
  return {type:"Feature",geometry:{type:"Polygon",coordinates:[coords]},properties:{}} as const;
}
// dBm -> meters (tweak to taste)
function radiusFromSignal(signal?:number){ if(typeof signal!=="number")return 60;
  if(signal>=-50)return 12; if(signal>=-60)return 22; if(signal>=-70)return 38; if(signal>=-80)return 70; if(signal>=-90)return 120; return 180; }

function ensureTooltipRoot(){ let el=document.getElementById("sc-tooltip-root");
  if(!el){ el=document.createElement("div"); el.id="sc-tooltip-root"; el.style.position="fixed"; el.style.left="-9999px"; el.style.top="-9999px"; el.style.zIndex="9999"; document.body.appendChild(el); }
  return el as HTMLDivElement; }

export function wireTooltipNetwork(map:any, pointLayerId="networks"){
  const tipRoot = ensureTooltipRoot();

  // range rings source + layers
  if(!map.getSource("range")) map.addSource("range",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
  if(!map.getLayer("range-fill")) map.addLayer({id:"range-fill",type:"fill",source:"range",paint:{"fill-color":"#22d3ee","fill-opacity":0.08}});
  if(!map.getLayer("range-outline")) map.addLayer({id:"range-outline",type:"line",source:"range",paint:{"line-color":"#22d3ee","line-width":1.5,"line-opacity":0.6}});

  const hideTooltip=()=>{ tipRoot.style.left="-9999px"; tipRoot.style.top="-9999px"; try{ReactDOM.render(<></>,tipRoot);}catch{} };
  const clearRange=()=>{ (map.getSource("range") as any)?.setData({type:"FeatureCollection",features:[]}); };

  // HOVER: rings only
  map.on("mousemove", pointLayerId, (e:any)=>{
    const f=e.features?.[0]; if(!f){ clearRange(); return; }
    const p=f.properties||{}; const [lon,lat]=f.geometry?.coordinates||[];
    const r=radiusFromSignal(p.signal!==undefined?Number(p.signal):undefined);
    const poly=circlePolygon(Number(lon),Number(lat),r,96);
    (map.getSource("range") as any).setData({type:"FeatureCollection",features:[poly]});
    map.setFilter?.("hover",["==","uid",p.uid ?? -1]); // if you have a hover outline layer
    hideTooltip(); // no card on hover
  });
  map.on("mouseleave", pointLayerId, ()=>{ clearRange(); map.setFilter?.("hover",["==","uid",-1]); hideTooltip(); });

  // CLICK: show your original tooltip
  map.on("click", pointLayerId, (e:any)=>{
    const f=e.features?.[0]; if(!f) return hideTooltip();
    const props=f.properties||{};
    const evt=e.originalEvent as MouseEvent;
    const x=Math.min(window.innerWidth-420,(evt?.clientX??0)+12);
    const y=Math.min(window.innerHeight-260,(evt?.clientY??0)+12);
    tipRoot.style.left=`${x}px`; tipRoot.style.top=`${y}px`;
    ReactDOM.render(<OriginalTooltip {...props} />, tipRoot);
  });

  // Click background to dismiss
  map.on("click",(e:any)=>{
    const feats=map.queryRenderedFeatures?.(e.point,{layers:[pointLayerId]})||[];
    if(!feats.length) hideTooltip();
  });

  return ()=>{ hideTooltip(); clearRange(); };
}
TSX

echo "✅ Installed your OriginalTooltip + CSS, and wired hover/click behavior."
echo "Make sure your map calls: wireTooltipNetwork(mapRef.current, \"networks\") (or your point layer id)."
