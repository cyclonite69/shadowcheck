#!/usr/bin/env bash
set -euo pipefail
FILE="client/src/components/Map/wireTooltipNetwork.tsx"

# 1) Ensure the file exists
[ -f "$FILE" ] || { echo "✗ $FILE not found"; exit 1; }

# 2) Replace the file in-place with a lock-aware version
cat > "$FILE" <<'TSX'
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
  let tooltipLocked = false;  // ← NEW: lock after click

  // range rings source + layers (insert BELOW points)
  if(!map.getSource("range")) map.addSource("range",{type:"geojson",data:{type:"FeatureCollection",features:[]}});

  // Try to place below the point layer so clicks hit points
  const beforeId = pointLayerId;

  if(!map.getLayer("range-fill")) map.addLayer(
    {id:"range-fill",type:"fill",source:"range",paint:{"fill-color":"#22d3ee","fill-opacity":0.08}},
    beforeId
  );
  if(!map.getLayer("range-outline")) map.addLayer(
    {id:"range-outline",type:"line",source:"range",paint:{"line-color":"#22d3ee","line-width":1.5,"line-opacity":0.6}},
    beforeId
  );

  const hideTooltip=()=>{ tipRoot.style.left="-9999px"; tipRoot.style.top="-9999px"; try{ReactDOM.render(<></>,tipRoot);}catch{} };
  const clearRange=()=>{ (map.getSource("range") as any)?.setData({type:"FeatureCollection",features:[]}); };

  // HOVER: rings only. If locked, KEEP tooltip; still update rings.
  map.on("mousemove", pointLayerId, (e:any)=>{
    const f=e.features?.[0]; if(!f){ clearRange(); return; }
    const p=f.properties||{}; const [lon,lat]=f.geometry?.coordinates||[];
    const r=radiusFromSignal(p.signal!==undefined?Number(p.signal):undefined);
    const poly=circlePolygon(Number(lon),Number(lat),r,96);
    (map.getSource("range") as any).setData({type:"FeatureCollection",features:[poly]});
    map.setFilter?.("hover",["==","uid",p.uid ?? -1]);
    if(!tooltipLocked){ hideTooltip(); } // ← only hide when not locked
  });

  map.on("mouseleave", pointLayerId, ()=>{
    clearRange();
    map.setFilter?.("hover",["==","uid",-1]);
    // Do NOT force-hide when locked; user clicked to keep it.
    if(!tooltipLocked){ hideTooltip(); }
  });

  // CLICK: show tooltip and LOCK it
  map.on("click", pointLayerId, (e:any)=>{
    const f=e.features?.[0]; if(!f) return;
    const props=f.properties||{};
    const evt=e.originalEvent as MouseEvent;
    const x=Math.min(window.innerWidth-420,(evt?.clientX??0)+12);
    const y=Math.min(window.innerHeight-260,(evt?.clientY??0)+12);
    tipRoot.style.left=`${x}px`; tipRoot.style.top=`${y}px`;
    ReactDOM.render(<OriginalTooltip {...props} />, tipRoot);
    tooltipLocked = true; // ← lock on click
  });

  // Click on map background: UNLOCK and hide
  map.on("click",(e:any)=>{
    const feats=map.queryRenderedFeatures?.(e.point,{layers:[pointLayerId]})||[];
    if(!feats.length){ tooltipLocked=false; hideTooltip(); }
  });

  // Optional: ESC to close
  window.addEventListener("keydown", (ev)=>{
    if(ev.key==="Escape"){ tooltipLocked=false; hideTooltip(); }
  });

  return ()=>{ tooltipLocked=false; hideTooltip(); clearRange(); };
}
TSX

echo "✔ Patched $FILE with click-lock + below-point range layers"
