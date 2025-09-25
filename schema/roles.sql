-- =====================================================
-- ShadowCheck Database Roles and Security Configuration
-- Implements role-based access control for production deployment
-- =====================================================

-- =====================================================
-- ROLE CREATION
-- =====================================================

-- Remove existing roles if they exist (for clean setup)
DROP ROLE IF EXISTS shadowcheck_admin;
DROP ROLE IF EXISTS shadowcheck_user;
DROP ROLE IF EXISTS shadowcheck_analyst;
DROP ROLE IF EXISTS shadowcheck_readonly;
DROP ROLE IF EXISTS shadowcheck_api;

-- Create database roles with appropriate permissions
CREATE ROLE shadowcheck_admin WITH
    LOGIN
    CREATEDB
    CREATEROLE
    REPLICATION
    BYPASSRLS
    CONNECTION LIMIT 10
    PASSWORD 'CHANGE_ME_ADMIN_2024!';

CREATE ROLE shadowcheck_analyst WITH
    LOGIN
    CONNECTION LIMIT 25
    PASSWORD 'CHANGE_ME_ANALYST_2024!';

CREATE ROLE shadowcheck_user WITH
    LOGIN
    CONNECTION LIMIT 50
    PASSWORD 'CHANGE_ME_USER_2024!';

CREATE ROLE shadowcheck_readonly WITH
    LOGIN
    CONNECTION LIMIT 100
    PASSWORD 'CHANGE_ME_READONLY_2024!';

CREATE ROLE shadowcheck_api WITH
    LOGIN
    CONNECTION LIMIT 200
    PASSWORD 'CHANGE_ME_API_2024!';

-- =====================================================
-- SCHEMA PERMISSIONS
-- =====================================================

-- Grant schema usage to all roles
GRANT USAGE ON SCHEMA app TO shadowcheck_admin, shadowcheck_analyst, shadowcheck_user, shadowcheck_readonly, shadowcheck_api;

-- Grant schema creation to admin only
GRANT CREATE ON SCHEMA app TO shadowcheck_admin;

-- =====================================================
-- TABLE PERMISSIONS
-- =====================================================

-- Admin: Full access to everything
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA app TO shadowcheck_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_admin;

-- Analyst: Full access to data analysis and security tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wireless_access_points TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.signal_measurements TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.position_measurements TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.location_visits TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.security_incidents TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.tracking_routes TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.user_devices TO shadowcheck_analyst;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_api_enrichments TO shadowcheck_analyst;

-- Analyst: Read-only access to reference data
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_analyst;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_analyst;

-- Analyst: Legacy table access for investigation
GRANT SELECT ON TABLE app.provenance TO shadowcheck_analyst;
GRANT SELECT ON TABLE app.locations TO shadowcheck_analyst;
GRANT SELECT ON TABLE app.networks TO shadowcheck_analyst;
GRANT SELECT ON TABLE app.routes TO shadowcheck_analyst;
GRANT SELECT ON TABLE app.ieee_ouis TO shadowcheck_analyst;

-- User: Read and limited write access to main tables
GRANT SELECT, INSERT, UPDATE ON TABLE app.wireless_access_points TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.signal_measurements TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.position_measurements TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.location_visits TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE ON TABLE app.user_devices TO shadowcheck_user;

-- User: Read-only access to reference and security data
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_user;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_user;
GRANT SELECT ON TABLE app.security_incidents TO shadowcheck_user;
GRANT SELECT ON TABLE app.tracking_routes TO shadowcheck_user;
GRANT SELECT ON TABLE app.wigle_api_enrichments TO shadowcheck_user;

-- Read-only: SELECT access to all tables except sensitive security data
GRANT SELECT ON TABLE app.wireless_access_points TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.signal_measurements TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.position_measurements TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.location_visits TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.tracking_routes TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.user_devices TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.wigle_api_enrichments TO shadowcheck_readonly;

-- Read-only: Legacy tables for research
GRANT SELECT ON TABLE app.provenance TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.locations TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.networks TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.routes TO shadowcheck_readonly;
GRANT SELECT ON TABLE app.ieee_ouis TO shadowcheck_readonly;

-- API: Specific permissions for application access
GRANT SELECT, INSERT, UPDATE ON TABLE app.wireless_access_points TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.signal_measurements TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.position_measurements TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.location_visits TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.user_devices TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.tracking_routes TO shadowcheck_api;
GRANT SELECT, INSERT, UPDATE ON TABLE app.wigle_api_enrichments TO shadowcheck_api;

-- API: Read-only access to reference data
GRANT SELECT ON TABLE app.oui_manufacturers TO shadowcheck_api;
GRANT SELECT ON TABLE app.data_sources TO shadowcheck_api;

-- API: Limited security incident access (read + insert for automated detection)
GRANT SELECT, INSERT, UPDATE ON TABLE app.security_incidents TO shadowcheck_api;

-- =====================================================
-- SEQUENCE PERMISSIONS
-- =====================================================

-- Grant sequence usage for roles that can insert data
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_analyst;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_api;

-- =====================================================
-- FUNCTION PERMISSIONS
-- =====================================================

-- Grant execution on functions to appropriate roles
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_analyst;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO shadowcheck_api;

-- Read-only can only execute read-only functions
GRANT EXECUTE ON FUNCTION app.update_updated_at_column() TO shadowcheck_readonly;

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE app.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_devices ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and analysts can see all security incidents
CREATE POLICY security_incidents_admin_analyst_policy ON app.security_incidents
    FOR ALL TO shadowcheck_admin, shadowcheck_analyst
    USING (true);

-- Policy: Users can only see non-sensitive security incidents
CREATE POLICY security_incidents_user_policy ON app.security_incidents
    FOR SELECT TO shadowcheck_user
    USING (threat_level != 'critical' OR investigation_status = 'resolved');

-- Policy: API can insert and read incidents but limited updates
CREATE POLICY security_incidents_api_policy ON app.security_incidents
    FOR ALL TO shadowcheck_api
    USING (true)
    WITH CHECK (true);

-- Policy: Read-only cannot access security incidents
-- (No policy created = no access)

-- Policy: Users can only modify their own devices
CREATE POLICY user_devices_ownership_policy ON app.user_devices
    FOR ALL TO shadowcheck_user
    USING (is_owned_by_user = true);

-- Policy: Admins and analysts can see all devices
CREATE POLICY user_devices_admin_analyst_policy ON app.user_devices
    FOR ALL TO shadowcheck_admin, shadowcheck_analyst
    USING (true);

-- Policy: API can access all devices for detection algorithms
CREATE POLICY user_devices_api_policy ON app.user_devices
    FOR ALL TO shadowcheck_api
    USING (true);

-- Policy: Read-only can see anonymized device info
CREATE POLICY user_devices_readonly_policy ON app.user_devices
    FOR SELECT TO shadowcheck_readonly
    USING (privacy_enabled = false OR device_name NOT LIKE '%personal%');

-- =====================================================
-- COLUMN-LEVEL SECURITY
-- =====================================================

-- Revoke access to sensitive columns for read-only users
REVOKE SELECT (mac_address_hash) ON app.user_devices FROM shadowcheck_readonly;
REVOKE SELECT (analyst_notes) ON app.security_incidents FROM shadowcheck_readonly;

-- =====================================================
-- DEFAULT PRIVILEGES FOR FUTURE OBJECTS
-- =====================================================

-- Set default privileges for new tables created by admin
ALTER DEFAULT PRIVILEGES FOR ROLE shadowcheck_admin IN SCHEMA app
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO shadowcheck_analyst;

ALTER DEFAULT PRIVILEGES FOR ROLE shadowcheck_admin IN SCHEMA app
    GRANT SELECT, INSERT, UPDATE ON TABLES TO shadowcheck_user;

ALTER DEFAULT PRIVILEGES FOR ROLE shadowcheck_admin IN SCHEMA app
    GRANT SELECT ON TABLES TO shadowcheck_readonly;

ALTER DEFAULT PRIVILEGES FOR ROLE shadowcheck_admin IN SCHEMA app
    GRANT SELECT, INSERT, UPDATE ON TABLES TO shadowcheck_api;

-- Set default privileges for sequences
ALTER DEFAULT PRIVILEGES FOR ROLE shadowcheck_admin IN SCHEMA app
    GRANT USAGE, SELECT ON SEQUENCES TO shadowcheck_analyst, shadowcheck_user, shadowcheck_api;

-- Set default privileges for functions
ALTER DEFAULT PRIVILEGES FOR ROLE shadowcheck_admin IN SCHEMA app
    GRANT EXECUTE ON FUNCTIONS TO shadowcheck_analyst, shadowcheck_user, shadowcheck_api;

-- =====================================================
-- CONNECTION AND RESOURCE LIMITS
-- =====================================================

-- Set statement timeout to prevent runaway queries
ALTER ROLE shadowcheck_readonly SET statement_timeout = '5min';
ALTER ROLE shadowcheck_user SET statement_timeout = '10min';
ALTER ROLE shadowcheck_api SET statement_timeout = '30s';
ALTER ROLE shadowcheck_analyst SET statement_timeout = '30min';

-- Set work memory limits
ALTER ROLE shadowcheck_readonly SET work_mem = '32MB';
ALTER ROLE shadowcheck_user SET work_mem = '64MB';
ALTER ROLE shadowcheck_api SET work_mem = '16MB';
ALTER ROLE shadowcheck_analyst SET work_mem = '256MB';
ALTER ROLE shadowcheck_admin SET work_mem = '512MB';

-- Set maintenance work memory
ALTER ROLE shadowcheck_admin SET maintenance_work_mem = '1GB';
ALTER ROLE shadowcheck_analyst SET maintenance_work_mem = '256MB';

-- Prevent certain roles from creating temp tables
ALTER ROLE shadowcheck_readonly SET temp_file_limit = '100MB';
ALTER ROLE shadowcheck_api SET temp_file_limit = '50MB';

-- =====================================================
-- AUDIT AND LOGGING CONFIGURATION
-- =====================================================

-- Enable logging for sensitive operations
ALTER ROLE shadowcheck_admin SET log_statement = 'ddl';
ALTER ROLE shadowcheck_analyst SET log_statement = 'mod';

-- Log connections and disconnections
ALTER ROLE shadowcheck_admin SET log_connections = on;
ALTER ROLE shadowcheck_analyst SET log_connections = on;

-- =====================================================
-- SECURITY VIEWS FOR MONITORING
-- =====================================================

-- Create view for connection monitoring (admin only)
CREATE OR REPLACE VIEW app.active_connections AS
SELECT
    datname,
    usename,
    client_addr,
    client_hostname,
    client_port,
    backend_start,
    query_start,
    state,
    query
FROM pg_stat_activity
WHERE datname = current_database()
  AND usename LIKE 'shadowcheck_%';

-- Grant access to admin only
GRANT SELECT ON app.active_connections TO shadowcheck_admin;

-- Create view for permission auditing
CREATE OR REPLACE VIEW app.role_permissions AS
SELECT
    r.rolname,
    n.nspname as schema_name,
    c.relname as table_name,
    p.privilege_type
FROM pg_roles r
JOIN information_schema.role_table_grants p ON r.rolname = p.grantee
JOIN pg_class c ON p.table_name = c.relname
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE r.rolname LIKE 'shadowcheck_%'
  AND n.nspname = 'app'
ORDER BY r.rolname, n.nspname, c.relname, p.privilege_type;

GRANT SELECT ON app.role_permissions TO shadowcheck_admin;

-- =====================================================
-- EMERGENCY ACCESS PROCEDURES
-- =====================================================

-- Create emergency admin account (disabled by default)
CREATE ROLE shadowcheck_emergency WITH
    LOGIN
    SUPERUSER
    CONNECTION LIMIT 1
    PASSWORD 'EMERGENCY_ACCESS_2024_CHANGE_IMMEDIATELY!'
    VALID UNTIL '2024-12-31';

-- Disable emergency account by default
ALTER ROLE shadowcheck_emergency NOLOGIN;

-- Document emergency access procedure
COMMENT ON ROLE shadowcheck_emergency IS 'Emergency access account - enable only during critical incidents. Instructions: 1) ALTER ROLE shadowcheck_emergency LOGIN; 2) Connect and resolve issue; 3) ALTER ROLE shadowcheck_emergency NOLOGIN; 4) Change password';

-- =====================================================
-- ROLE DOCUMENTATION
-- =====================================================

-- Add comments documenting each role's purpose
COMMENT ON ROLE shadowcheck_admin IS 'Full database administrator - schema changes, user management, backup/restore operations';
COMMENT ON ROLE shadowcheck_analyst IS 'Security analyst - full access to operational data and security incident management';
COMMENT ON ROLE shadowcheck_user IS 'Standard user - wardriving data collection and limited analysis capabilities';
COMMENT ON ROLE shadowcheck_readonly IS 'Read-only access - dashboard displays, public APIs, reporting without sensitive data';
COMMENT ON ROLE shadowcheck_api IS 'Application API access - automated data ingestion and real-time queries with limited write access';

-- =====================================================
-- SECURITY RECOMMENDATIONS
-- =====================================================

/*
SECURITY IMPLEMENTATION CHECKLIST:

1. PASSWORD MANAGEMENT:
   - Change all default passwords immediately after deployment
   - Implement password rotation policy (90 days)
   - Use strong passwords (minimum 16 characters, mixed case, numbers, symbols)
   - Consider using PostgreSQL SCRAM-SHA-256 authentication

2. CONNECTION SECURITY:
   - Enable SSL/TLS for all connections (require SSL in pg_hba.conf)
   - Configure certificate-based authentication for high-privilege roles
   - Restrict network access using pg_hba.conf host-based authentication
   - Use connection pooling (PgBouncer) to limit direct database connections

3. MONITORING AND AUDITING:
   - Enable log_statement for all DDL and modification operations
   - Monitor failed login attempts
   - Set up alerts for unusual query patterns
   - Regularly review role permissions and active connections

4. DATA PROTECTION:
   - Implement column-level encryption for sensitive data
   - Use transparent data encryption (TDE) if available
   - Regular security audits of RLS policies
   - Implement data retention and purging policies

5. BACKUP SECURITY:
   - Encrypt database backups
   - Secure backup storage with limited access
   - Test backup restoration procedures regularly
   - Implement point-in-time recovery capabilities

6. APPLICATION SECURITY:
   - Use connection pooling with role switching
   - Implement application-level authentication
   - Validate and sanitize all user inputs
   - Use prepared statements to prevent SQL injection

EXAMPLE pg_hba.conf ENTRIES:
# Administrative access (local only)
local   shadowcheck     shadowcheck_admin                       peer

# API access (application servers only)
host    shadowcheck     shadowcheck_api     10.0.1.0/24         scram-sha-256

# Analyst access (VPN network)
host    shadowcheck     shadowcheck_analyst 10.0.2.0/24         scram-sha-256

# User access (internal network)
host    shadowcheck     shadowcheck_user    10.0.3.0/24         scram-sha-256

# Read-only access (DMZ network)
host    shadowcheck     shadowcheck_readonly 10.0.4.0/24        scram-sha-256

# Deny all other connections
host    all             all                 0.0.0.0/0           reject
*/

-- =====================================================
-- ROLE TESTING QUERIES
-- =====================================================

/*
Test role permissions with these queries:

-- Test admin access (should work)
\c shadowcheck shadowcheck_admin
SELECT COUNT(*) FROM app.security_incidents;

-- Test analyst access (should work)
\c shadowcheck shadowcheck_analyst
INSERT INTO app.security_incidents (target_device_id, incident_type, threat_level)
VALUES (1, 'test', 'low');

-- Test user access (should be limited)
\c shadowcheck shadowcheck_user
SELECT COUNT(*) FROM app.security_incidents; -- Should only see non-critical

-- Test readonly access (should fail on write)
\c shadowcheck shadowcheck_readonly
INSERT INTO app.wireless_access_points (mac_address, radio_technology)
VALUES ('00:00:00:00:00:01', 'wifi_2_4_ghz'); -- Should fail

-- Test API access
\c shadowcheck shadowcheck_api
SELECT COUNT(*) FROM app.wireless_access_points; -- Should work
*/