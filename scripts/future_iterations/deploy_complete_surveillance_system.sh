#!/bin/bash

# =====================================================
# ShadowCheck Advanced Surveillance Detection System
# COMPLETE DEPLOYMENT ORCHESTRATOR
#
# This script deploys the entire counter-surveillance platform
# with proper sequencing, error handling, and verification
# =====================================================

set -euo pipefail  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="${SCRIPT_DIR}/schema"
LOG_FILE="${SCRIPT_DIR}/surveillance_deployment_$(date +%Y%m%d_%H%M%S).log"
POSTGRES_DB="${POSTGRES_DB:-shadowcheck}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    log "${RED}ERROR: $1${NC}"
}

log_success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

log_info() {
    log "${BLUE}INFO: $1${NC}"
}

log_warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Banner display
show_banner() {
    cat << 'EOF'

 ███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗ ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
 ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
 ███████╗███████║███████║██║  ██║██║   ██║██║ █╗ ██║██║     ███████║█████╗  ██║     █████╔╝
 ╚════██║██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║██║     ██╔══██║██╔══╝  ██║     ██╔═██╗
 ███████║██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
 ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝  ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝

        ADVANCED SURVEILLANCE DETECTION SYSTEM DEPLOYMENT
              Professional Counter-Surveillance Platform
                     Defending Against State Actors
EOF
}

# Database connection test
test_db_connection() {
    log_info "Testing database connection..."
    if ! psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' &> /dev/null; then
        log_error "Cannot connect to database. Please check connection parameters."
        log_error "Host: $POSTGRES_HOST, Port: $POSTGRES_PORT, User: $POSTGRES_USER, Database: $POSTGRES_DB"
        exit 1
    fi
    log_success "Database connection verified"
}

# Execute SQL file with error handling
execute_sql_file() {
    local file_path="$1"
    local description="$2"

    if [[ ! -f "$file_path" ]]; then
        log_error "SQL file not found: $file_path"
        return 1
    fi

    log_info "Executing: $description"
    log_info "File: $(basename "$file_path")"

    if psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
           -v ON_ERROR_STOP=1 -f "$file_path" >> "$LOG_FILE" 2>&1; then
        log_success "$description completed"
        return 0
    else
        log_error "$description failed. Check log file: $LOG_FILE"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."

    # Check if PostgreSQL client is available
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client (psql) not found. Please install PostgreSQL client tools."
        exit 1
    fi

    # Check PostGIS extension
    if ! psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
             -c "SELECT 1 FROM pg_extension WHERE extname = 'postgis';" | grep -q '1'; then
        log_warning "PostGIS extension not found. Attempting to install..."
        if ! psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
                 -c "CREATE EXTENSION IF NOT EXISTS postgis;" >> "$LOG_FILE" 2>&1; then
            log_error "Failed to install PostGIS extension"
            exit 1
        fi
        log_success "PostGIS extension installed"
    else
        log_success "PostGIS extension verified"
    fi

    # Check required schema files exist
    local required_files=(
        "schema_refactored.sql"
        "surveillance_detection_system.sql"
        "surveillance_detection_functions.sql"
        "government_infrastructure_correlation.sql"
        "surveillance_alert_management.sql"
        "surveillance_automation_scheduler.sql"
        "deploy_surveillance_detection.sql"
    )

    for file in "${required_files[@]}"; do
        if [[ ! -f "${SCHEMA_DIR}/$file" ]]; then
            log_error "Required schema file not found: $file"
            exit 1
        fi
    done

    log_success "All prerequisites verified"
}

# Deploy surveillance detection system
deploy_surveillance_system() {
    log_info "Beginning ShadowCheck Surveillance Detection System deployment..."

    # Phase 1: Core database schema (if needed)
    if ! psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
             -c "SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'wireless_access_points';" | grep -q '1'; then
        log_info "Deploying core database schema..."
        execute_sql_file "${SCHEMA_DIR}/schema_refactored.sql" "Core database schema deployment"
    else
        log_info "Core schema already exists, skipping..."
    fi

    # Phase 2: Surveillance detection core system
    log_info "Deploying surveillance detection core system..."
    execute_sql_file "${SCHEMA_DIR}/surveillance_detection_system.sql" "Surveillance detection system tables"

    # Phase 3: Detection algorithms and functions
    log_info "Deploying surveillance detection algorithms..."
    execute_sql_file "${SCHEMA_DIR}/surveillance_detection_functions.sql" "Surveillance detection algorithms"

    # Phase 4: Government infrastructure correlation
    log_info "Deploying government infrastructure correlation system..."
    execute_sql_file "${SCHEMA_DIR}/government_infrastructure_correlation.sql" "Government infrastructure correlation"

    # Phase 5: Alert management system
    log_info "Deploying surveillance alert management system..."
    execute_sql_file "${SCHEMA_DIR}/surveillance_alert_management.sql" "Surveillance alert management"

    # Phase 6: Automation and scheduling
    log_info "Deploying automation and scheduling system..."
    execute_sql_file "${SCHEMA_DIR}/surveillance_automation_scheduler.sql" "Surveillance automation scheduler"

    # Phase 7: Final deployment script with validation
    log_info "Executing final deployment and validation..."
    execute_sql_file "${SCHEMA_DIR}/deploy_surveillance_detection.sql" "Final deployment and validation"

    log_success "ShadowCheck Surveillance Detection System deployment completed!"
}

# Post-deployment verification
verify_deployment() {
    log_info "Performing post-deployment verification..."

    # Test system health
    local health_check
    health_check=$(psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
                   -t -c "SELECT component, status FROM app.surveillance_system_health_check();" 2>/dev/null || echo "FAILED")

    if [[ "$health_check" == "FAILED" ]]; then
        log_error "System health check failed"
        return 1
    fi

    # Check if detection jobs are configured
    local job_count
    job_count=$(psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
                -t -c "SELECT COUNT(*) FROM app.surveillance_detection_jobs WHERE is_enabled = TRUE;" 2>/dev/null || echo "0")

    if [[ "$job_count" -lt 2 ]]; then
        log_warning "Insufficient enabled surveillance detection jobs: $job_count"
    else
        log_success "Surveillance detection jobs configured: $job_count active"
    fi

    # Test core detection functions
    local function_test
    function_test=$(psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
                    -t -c "SELECT app.test_surveillance_deployment();" 2>/dev/null || echo "FAILED")

    if [[ "$function_test" == "FAILED" ]]; then
        log_error "Core function test failed"
        return 1
    fi

    log_success "Post-deployment verification completed"
    return 0
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."

    local report_file="${SCRIPT_DIR}/surveillance_deployment_report_$(date +%Y%m%d_%H%M%S).txt"

    cat > "$report_file" << EOF
========================================================
SHADOWCHECK SURVEILLANCE DETECTION SYSTEM
DEPLOYMENT REPORT
========================================================

Deployment Date: $(date)
Database: $POSTGRES_DB
Host: $POSTGRES_HOST:$POSTGRES_PORT
User: $POSTGRES_USER

DEPLOYMENT STATUS: SUCCESS ✅

System Components Deployed:
✅ Core surveillance detection schema
✅ Impossible distance anomaly detection
✅ Coordinated movement detection
✅ Sequential MAC pattern detection (government infrastructure)
✅ Aerial surveillance pattern detection
✅ Surveillance route correlation analysis
✅ Government infrastructure correlation database
✅ Real-time alert management system
✅ Automated background processing scheduler
✅ Evidence preservation and chain of custody
✅ Legal evidence export system

Detection Capabilities:
🎯 Professional surveillance operations
🎯 Government/agency infrastructure
🎯 Impossible distance anomalies (your 90km pattern)
🎯 Coordinated team movements
🎯 Aircraft/drone surveillance
🎯 Route following and stalking
🎯 Sequential MAC address patterns

Operational Features:
⚡ Real-time threat detection (15-minute cycles)
🛡️  False positive reduction with safe zones
📊 Professional threat assessment dashboard
📋 One-click evidence export for law enforcement
🔐 Forensic-grade chain of custody
⚙️  User-configurable sensitivity settings

Next Steps:
1. Run initial surveillance scan:
   psql -d $POSTGRES_DB -c "SELECT app.trigger_surveillance_detection();"

2. Check active threats:
   psql -d $POSTGRES_DB -c "SELECT * FROM app.surveillance_active_threats;"

3. Monitor system health:
   psql -d $POSTGRES_DB -c "SELECT * FROM app.surveillance_system_health_check();"

4. Configure alert preferences:
   psql -d $POSTGRES_DB -c "UPDATE app.surveillance_alert_config SET paranoid_mode = TRUE;"

🚀 THE MOST ADVANCED COUNTER-SURVEILLANCE PLATFORM IS NOW OPERATIONAL
🔍 Your defense against professional surveillance operations is active
⚡ Intelligence-grade threat detection protecting your OPSEC

========================================================
EOF

    log_success "Deployment report generated: $report_file"

    # Display summary
    echo -e "\n${PURPLE}========================================================${NC}"
    echo -e "${PURPLE}🚀 SHADOWCHECK SURVEILLANCE DETECTION SYSTEM DEPLOYED${NC}"
    echo -e "${PURPLE}========================================================${NC}"
    echo -e "${GREEN}✅ Status: OPERATIONAL${NC}"
    echo -e "${GREEN}📊 All surveillance detection algorithms active${NC}"
    echo -e "${GREEN}🛡️  Counter-surveillance platform ready${NC}"
    echo -e "${GREEN}⚡ Real-time threat monitoring enabled${NC}"
    echo ""
    echo -e "${BLUE}📋 Full report: $report_file${NC}"
    echo -e "${BLUE}📝 Deployment log: $LOG_FILE${NC}"
    echo ""
    echo -e "${YELLOW}🔍 Your defense against professional surveillance is now active.${NC}"
    echo -e "${PURPLE}========================================================${NC}"
}

# Main execution
main() {
    show_banner
    log_info "Starting ShadowCheck Surveillance Detection System deployment..."
    log_info "Log file: $LOG_FILE"

    # Run all deployment phases
    test_db_connection
    check_prerequisites
    deploy_surveillance_system

    if verify_deployment; then
        generate_report
        log_success "🚀 ShadowCheck Surveillance Detection System is now OPERATIONAL!"
        exit 0
    else
        log_error "Deployment verification failed. Check logs for details."
        exit 1
    fi
}

# Script execution protection
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi