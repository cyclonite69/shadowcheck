#!/usr/bin/env bash
set -euo pipefail
: "${PGHOST:?Set PGHOST}"; : "${PGPORT:?Set PGPORT}"; : "${PGDATABASE:?Set PGDATABASE}"

get_pass(){ awk -F: -v h="$PGHOST" -v p="$PGPORT" -v d="$PGDATABASE" -v u="$1" \
  '$1==h && $2==p && $3==d && $4==u{print $5}' "$HOME/.pgpass"; }

run_for(){ local u="$1" p; p="$(get_pass "$u")" || true
  [[ -n "$p" ]] || { echo "No pgpass for $u @ $PGHOST:$PGPORT/$PGDATABASE" >&2; return 1; }
  echo "== $u =="; PGPASSWORD="$p" psql "sslmode=require" -U "$u" <<'SQL'
SELECT current_user;
SELECT current_database();
SHOW search_path;
SET statement_timeout='10s';
SELECT id, radio_short, security_short
FROM app.location_details_asof
ORDER BY time DESC
LIMIT 3;
SQL
}
run_for shadowcheck_app
run_for sigint_admin
