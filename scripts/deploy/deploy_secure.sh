#!/bin/bash
# ShadowCheck Secure Database Deployment with Auto-Generated Passwords
# Generates SCRAM-SHA-256 passwords and stores them securely

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="shadowcheck"
DB_USER="shadowcheck"
DB_PASSWORD="your_secure_password_here"
DB_HOST="127.0.0.1"
DB_PORT="5432"

# Security configuration
CREDENTIALS_DIR="credentials"
CREDENTIALS_FILE="$CREDENTIALS_DIR/role_passwords_$(date +%Y%m%d_%H%M%S).txt"
BACKUP_DIR="backups"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create secure directories
setup_secure_directories() {
    log "Setting up secure directories..."

    # Create credentials directory with restricted permissions
    mkdir -p "$CREDENTIALS_DIR"
    chmod 700 "$CREDENTIALS_DIR"

    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    chmod 750 "$BACKUP_DIR"

    # Create postgres config directory
    mkdir -p postgres-config
    chmod 755 postgres-config

    success "Secure directories created"
}

# Check database connection
check_database() {
    log "Checking database connection..."

    if ! command -v psql &> /dev/null; then
        error "psql command not found. Please install PostgreSQL client."
        exit 1
    fi

    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
        success "Database connection successful"
    else
        error "Cannot connect to database. Please ensure PostgreSQL is running."
        exit 1
    fi
}

# Deploy schema
deploy_schema() {
    log "Deploying refactored schema..."

    # Check if this is a fresh deployment or migration
    local has_legacy=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'locations');" | tr -d ' ')

    if [ "$has_legacy" = "t" ]; then
        log "Legacy tables detected - performing migration"
        execute_sql_file "schema/schema_refactored.sql" "Refactored Schema Creation"
        execute_sql_file "schema/migration.sql" "Data Migration from Legacy Tables"
    else
        log "Fresh deployment - creating schema only"
        execute_sql_file "schema/schema_refactored.sql" "Refactored Schema Creation"
    fi

    # Apply performance optimizations
    if [ -f "schema/indexes.sql" ]; then
        execute_sql_file "schema/indexes.sql" "Performance Indexes"
    fi
}

# Deploy secure roles and capture passwords
deploy_secure_roles() {
    log "Deploying secure roles with auto-generated passwords..."

    local temp_output=$(mktemp)

    # Execute roles script and capture output
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "schema/roles_secure.sql" > "$temp_output" 2>&1; then
        success "Secure roles created successfully"

        # Extract passwords from output
        if grep -q "ROLE_PASSWORDS_START" "$temp_output"; then
            log "Extracting generated passwords..."

            # Create secure credentials file
            cat > "$CREDENTIALS_FILE" << 'EOF'
# ShadowCheck Database Role Credentials
# Generated: $(date)
# WARNING: Keep this file secure! Contains plaintext passwords.
# Recommended: Store in password manager and delete this file.

EOF

            # Extract password lines
            sed -n '/ROLE_PASSWORDS_START/,/ROLE_PASSWORDS_END/p' "$temp_output" | \
            grep "NOTICE:" | \
            sed 's/^NOTICE: *//' | \
            grep -v "ROLE_PASSWORDS_" >> "$CREDENTIALS_FILE"

            # Add connection strings
            cat >> "$CREDENTIALS_FILE" << EOF

# Connection Strings:
EOF

            while IFS=': ' read -r role password; do
                if [[ "$role" != "" && "$password" != "" ]]; then
                    echo "# $role: postgresql://$role:$password@$DB_HOST:$DB_PORT/$DB_NAME" >> "$CREDENTIALS_FILE"
                fi
            done < <(grep -v "^#" "$CREDENTIALS_FILE" | grep ":")

            # Secure the credentials file
            chmod 600 "$CREDENTIALS_FILE"

            success "Passwords saved to: $CREDENTIALS_FILE"
            warn "IMPORTANT: Store passwords in a password manager and delete the credentials file!"
        else
            error "Failed to extract passwords from role creation output"
        fi
    else
        error "Failed to create secure roles"
        cat "$temp_output"
        rm -f "$temp_output"
        exit 1
    fi

    rm -f "$temp_output"
}

# Execute SQL file with error handling
execute_sql_file() {
    local sql_file="$1"
    local description="$2"

    log "Executing: $description"

    if [ ! -f "$sql_file" ]; then
        error "SQL file not found: $sql_file"
        return 1
    fi

    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$sql_file"; then
        success "Completed: $description"
    else
        error "Failed: $description"
        return 1
    fi
}

# Test role authentication
test_role_authentication() {
    log "Testing role authentication..."

    if [ ! -f "$CREDENTIALS_FILE" ]; then
        error "Credentials file not found. Cannot test authentication."
        return 1
    fi

    # Extract admin password for testing
    local admin_password=$(grep "shadowcheck_admin:" "$CREDENTIALS_FILE" | cut -d' ' -f2)

    if [ -z "$admin_password" ]; then
        error "Could not extract admin password for testing"
        return 1
    fi

    # Test admin connection
    if PGPASSWORD="$admin_password" psql -h "$DB_HOST" -p "$DB_PORT" -U "shadowcheck_admin" -d "$DB_NAME" -c "SELECT 'Admin authentication successful';" &>/dev/null; then
        success "Role authentication test passed"
    else
        error "Role authentication test failed"
        return 1
    fi
}

# Generate connection examples
generate_connection_examples() {
    log "Generating connection examples..."

    local examples_file="$CREDENTIALS_DIR/connection_examples.txt"

    cat > "$examples_file" << 'EOF'
# ShadowCheck Database Connection Examples

## Command Line (psql)
# Admin access:
psql postgresql://shadowcheck_admin:PASSWORD@127.0.0.1:5432/shadowcheck

# Analyst access:
psql postgresql://shadowcheck_analyst:PASSWORD@127.0.0.1:5432/shadowcheck

# Read-only access:
psql postgresql://shadowcheck_readonly:PASSWORD@127.0.0.1:5432/shadowcheck

## Application Configuration
# Example environment variables:
export SHADOWCHECK_DB_URL="postgresql://shadowcheck_api:PASSWORD@127.0.0.1:5432/shadowcheck"
export SHADOWCHECK_DB_HOST="127.0.0.1"
export SHADOWCHECK_DB_PORT="5432"
export SHADOWCHECK_DB_NAME="shadowcheck"
export SHADOWCHECK_DB_USER="shadowcheck_api"
export SHADOWCHECK_DB_PASSWORD="PASSWORD"

## Python Connection Example
import psycopg2
conn = psycopg2.connect(
    host="127.0.0.1",
    port="5432",
    database="shadowcheck",
    user="shadowcheck_api",
    password="PASSWORD"
)

## Test Queries by Role

### Admin Tests
SELECT COUNT(*) FROM app.security_incidents;
SELECT * FROM app.role_credentials;  -- Only admin can see this

### Analyst Tests
INSERT INTO app.security_incidents (incident_type, threat_level) VALUES ('test', 'low');
SELECT * FROM app.wireless_access_points LIMIT 5;

### User Tests
SELECT COUNT(*) FROM app.wireless_access_points;
SELECT * FROM app.signal_measurements WHERE measurement_timestamp > NOW() - INTERVAL '1 day';

### Read-only Tests
SELECT COUNT(*) FROM app.wireless_access_points;
-- The following should fail:
INSERT INTO app.wireless_access_points (mac_address, radio_technology) VALUES ('test', 'wifi_2_4_ghz');

## Password Rotation
# Connect as admin and run:
SELECT app.rotate_role_password('shadowcheck_analyst');

## Password Expiry Check
# Connect as admin and run:
SELECT * FROM app.password_expiry_status;
EOF

    chmod 600 "$examples_file"
    success "Connection examples saved to: $examples_file"
}

# Verify deployment
verify_deployment() {
    log "Verifying secure deployment..."

    # Check if core tables exist
    local tables=("wireless_access_points" "signal_measurements" "position_measurements" "role_credentials")

    for table in "${tables[@]}"; do
        local exists=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = '$table');" | tr -d ' ')

        if [ "$exists" = "t" ]; then
            success "Table app.$table exists"
        else
            error "Table app.$table not found"
            return 1
        fi
    done

    # Check if roles exist
    local roles=("shadowcheck_admin" "shadowcheck_analyst" "shadowcheck_user" "shadowcheck_readonly" "shadowcheck_api")

    for role in "${roles[@]}"; do
        local exists=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = '$role');" | tr -d ' ')

        if [ "$exists" = "t" ]; then
            success "Role $role exists"
        else
            error "Role $role not found"
            return 1
        fi
    done

    # Check SCRAM-SHA-256 authentication
    local auth_method=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SHOW password_encryption;" | tr -d ' ')

    if [ "$auth_method" = "scram-sha-256" ]; then
        success "SCRAM-SHA-256 authentication enabled"
    else
        warn "Password encryption method: $auth_method (should be scram-sha-256)"
    fi
}

# Generate deployment summary
generate_summary() {
    log "Generating deployment summary..."

    local summary_file="deployment_summary_secure_$(date +%Y%m%d_%H%M%S).txt"

    cat > "$summary_file" << EOF
ShadowCheck Secure Database Deployment Summary
==============================================
Deployment Time: $(date)
Database: $DB_NAME
Host: $DB_HOST:$DB_PORT

Security Features:
✓ SCRAM-SHA-256 authentication
✓ Auto-generated secure passwords (32-40 characters)
✓ Localhost-only binding (127.0.0.1)
✓ Row-level security policies
✓ Role-based access control
✓ Password rotation capabilities
✓ Connection and query logging
✓ Resource limits per role

Created Roles:
- shadowcheck_admin: Full database administrator
- shadowcheck_analyst: Security analyst with operational access
- shadowcheck_user: Standard user with limited write access
- shadowcheck_readonly: Read-only access for reporting
- shadowcheck_api: Application API access
- shadowcheck_emergency: Emergency access (disabled by default)

Credentials Location: $CREDENTIALS_FILE
Connection Examples: $CREDENTIALS_DIR/connection_examples.txt

Schema Information:
- Total Tables: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'app';" | tr -d ' ')
- Total Functions: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'app';" | tr -d ' ')

Security Recommendations:
1. Store passwords in a password manager
2. Delete credentials file after copying passwords
3. Set up password rotation schedule (90 days)
4. Monitor password expiry with: SELECT * FROM app.password_expiry_status;
5. Enable emergency account only when needed: ALTER ROLE shadowcheck_emergency LOGIN;

Next Steps:
1. Copy passwords to secure password manager
2. Test role connections using examples
3. Set up monitoring and alerting
4. Configure backup procedures
5. Review security policies regularly

EOF

    success "Summary generated: $summary_file"
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "  ShadowCheck Secure Database Deployment"
    echo "=================================================="
    echo -e "${NC}"

    setup_secure_directories
    check_database
    deploy_schema
    deploy_secure_roles
    test_role_authentication
    generate_connection_examples
    verify_deployment
    generate_summary

    echo
    success "ShadowCheck secure database deployment completed!"
    echo
    warn "IMPORTANT SECURITY STEPS:"
    echo "1. Copy passwords from: $CREDENTIALS_FILE"
    echo "2. Store passwords in a secure password manager"
    echo "3. Delete the credentials file: rm -f $CREDENTIALS_FILE"
    echo "4. Review connection examples in: $CREDENTIALS_DIR/connection_examples.txt"
    echo
    log "Emergency account is DISABLED by default. Enable only when needed:"
    echo "  ALTER ROLE shadowcheck_emergency LOGIN;"
    echo
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_database
        ;;
    "roles-only")
        check_database
        deploy_secure_roles
        generate_connection_examples
        ;;
    "test-auth")
        test_role_authentication
        ;;
    *)
        main
        ;;
esac