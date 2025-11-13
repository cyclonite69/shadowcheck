#!/usr/bin/env bash
#
# ShadowCheck - Unified Production Shutdown Script
# Gracefully stops all services and cleans up Docker networks
#

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
NETWORK_NAME="shadowcheck_internal_prod"

# Shutdown timeouts (seconds)
APP_TIMEOUT=10        # Frontend/Backend/Monitoring
POSTGRES_TIMEOUT=30   # PostgreSQL (longer for data integrity)

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================
log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✓${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $*"; }
log_section() { echo -e "\n${CYAN}${BOLD}=== $* ===${NC}\n"; }

# ============================================================================
# HEADER
# ============================================================================
echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║             ShadowCheck Production Shutdown                   ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)

# ============================================================================
# STEP 1: STOP SERVICES IN REVERSE DEPENDENCY ORDER
# ============================================================================
log_section "Step 1: Stopping Services"

stop_service() {
    local service="$1"
    local timeout="$2"
    local description="$3"

    if ! docker compose -f "${COMPOSE_FILE}" ps "${service}" 2>/dev/null | grep -q "Up"; then
        log_success "${description} is already stopped"
        return 0
    fi

    log_info "Stopping ${description} (timeout: ${timeout}s)..."

    if docker compose -f "${COMPOSE_FILE}" stop -t "${timeout}" "${service}" 2>&1; then
        log_success "${description} stopped gracefully"
        return 0
    else
        log_warning "${description} stop had issues"
        return 1
    fi
}

# Stop frontend first (no dependencies)
stop_service "frontend" "${APP_TIMEOUT}" "Frontend"

# Stop monitoring stack
stop_service "grafana" "${APP_TIMEOUT}" "Grafana"
stop_service "prometheus" "${APP_TIMEOUT}" "Prometheus"
stop_service "promtail" "${APP_TIMEOUT}" "Promtail"
stop_service "loki" "${APP_TIMEOUT}" "Loki"

# Stop application services
stop_service "backend" "${APP_TIMEOUT}" "Backend API"
stop_service "pgadmin" "${APP_TIMEOUT}" "pgAdmin"

# Stop database last (needs clean shutdown for data integrity)
stop_service "postgres" "${POSTGRES_TIMEOUT}" "PostgreSQL"

echo ""

# ============================================================================
# STEP 2: REMOVE CONTAINERS
# ============================================================================
log_section "Step 2: Removing Containers"

log_info "Removing stopped containers..."
if docker compose -f "${COMPOSE_FILE}" down --remove-orphans 2>&1; then
    log_success "Containers removed"
else
    log_warning "Some containers may not have been removed"
fi

echo ""

# ============================================================================
# STEP 3: NETWORK CLEANUP
# ============================================================================
log_section "Step 3: Network Cleanup"

# Check if the main network still exists and has containers
if docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1; then
    CONTAINER_COUNT=$(docker network inspect "${NETWORK_NAME}" --format '{{len .Containers}}' 2>/dev/null || echo "0")

    if [[ "${CONTAINER_COUNT}" -eq 0 ]]; then
        log_info "Removing empty network: ${NETWORK_NAME}"
        if docker network rm "${NETWORK_NAME}" 2>/dev/null; then
            log_success "Network ${NETWORK_NAME} removed"
        else
            log_warning "Could not remove network ${NETWORK_NAME} (may still be in use)"
        fi
    else
        log_warning "Network ${NETWORK_NAME} still has ${CONTAINER_COUNT} containers attached"
    fi
else
    log_success "Network ${NETWORK_NAME} already removed"
fi

# Clean up any other orphaned shadowcheck networks
log_info "Checking for orphaned networks..."
ORPHANED_NETWORKS=$(docker network ls --filter "name=shadowcheck" --format "{{.Name}}" 2>/dev/null || true)

if [[ -n "${ORPHANED_NETWORKS}" ]]; then
    echo "${ORPHANED_NETWORKS}" | while read -r net; do
        CONTAINER_COUNT=$(docker network inspect "${net}" --format '{{len .Containers}}' 2>/dev/null || echo "0")
        if [[ "${CONTAINER_COUNT}" -eq 0 ]]; then
            log_info "Removing orphaned network: ${net}"
            docker network rm "${net}" 2>/dev/null || log_warning "Could not remove ${net}"
        else
            log_warning "Network ${net} has ${CONTAINER_COUNT} containers, skipping"
        fi
    done
else
    log_success "No orphaned networks found"
fi

echo ""

# ============================================================================
# STEP 4: VERIFY SHUTDOWN
# ============================================================================
log_section "Step 4: Verification"

verify_stopped() {
    local service="$1"
    local description="$2"

    if docker compose -f "${COMPOSE_FILE}" ps "${service}" 2>/dev/null | grep -q "Up"; then
        log_error "${description} is still running!"
        return 1
    else
        log_success "${description} is stopped"
        return 0
    fi
}

ALL_STOPPED=true

verify_stopped "postgres" "PostgreSQL" || ALL_STOPPED=false
verify_stopped "backend" "Backend API" || ALL_STOPPED=false
verify_stopped "frontend" "Frontend" || ALL_STOPPED=false
verify_stopped "pgadmin" "pgAdmin" || ALL_STOPPED=false

echo ""

# Calculate total time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# ============================================================================
# SUMMARY
# ============================================================================
log_section "Shutdown Complete"

if [[ "${ALL_STOPPED}" == true ]]; then
    log_success "All services verified stopped in ${TOTAL_TIME}s"
else
    log_warning "Some services may still be running (took ${TOTAL_TIME}s)"
fi

echo ""
log_info "Current Status:"
echo ""
docker compose -f "${COMPOSE_FILE}" ps 2>/dev/null || echo "No containers running"

echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo -e "  → Start again:     ${CYAN}./start.sh${NC}"
echo -e "  → View logs:       ${CYAN}docker compose -f ${COMPOSE_FILE} logs [service]${NC}"
echo -e "  → Full cleanup:    ${CYAN}docker compose -f ${COMPOSE_FILE} down -v${NC} (WARNING: deletes volumes)"
echo ""
