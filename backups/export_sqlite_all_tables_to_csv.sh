#!/usr/bin/env bash
# export_sqlite_all_tables_to_csv.sh
# Exports 'location', 'network', 'route' tables from the given sqlite file to CSVs.
# Usage:
#   ./export_sqlite_all_tables_to_csv.sh /tmp/kml_sqlite_unpack178997/backup-1759990021487.sqlite
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 /path/to/backup.sqlite"
  exit 2
fi

SQLITE="$1"
if [ ! -f "$SQLITE" ]; then
  echo "ERROR: sqlite file not found: $SQLITE"
  exit 3
fi

OUT_LOC="./sqlite_location_export.csv"
OUT_NET="./sqlite_network_export.csv"
OUT_ROUTE="./sqlite_route_export.csv"

echo "Exporting location -> ${OUT_LOC}"
sqlite3 -header -csv "$SQLITE" "SELECT * FROM location;" > "${OUT_LOC}"
echo "Exporting network -> ${OUT_NET}"
sqlite3 -header -csv "$SQLITE" "SELECT * FROM network;" > "${OUT_NET}"
echo "Exporting route -> ${OUT_ROUTE}"
sqlite3 -header -csv "$SQLITE" "SELECT * FROM route;" > "${OUT_ROUTE}"

echo "Done. Files:"
ls -lh "${OUT_LOC}" "${OUT_NET}" "${OUT_ROUTE}"
