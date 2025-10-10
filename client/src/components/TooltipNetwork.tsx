// Auto-added by consolidate_network_map_v1.sh
import React from "react";
import WifiGlyph from "@/components/icons/WifiGlyph";

type Props = {
  ssid?: string; bssid: string; signal?: number;
  security?: string; observedAt?: string; colour?: string;
};

export default function TooltipNetwork({ ssid, bssid, signal, security, observedAt, colour = "#22d3ee" }: Props) {
  return (
    <div className="pointer-events-none select-none rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur shadow-lg shadow-black/40 px-3 py-2 min-w-[220px] max-w-[300px] text-slate-100 text-[13px] leading-tight">
      <div className="flex items-center gap-2">
        <div className="shrink-0" style={{ color: colour }}><WifiGlyph className="h-4 w-4" /></div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-50 truncate">{ssid || "Hidden Network"}</div>
          <div className="text-[11px] text-slate-400 truncate">{bssid}</div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="text-[11px] text-slate-300">Signal</div>
        <div className="text-right text-[11px] text-slate-200">{typeof signal === "number" ? `${signal} dBm` : "—"}</div>
        <div className="text-[11px] text-slate-300">Security</div>
        <div className="text-right"><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-200">{security || "Unknown"}</span></div>
        {observedAt && <div className="col-span-2 text-[10px] text-slate-400 mt-1 truncate">Last seen: {observedAt}</div>}
      </div>
    </div>
  );
}