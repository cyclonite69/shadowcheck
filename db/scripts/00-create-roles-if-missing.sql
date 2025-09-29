DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shadowcheck_admin') THEN
    CREATE ROLE shadowcheck_admin LOGIN PASSWORD 'ugbWBPW154UO1HmrLGCsrt2IL';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shadowcheck_analyst') THEN
    CREATE ROLE shadowcheck_analyst LOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shadowcheck_user') THEN
    CREATE ROLE shadowcheck_user LOGIN PASSWORD 'WW52xzcDnSCHB4h4sygtMgwYE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shadowcheck_api') THEN
    CREATE ROLE shadowcheck_api LOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shadowcheck_readonly') THEN
    CREATE ROLE shadowcheck_readonly LOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shadowcheck_emergency') THEN
    CREATE ROLE shadowcheck_emergency LOGIN;
  END IF;
END
$$;
