#!/usr/bin/env bash
# 001b_fix_default_privs_sigint_admin.sh
# v1.0.0 — As sigint_admin, set default privileges in raw/app/enrich (idempotent).

set -euo pipefail
PSQL_ADMIN='service=sigint_admin'

# Sanity: can connect as sigint_admin?
psql "$PSQL_ADMIN" -tAc "SELECT current_user, 1;" >/dev/null

psql "$PSQL_ADMIN" -v ON_ERROR_STOP=1 <<'SQL'
-- Ensure we can see the schemas (grants were applied earlier; this is just defensive)
GRANT USAGE ON SCHEMA raw, app, enrich TO sigint_admin;

-- Default privileges for future objects CREATED BY sigint_admin in these schemas
ALTER DEFAULT PRIVILEGES IN SCHEMA raw, app, enrich
  GRANT SELECT ON TABLES TO shadowcheck_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA raw, app, enrich
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sigint_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA raw, app, enrich
  GRANT USAGE ON SEQUENCES TO shadowcheck_app, sigint_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA raw, app, enrich
  GRANT EXECUTE ON FUNCTIONS TO shadowcheck_app, sigint_admin;
SQL

echo "== Snapshot: default ACLs defined by sigint_admin =="
psql "$PSQL_ADMIN" -tAc "
SELECT defaclrole::regrole AS by_role, n.nspname AS schema, defaclacl
FROM pg_default_acl d
JOIN pg_namespace n ON d.defaclnamespace = n.oid
WHERE defaclrole = 'sigint_admin'::regrole
  AND n.nspname IN ('raw','app','enrich')
ORDER BY 1,2;
"
