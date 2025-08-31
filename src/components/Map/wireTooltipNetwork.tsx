// Auto-added by patch_shadowcheck_ui_v1.sh
// Usage in NetworkMap.tsx:
//   import { wireTooltipNetwork } from "@/components/Map/wireTooltipNetwork";
//   useEffect(() => { if (mapRef.current) wireTooltipNetwork(mapRef.current, "pts"); }, []);
import ReactDOM from "react-dom";
import TooltipNetwork from "@/components/TooltipNetwork";

export function wireTooltipNetwork(map: any, layerId = "pts") {
  const root = ensureTooltipRoot();

  function hide() {
    root.style.left = "-9999px";
    root.style.top  = "-9999px";
    try { ReactDOM.render(<></>, root); } catch {}
  }

  map.on("mousemove", layerId, (e: any) => {
    const f = e.features?.[0];
    if (!f) return hide();
    const p = f.properties || {};
    const evt = e.originalEvent as MouseEvent;
    const x = Math.min(window.innerWidth - 320, (evt?.clientX ?? 0) + 12);
    const y = Math.min(window.innerHeight - 180, (evt?.clientY ?? 0) + 12);
    root.style.left = `${x}px`;
    root.style.top  = `${y}px`;

    ReactDOM.render(
      <TooltipNetwork
        ssid={p.ssid as string}
        bssid={p.bssid as string}
        signal={typeof p.signal !== "undefined" ? Number(p.signal) : undefined}
        security={p.security as string}
        observedAt={p.observed_at as string}
        colour={p.colour as string}
      />,
      root
    );

    map.setFilter?.("hover", ["==", "uid", p.uid ?? -1]);
  });

  map.on("mouseleave", layerId, () => {
    hide();
    map.setFilter?.("hover", ["==", "uid", -1]);
  });

  // Mobile tap to show; tap background to dismiss
  map.on("click", layerId, (e: any) => {
    const f = e.features?.[0];
    if (!f) return hide();
    const p = f.properties || {};
    const pt = e.point || { x: 0, y: 0 };
    const x = Math.min(window.innerWidth - 320, pt.x + 12);
    const y = Math.min(window.innerHeight - 180, pt.y + 12);
    root.style.left = `${x}px`;
    root.style.top  = `${y}px`;

    ReactDOM.render(
      <TooltipNetwork
        ssid={p.ssid as string}
        bssid={p.bssid as string}
        signal={typeof p.signal !== "undefined" ? Number(p.signal) : undefined}
        security={p.security as string}
        observedAt={p.observed_at as string}
        colour={p.colour as string}
      />,
      root
    );

    map.setFilter?.("hover", ["==", "uid", p.uid ?? -1]);
  });

  map.on("click", (e: any) => {
    const feats = map.queryRenderedFeatures?.(e.point, { layers: [layerId] }) || [];
    if (!feats.length) hide();
  });

  return hide; // optional disposer
}

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
