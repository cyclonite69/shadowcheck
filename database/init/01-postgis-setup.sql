-- PostGIS initialization for ShadowCheck
-- This runs automatically when the container starts

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create app schema
CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA app TO "user";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA app TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app TO "user";

-- Set default search path
ALTER DATABASE shadowcheck SET search_path TO app, public, postgis;
