#!/usr/bin/env bash
# ShadowCheck UI Patch — Piece 2 (VERIFY + guidance)
set -euo pipefail
ROOT="."
CANDS=(
  "$ROOT/src/components/Map/NetworkMap.tsx"
  "$ROOT/src/Map/NetworkMap.tsx"
  "$ROOT/src/pages/NetworkMap.tsx"
)
find_map() {
  for f in "${CANDS[@]}"; do [ -f "$f" ] && { echo "$f"; return; }; done
  local g; g="$(grep -RIl --include='*.tsx' 'new mapboxgl.Map' "$ROOT" || true | head -n1)"
  [ -n "$g" ] && { echo "$g"; return; }
  exit 1
}
MF="$(find_map)" || { echo "✗ Could not find your map component."; exit 1; }
echo "• Checking $MF"
imp=0; call=0
grep -q 'wireTooltipNetwork' "$MF" && imp=1 || true
grep -q 'wireTooltipNetwork(.*"pts"' "$MF" && call=1 || true
if [ $imp -eq 1 ]; then echo "✓ import present"; else
  echo '✗ import missing. Add near top:'
  echo '  import { wireTooltipNetwork } from "@/components/Map/wireTooltipNetwork";'
fi
if [ $call -eq 1 ]; then echo '✓ call present (wireTooltipNetwork(..., "pts"))'; else
  echo '✗ call missing. After map + point layer ("pts") exist, add:'
  echo '  wireTooltipNetwork(mapRef.current, "pts");'
  echo '  (Replace "pts" with your actual point layer id if different.)'
fi

echo
echo "Optional: table mobile scroll + signal bar:"
cat <<'TIP'
Wrap your table with:
  <div className="overflow-x-auto md:overflow-visible rounded-2xl border border-white/10"> ... </div>

In the Signal column cell:
  <div className="flex items-center gap-2">
    <span className="text-xs tabular-nums">{row.signal ?? "—"} dBm</span>
    {typeof row.signal === "number" && (
      <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400"
             style={{ width: `${Math.max(0, Math.min(100, ((row.signal + 100) / 80) * 100))}%` }} />
      </div>
    )}
  </div>
TIP
