#!/usr/bin/env bash
# short: add /api/v1/metrics aggregator endpoint (non-interactive)
# v1.0.1 — safer grep, auto-discovery, idempotent

set -euo pipefail

API_FILE_DEFAULT="server/routes/api.ts"

API_FILE="${API_FILE:-$API_FILE_DEFAULT}"

# Auto-discover api.ts if default path is missing
if [[ ! -f "$API_FILE" ]]; then
  # prefer routes/api.ts under server or src
  CANDIDATE="$(find . -type f -path "*/routes/api.ts" -o -name "api.ts" | head -n1 || true)"
  if [[ -n "${CANDIDATE:-}" ]]; then
    API_FILE="$CANDIDATE"
  fi
fi

if [[ ! -f "$API_FILE" ]]; then
  echo "❌ Could not locate api.ts. Set API_FILE=/path/to/api.ts and re-run."
  exit 1
fi

echo "ℹ️  Using API_FILE: $API_FILE"

# Timestamped backup (first run only)
cp -n "$API_FILE" "${API_FILE}.bak.$(date +%s)" || true

# Ensure sql import is present (Drizzle ORM or equivalent)
if ! grep -q "from 'drizzle-orm'" "$API_FILE"; then
  # insert near the other imports
  tmp="$(mktemp)"
  awk '
    BEGIN{inserted=0}
    /^import / && inserted==0 {print; next}
    {
      if (inserted==0 && $0 !~ /^import /) {
        print "import { sql } from '\''drizzle-orm'\'';"
        inserted=1
      }
      print
    }
  ' "$API_FILE" > "$tmp"
  mv "$tmp" "$API_FILE"
  echo "✅ Added: import { sql } from 'drizzle-orm';"
fi

# Append the endpoint only if not already present
if ! grep -q "app\.get('/api/v1/metrics'" "$API_FILE"; then
cat <<'TS' >> "$API_FILE"

// --- Metrics Aggregator ------------------------------------------------------
// Returns a compact snapshot used by the dashboard cards and map bootstrap.
// Shape:
// {
//   db: { connected: boolean, postgis: boolean },
//   counts: { networks: number, locations: number, wifi: number, bt: number, ble: number },
//   sample: { recent: Array<{ssid?:string,bssid?:string,freq_mhz?:number,observed_at?:string}> }
// }
app.get('/api/v1/metrics', async (req, res) => {
  try {
    // Cheap health checks
    const [{ connected }] = await db.execute(sql`SELECT true AS connected`);
    const [{ postgis }]  = await db.execute(sql`
      SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='postgis') AS postgis
    `);

    // Counts (adjust schema/table names if needed)
    const [{ networks }]  = await db.execute(sql`SELECT COUNT(*)::int AS networks FROM app.networks`);
    const [{ locations }] = await db.execute(sql`SELECT COUNT(*)::int AS locations FROM app.locations`);
    const [{ wifi }]      = await db.execute(sql`SELECT COUNT(*)::int AS wifi FROM app.networks WHERE type='wifi'`);
    const [{ bt }]        = await db.execute(sql`SELECT COUNT(*)::int AS bt   FROM app.networks WHERE type IN ('bt','bluetooth')`);
    const [{ ble }]       = await db.execute(sql`SELECT COUNT(*)::int AS ble  FROM app.networks WHERE type='ble'`);

    // Recent few observations for the "Recent SIGINT Activity" list
    const recent = await db.execute(sql`
      SELECT
        COALESCE(current_ssid, ssid) AS ssid,
        bssid,
        NULLIF(current_frequency, 0)::int AS freq_mhz,
        observed_at
      FROM app.locations
      ORDER BY observed_at DESC NULLS LAST
      LIMIT 8
    `);

    res.json({
      db: { connected: !!connected, postgis: !!postgis },
      counts: { networks, locations, wifi, bt, ble },
      sample: { recent }
    });
  } catch (err) {
    console.error('metrics error:', err);
    res.status(500).json({ error: 'metrics_failed', message: (err && err.message) || String(err) });
  }
});
TS
  echo "✅ Appended /api/v1/metrics."
else
  echo "ⓘ /api/v1/metrics already present."
fi

echo "Done."
