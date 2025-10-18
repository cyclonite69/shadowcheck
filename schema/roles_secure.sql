-- =====================================================
-- ShadowCheck Secure Database Roles with Auto-Generated Passwords
-- Uses SCRAM-SHA-256 authentication and secure password storage
-- =====================================================

-- Function to generate secure passwords
CREATE OR REPLACE FUNCTION app.generate_secure_password(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    IF length < 16 THEN
        RAISE EXCEPTION 'Password length must be at least 16 characters';
    END IF;

    FOR i IN 1..length LOOP
        result := result || substr(chars, (random() * length(chars))::INTEGER + 1, 1);
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create secure credentials table for password storage
CREATE TABLE IF NOT EXISTS app.role_credentials (
    role_name TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,  -- Store SCRAM-SHA-256 hash for reference
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
    last_rotation TIMESTAMPTZ DEFAULT NOW(),
    rotation_required BOOLEAN DEFAULT FALSE,
    created_by TEXT DEFAULT current_user,
    notes TEXT
);

-- Secure the credentials table
ALTER TABLE app.role_credentials ENABLE ROW LEVEL SECURITY;

-- Only admins can access credentials
CREATE POLICY credentials_admin_only ON app.role_credentials
    FOR ALL TO shadowcheck_admin
    USING (true);

-- =====================================================
-- ROLE CREATION WITH AUTO-GENERATED PASSWORDS
-- =====================================================

-- Clean up existing roles
DO $$
DECLARE
    role_record RECORD;
BEGIN
    FOR role_record IN
        SELECT rolname FROM pg_roles
        WHERE rolname LIKE 'shadowcheck_%' AND rolname != 'shadowcheck'
    LOOP
        EXECUTE 'DROP ROLE IF EXISTS ' || quote_ident(role_record.rolname);
    END LOOP;
END $$;

-- Clear credentials table
TRUNCATE TABLE app.role_credentials;

-- Generate and store admin password
DO $$
DECLARE
    admin_password TEXT;
    analyst_password TEXT;
    user_password TEXT;
    readonly_password TEXT;
    api_password TEXT;
    emergency_password TEXT;
BEGIN
    -- Generate secure passwords
    admin_password := app.generate_secure_password(32);
    analyst_password := app.generate_secure_password(32);
    user_password := app.generate_secure_password(32);
    readonly_password := app.generate_secure_password(32);
    api_password := app.generate_secure_password(32);
    emergency_password := app.generate_secure_password(40);

    -- Create roles with generated passwords
    EXECUTE format('CREATE ROLE shadowcheck_admin WITH
        LOGIN
        CREATEDB
        CREATEROLE
        REPLICATION
        BYPASSRLS
        CONNECTION LIMIT 5
        PASSWORD %L', admin_password);

    EXECUTE format('CREATE ROLE shadowcheck_analyst WITH
        LOGIN
        CONNECTION LIMIT 10
        PASSWORD %L', analyst_password);

    EXECUTE format('CREATE ROLE shadowcheck_user WITH
        LOGIN
        CONNECTION LIMIT 25
        PASSWORD %L', user_password);

    EXECUTE format('CREATE ROLE shadowcheck_readonly WITH
        LOGIN
        CONNECTION LIMIT 50
        PASSWORD %L', readonly_password);

    EXECUTE format('CREATE ROLE shadowcheck_api WITH
        LOGIN
        CONNECTION LIMIT 100
        PASSWORD %L', api_password);

    EXECUTE format('CREATE ROLE shadowcheck_emergency WITH
        LOGIN
        SUPERUSER
        CONNECTION LIMIT 1
        PASSWORD %L
        VALID UNTIL %L', emergency_password, (NOW() + INTERVAL '1 year')::DATE);

    -- Store password references in credentials table
    INSERT INTO app.role_credentials (role_name, password_hash, notes) VALUES
    ('shadowcheck_admin', 'SCRAM-SHA-256$4096:' || encode(digest(admin_password, 'sha256'), 'hex'), 'Database administrator - full access'),
    ('shadowcheck_analyst', 'SCRAM-SHA-256$4096:' || encode(digest(analyst_password, 'sha256'), 'hex'), 'Security analyst - operational data access'),
    ('shadowcheck_user', 'SCRAM-SHA-256$4096:' || encode(digest(user_password, 'sha256'), 'hex'), 'Standard user - data collection and analysis'),
    ('shadowcheck_readonly', 'SCRAM-SHA-256$4096:' || encode(digest(readonly_password, 'sha256'), 'hex'), 'Read-only access - reporting and dashboards'),
    ('shadowcheck_api', 'SCRAM-SHA-256$4096:' || encode(digest(api_password, 'sha256'), 'hex'), 'API access - automated systems'),
    ('shadowcheck_emergency', 'SCRAM-SHA-256$4096:' || encode(digest(emergency_password, 'sha256'), 'hex'), 'Emergency access - use only during incidents');

    -- Output passwords to file (will be captured by deployment script)
    RAISE NOTICE 'ROLE_PASSWORDS_START';
    RAISE NOTICE 'shadowcheck_admin: %', admin_password;
    RAISE NOTICE 'shadowcheck_analyst: %', analyst_password;
    RAISE NOTICE 'shadowcheck_user: %', user_password;
    RAISE NOTICE 'shadowcheck_readonly: %', readonly_password;
    RAISE NOTICE 'shadowcheck_api: %', api_password;
    RAISE NOTICE 'shadowcheck_emergency: %', emergency_password;
    RAISE NOTICE 'ROLE_PASSWORDS_END';
END $$;

-- Disable emergency account by default
ALTER ROLE shadowcheck_emergency NOLOGIN;

-- =====================================================
-- APPLY ALL PERMISSIONS FROM ORIGINAL ROLES.SQL
-- =====================================================

-- Schema permissions
GRANT USAGE ON SCHEMA app TO shadowcheck_admin, shadowcheck_analyst, shadowcheck_user, shadowcheck_readonly, shadowcheck_api;
GRANT CREATE ON SCHEMA app TO shadowcheck_admin;

-- Admin: Full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA app TO shadowcheck_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_admin;

-- Analyst: Full access to operational data
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wireless_access_points TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.signal_measurements TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.position_measurements TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.location_visits TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.security_incidents TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.tracking_routes TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.user_devices TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_api_enrichments TO shadowcheck_analyst;
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_analyst;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_analyst;

-- User: Limited write access
GRANT SELECT, INSERT, UPDATE ON TABLE app.wireless_access_points TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.signal_measurements TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.position_measurements TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.location_visits TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.user_devices TO shadowcheck_user;
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_user;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_user;
GRANT SELECT ON TABLE app.security_incidents TO shadowcheck_user;
GRANT SELECT ON TABLE app.tracking_routes TO shadowcheck_user;
GRANT SELECT ON TABLE app.wigle_api_enrichments TO shadowcheck_user;

-- Read-only: SELECT only
GRANT SELECT ON TABLE app.wireless_access_points TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.signal_measurements TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.position_measurements TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.location_visits TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.tracking_routes TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.user_devices TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.wigle_api_enrichments TO shadowcheck_readonly;

-- API: Application access
GRANT SELECT, INSERT, UPDATE ON TABLE app.wireless_access_points TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.signal_measurements TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.position_measurements TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.location_visits TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.user_devices TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.tracking_routes TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.wigle_api_enrichments TO shadowcheck_api;
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_api;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.security_incidents TO shadowcheck_api;

-- Sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_analyst;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_api;

-- Function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_analyst;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_api;

-- Row-Level Security
ALTER TABLE app.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_devices ENABLE ROW LEVEL SECURITY;

-- Security policies
CREATE POLICY security_incidents_admin_analyst_policy ON app.security_incidents
    FOR ALL TO shadowcheck_admin, shadowcheck_analyst
    USING (true);

CREATE POLICY security_incidents_user_policy ON app.security_incidents
    FOR SELECT TO shadowcheck_user
    USING (threat_level != 'critical' OR investigation_status = 'resolved');

CREATE POLICY security_incidents_api_policy ON app.security_incidents
    FOR ALL TO shadowcheck_api
    USING (true);

CREATE POLICY user_devices_ownership_policy ON app.user_devices
    FOR ALL TO shadowcheck_user
    USING (is_owned_by_user = true);

CREATE POLICY user_devices_admin_analyst_policy ON app.user_devices
    FOR ALL TO shadowcheck_admin, shadowcheck_analyst
    USING (true);

CREATE POLICY user_devices_api_policy ON app.user_devices
    FOR ALL TO shadowcheck_api
    USING (true);

CREATE POLICY user_devices_readonly_policy ON app.user_devices
    FOR SELECT TO shadowcheck_readonly
    USING (privacy_enabled = false OR device_name NOT LIKE '%personal%');

-- Resource limits
ALTER ROLE shadowcheck_readonly SET statement_timeout = '5min';
ALTER ROLE shadowcheck_user SET statement_timeout = '10min';
ALTER ROLE shadowcheck_api SET statement_timeout = '30s';
ALTER ROLE shadowcheck_analyst SET statement_timeout = '30min';

ALTER ROLE shadowcheck_readonly SET work_mem = '32MB';
ALTER ROLE shadowcheck_user SET work_mem = '64MB';
ALTER ROLE shadowcheck_api SET work_mem = '16MB';
ALTER ROLE shadowcheck_analyst SET work_mem = '256MB';
ALTER ROLE shadowcheck_admin SET work_mem = '512MB';

-- Logging
ALTER ROLE shadowcheck_admin SET log_statement = 'ddl';
ALTER ROLE shadowcheck_analyst SET log_statement = 'mod';
ALTER ROLE shadowcheck_admin SET log_connections = on;
ALTER ROLE shadowcheck_analyst SET log_connections = on;

-- Comments
COMMENT ON ROLE shadowcheck_admin IS 'Full database administrator - schema changes, user management, backup/restore operations';
COMMENT ON ROLE shadowcheck_analyst IS 'Security analyst - full access to operational data and security incident management';
COMMENT ON ROLE shadowcheck_user IS 'Standard user - wardriving data collection and limited analysis capabilities';
COMMENT ON ROLE shadowcheck_readonly IS 'Read-only access - dashboard displays, public APIs, reporting without sensitive data';
COMMENT ON ROLE shadowcheck_api IS 'Application API access - automated data ingestion and real-time queries with limited write access';
COMMENT ON ROLE shadowcheck_emergency IS 'Emergency access account - enable only during critical incidents';

-- Password rotation function
CREATE OR REPLACE FUNCTION app.rotate_role_password(role_name TEXT)
RETURNS TEXT AS $$
DECLARE
    new_password TEXT;
BEGIN
    -- Generate new password
    new_password := app.generate_secure_password(32);

    -- Update role password
    EXECUTE format('ALTER ROLE %I PASSWORD %L', role_name, new_password);

    -- Update credentials table
    UPDATE app.role_credentials
    SET password_hash = 'SCRAM-SHA-256$4096:' || encode(digest(new_password, 'sha256'), 'hex'),
        last_rotation = NOW(),
        rotation_required = FALSE
    WHERE role_credentials.role_name = rotate_role_password.role_name;

    RETURN new_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only admin can rotate passwords
REVOKE EXECUTE ON FUNCTION app.rotate_role_password(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.rotate_role_password(TEXT) TO shadowcheck_admin;

-- Create view for password expiry monitoring
CREATE OR REPLACE VIEW app.password_expiry_status AS
SELECT
    role_name,
    expires_at,
    expires_at - NOW() as time_until_expiry,
    rotation_required,
    CASE
        WHEN expires_at < NOW() THEN 'EXPIRED'
        WHEN expires_at < NOW() + INTERVAL '7 days' THEN 'EXPIRING_SOON'
        WHEN rotation_required THEN 'ROTATION_REQUIRED'
        ELSE 'VALID'
    END as status
FROM app.role_credentials;

GRANT SELECT ON app.password_expiry_status TO shadowcheck_admin;