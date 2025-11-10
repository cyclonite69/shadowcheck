#!/usr/bin/env bash
#
# ShadowCheck - Unified Production Startup Script
# Handles network cleanup, service startup, and health verification
#

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
NETWORK_NAME="shadowcheck_internal_prod"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT="${BACKEND_PORT:-5000}"

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
echo -e "${CYAN}${BOLD}║              ShadowCheck Production Startup                   ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)

# ============================================================================
# STEP 1: NETWORK CLEANUP & PREPARATION
# ============================================================================
log_section "Step 1: Network Preparation"

# Check for orphaned networks and clean them up
log_info "Checking for orphaned Docker networks..."
ORPHANED_NETWORKS=$(docker network ls --filter "name=shadowcheck" --format "{{.Name}}" | grep -v "^${NETWORK_NAME}$" || true)

if [[ -n "${ORPHANED_NETWORKS}" ]]; then
    log_warning "Found orphaned networks, cleaning up..."
    echo "${ORPHANED_NETWORKS}" | while read -r net; do
        # Check if network has any containers
        CONTAINER_COUNT=$(docker network inspect "${net}" --format '{{len .Containers}}' 2>/dev/null || echo "0")
        if [[ "${CONTAINER_COUNT}" -eq 0 ]]; then
            log_info "Removing orphaned network: ${net}"
            docker network rm "${net}" 2>/dev/null || log_warning "Could not remove ${net}"
        else
            log_warning "Network ${net} has ${CONTAINER_COUNT} containers, skipping removal"
        fi
    done
else
    log_success "No orphaned networks found"
fi

# Verify the main network exists (Docker Compose will create it if needed)
if docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1; then
    log_success "Network ${NETWORK_NAME} exists"

    # Verify bridge interface has IP
    BRIDGE_ID=$(docker network inspect "${NETWORK_NAME}" --format '{{.Id}}' | cut -c1-12)
    BRIDGE_IFACE="br-${BRIDGE_ID}"
    GATEWAY=$(docker network inspect "${NETWORK_NAME}" --format='{{range .IPAM.Config}}{{.Gateway}}{{end}}')

    if ip addr show "${BRIDGE_IFACE}" 2>/dev/null | grep -q "inet ${GATEWAY}"; then
        log_success "Bridge ${BRIDGE_IFACE} has IP ${GATEWAY}"
    else
        log_warning "Bridge interface may need configuration"
    fi
else
    log_info "Network ${NETWORK_NAME} will be created by Docker Compose"
fi

echo ""

# ============================================================================
# STEP 2: START SERVICES
# ============================================================================
log_section "Step 2: Starting Services"

log_info "Starting all services with Docker Compose..."
echo ""

if docker compose -f "${COMPOSE_FILE}" up -d; then
    log_success "Docker Compose started successfully"
else
    log_error "Docker Compose failed to start"
    exit 1
fi

echo ""

# ============================================================================
# STEP 3: WAIT FOR SERVICES TO BE HEALTHY
# ============================================================================
log_section "Step 3: Waiting for Services"

# Function to wait for Docker health check to pass
wait_for_healthy() {
    local service="$1"
    local timeout="${2:-60}"
    local elapsed=0

    while [[ ${elapsed} -lt ${timeout} ]]; do
        local health_status=$(docker compose -f "${COMPOSE_FILE}" ps -q "${service}" 2>/dev/null | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")

        # If service has no health check, verify it's running
        if [[ "${health_status}" == "none" ]]; then
            local running_status=$(docker compose -f "${COMPOSE_FILE}" ps -q "${service}" 2>/dev/null | xargs docker inspect --format='{{.State.Status}}' 2>/dev/null || echo "")
            if [[ "${running_status}" == "running" ]]; then
                log_success "${service} is running (${elapsed}s)"
                return 0
            fi
        elif [[ "${health_status}" == "healthy" ]]; then
            log_success "${service} is healthy (${elapsed}s)"
            return 0
        fi

        echo -ne "${YELLOW}⏳${NC} ${service}... ${elapsed}/${timeout}s (status: ${health_status})       \r"
        sleep 2
        elapsed=$((elapsed + 2))
    done

    log_error "${service} failed to become healthy after ${timeout}s"
    return 1
}

# Wait for each critical service in dependency order
log_info "Waiting for PostgreSQL..."
wait_for_healthy "postgres" 60 || exit 1

log_info "Waiting for Backend API..."
wait_for_healthy "backend" 60 || exit 1

log_info "Waiting for Frontend..."
wait_for_healthy "frontend" 30 || log_warning "Frontend may still be starting"

log_info "Waiting for pgAdmin..."
wait_for_healthy "pgadmin" 30 || log_warning "pgAdmin may still be starting"

echo ""

# ============================================================================
# STEP 4: VERIFY NETWORK CONNECTIVITY
# ============================================================================
log_section "Step 4: Network Connectivity Check"

# Get bridge gateway IP for backend access
BRIDGE_GATEWAY=$(docker network inspect "${NETWORK_NAME}" --format='{{range .IPAM.Config}}{{.Gateway}}{{end}}' 2>/dev/null)
if [[ -z "${BRIDGE_GATEWAY}" ]]; then
    BRIDGE_GATEWAY="172.29.0.1"  # Default fallback
fi

# Test backend API via bridge (docker-proxy on localhost may not work)
if timeout 5 curl -sf http://${BRIDGE_GATEWAY}:${BACKEND_PORT}/api/v1/health >/dev/null 2>&1; then
    log_success "Backend API is reachable via bridge network (${BRIDGE_GATEWAY}:${BACKEND_PORT})"
else
    log_warning "Backend API not yet reachable"
fi

# Test frontend from host
if timeout 5 curl -sf http://localhost:${FRONTEND_PORT}/ >/dev/null 2>&1; then
    log_success "Frontend is reachable from host"
else
    log_warning "Frontend not yet reachable from host"
fi

echo ""

# ============================================================================
# STEP 5: STATUS SUMMARY
# ============================================================================
log_section "Startup Complete"

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

log_success "All services started in ${TOTAL_TIME}s"
echo ""

log_info "Container Status:"
echo ""
docker compose -f "${COMPOSE_FILE}" ps
echo ""

echo -e "${BOLD}${GREEN}Available Services:${NC}"
echo -e "  ${GREEN}●${NC} PostgreSQL Database  → localhost:5432"
echo -e "  ${GREEN}●${NC} Backend API          → ${CYAN}http://${BRIDGE_GATEWAY}:${BACKEND_PORT}${NC} ${YELLOW}(use bridge IP)${NC}"
echo -e "  ${GREEN}●${NC} Backend Health       → ${CYAN}http://${BRIDGE_GATEWAY}:${BACKEND_PORT}/api/v1/health${NC}"
echo -e "  ${GREEN}●${NC} Frontend Dashboard   → ${CYAN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  ${GREEN}●${NC} pgAdmin              → ${CYAN}http://localhost:8080${NC}"
echo -e "  ${GREEN}●${NC} Prometheus           → ${CYAN}http://localhost:9091${NC}"
echo -e "  ${GREEN}●${NC} Grafana              → ${CYAN}http://localhost:3000${NC}"
echo ""
echo -e "${BOLD}${YELLOW}Note:${NC} Backend API accessible via Docker bridge IP ${BRIDGE_GATEWAY}"
echo -e "      (docker-proxy localhost forwarding may not work on this system)"
echo ""

echo -e "${BOLD}Network Information:${NC}"
SUBNET=$(docker network inspect "${NETWORK_NAME}" --format='{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null || echo "N/A")
GATEWAY=$(docker network inspect "${NETWORK_NAME}" --format='{{range .IPAM.Config}}{{.Gateway}}{{end}}' 2>/dev/null || echo "N/A")
echo -e "  Network: ${NETWORK_NAME}"
echo -e "  Subnet:  ${SUBNET}"
echo -e "  Gateway: ${GATEWAY}"
echo ""

echo -e "${BOLD}Management Commands:${NC}"
echo -e "  → View logs:    ${CYAN}docker compose -f ${COMPOSE_FILE} logs -f [service]${NC}"
echo -e "  → Stop:         ${CYAN}./stop.sh${NC}"
echo -e "  → Restart:      ${CYAN}./restart.sh${NC}"
echo -e "  → Debug:        ${CYAN}./troubleshoot-network.sh${NC}"
echo ""
