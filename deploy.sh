#!/bin/bash
# ShadowCheck Database Deployment Script
# Deploys the refactored schema to PostgreSQL with PostGIS

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

# Check if PostgreSQL is available
check_database() {
    log "Checking database connection..."

    if ! command -v psql &> /dev/null; then
        error "psql command not found. Please install PostgreSQL client."
        exit 1
    fi

    # Try to connect to database
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
        success "Database connection successful"
    else
        error "Cannot connect to database. Please ensure PostgreSQL is running and credentials are correct."
        echo "Connection details:"
        echo "  Host: $DB_HOST"
        echo "  Port: $DB_PORT"
        echo "  Database: $DB_NAME"
        echo "  User: $DB_USER"
        exit 1
    fi
}

# Check PostGIS extension
check_postgis() {
    log "Checking PostGIS extension..."

    local has_postgis=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'postgis');" | tr -d ' ')

    if [ "$has_postgis" = "t" ]; then
        success "PostGIS extension is available"
        local postgis_version=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT PostGIS_Version();" | head -1 | tr -d ' ')
        log "PostGIS version: $postgis_version"
    else
        error "PostGIS extension not found. Please install PostGIS."
        exit 1
    fi
}

# Execute SQL file
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

# Backup existing schema
backup_schema() {
    log "Creating backup of existing schema..."

    local backup_file="shadowcheck_backup_$(date +%Y%m%d_%H%M%S).sql"

    if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --schema=app > "$backup_file"; then
        success "Schema backed up to: $backup_file"
    else
        warn "Backup failed, continuing anyway..."
    fi
}

# Deploy refactored schema
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

    # Apply additional optimizations
    if [ -f "schema/indexes.sql" ]; then
        execute_sql_file "schema/indexes.sql" "Performance Indexes"
    fi

    if [ -f "schema/roles.sql" ]; then
        execute_sql_file "schema/roles.sql" "Database Roles and Permissions"
    fi
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."

    # Check if core tables exist
    local tables=("wireless_access_points" "signal_measurements" "position_measurements" "oui_manufacturers")

    for table in "${tables[@]}"; do
        local exists=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = '$table');" | tr -d ' ')

        if [ "$exists" = "t" ]; then
            local count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM app.$table;" | tr -d ' ')
            success "Table app.$table exists with $count rows"
        else
            error "Table app.$table not found"
            return 1
        fi
    done

    # Test spatial functionality
    local spatial_test=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT ST_AsText(ST_Point(-122.4194, 37.7749));" | head -1)

    if [[ "$spatial_test" == *"POINT"* ]]; then
        success "PostGIS spatial queries working"
    else
        error "PostGIS spatial test failed"
        return 1
    fi
}

# Generate summary report
generate_summary() {
    log "Generating deployment summary..."

    local summary_file="deployment_summary_$(date +%Y%m%d_%H%M%S).txt"

    cat > "$summary_file" << EOF
ShadowCheck Database Deployment Summary
======================================
Deployment Time: $(date)
Database: $DB_NAME
Host: $DB_HOST:$DB_PORT
User: $DB_USER

Schema Information:
- Total Tables: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'app';" | tr -d ' ')
- Total Views: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'app';" | tr -d ' ')
- Total Functions: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'app';" | tr -d ' ')

Core Data Counts:
- Wireless Access Points: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM app.wireless_access_points;" | tr -d ' ')
- Signal Measurements: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM app.signal_measurements;" | tr -d ' ')
- Position Measurements: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM app.position_measurements;" | tr -d ' ')
- OUI Manufacturers: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM app.oui_manufacturers;" | tr -d ' ')

Key Features:
✓ PostGIS spatial capabilities
✓ Normalized 3NF schema design
✓ Signal strength measurements
✓ Geographic position tracking
✓ OUI manufacturer lookup
✓ Data source provenance
✓ Security incident detection framework
✓ Performance optimized indexes

Connection String:
postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

Next Steps:
1. Review the schema documentation in documentation.md
2. Test queries using the examples provided
3. Set up regular maintenance tasks
4. Configure monitoring and alerting

EOF

    success "Summary generated: $summary_file"
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    echo "========================================"
    echo "  ShadowCheck Database Deployment"
    echo "========================================"
    echo -e "${NC}"

    check_database
    check_postgis
    backup_schema
    deploy_schema
    verify_deployment
    generate_summary

    echo
    success "ShadowCheck database deployment completed successfully!"
    echo
    log "You can now connect to the database:"
    echo "  psql postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo
    log "Example queries:"
    echo "  SELECT COUNT(*) FROM app.wireless_access_points;"
    echo "  SELECT radio_technology, COUNT(*) FROM app.wireless_access_points GROUP BY radio_technology;"
    echo "  SELECT * FROM app.signal_measurements ORDER BY measurement_timestamp DESC LIMIT 10;"
    echo
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_database
        check_postgis
        ;;
    "backup")
        backup_schema
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        main
        ;;
esac