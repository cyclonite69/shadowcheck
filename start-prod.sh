#!/usr/bin/env bash
#
# ShadowCheck - Production Startup Script
# Uses Docker Compose native health checks for reliability
#

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✓${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $*"; }

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║              ShadowCheck Production Startup                   ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)

# Start all services - Docker Compose handles dependencies via depends_on
log_info "Starting all services..."
echo ""
docker-compose -f "${COMPOSE_FILE}" up -d

# Wait for services using Docker's native health status
log_info "Waiting for services to become healthy..."
echo ""

# Function to wait for Docker health check to pass
wait_for_healthy() {
  local service="$1"
  local timeout="${2:-60}"
  local elapsed=0

  while [[ ${elapsed} -lt ${timeout} ]]; do
    local health_status=$(docker-compose -f "${COMPOSE_FILE}" ps -q "${service}" | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")

    # If service has no health check, verify it's running
    if [[ "${health_status}" == "none" ]]; then
      local running_status=$(docker-compose -f "${COMPOSE_FILE}" ps -q "${service}" | xargs docker inspect --format='{{.State.Status}}' 2>/dev/null || echo "")
      if [[ "${running_status}" == "running" ]]; then
        log_success "${service} is running (no health check defined)"
        return 0
      fi
    elif [[ "${health_status}" == "healthy" ]]; then
      log_success "${service} is healthy (${elapsed}s)"
      return 0
    fi

    echo -ne "${YELLOW}⏳${NC} ${service}... ${elapsed}/${timeout}s (status: ${health_status})\r"
    sleep 2
    elapsed=$((elapsed + 2))
  done

  log_error "${service} failed to become healthy after ${timeout}s"
  return 1
}

# Wait for each service in dependency order
log_info "Step 1: Waiting for PostgreSQL..."
wait_for_healthy "postgres" 60 || exit 1
echo ""

log_info "Step 2: Waiting for Backend API..."
wait_for_healthy "backend" 60 || exit 1
echo ""

log_info "Step 3: Waiting for pgAdmin..."
wait_for_healthy "pgadmin" 30 || log_warning "pgAdmin may still be starting (no health check)"
echo ""

log_info "Step 4: Waiting for Frontend..."
wait_for_healthy "frontend" 30 || log_warning "Frontend may still be starting"
echo ""

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
log_success "All services started in ${TOTAL_TIME}s"
echo ""

log_info "Service Status:"
echo ""
docker-compose -f "${COMPOSE_FILE}" ps
echo ""
echo -e "${BOLD}${GREEN}Available Services:${NC}"
echo -e "  ${GREEN}●${NC} PostgreSQL Database  → localhost:5432"
echo -e "  ${GREEN}●${NC} Backend API          → ${CYAN}http://127.0.0.1:5000${NC}"
echo -e "  ${GREEN}●${NC} Backend Health       → ${CYAN}http://127.0.0.1:5000/api/v1/health${NC}"
echo -e "  ${GREEN}●${NC} Frontend Dashboard   → ${CYAN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  ${GREEN}●${NC} pgAdmin              → ${CYAN}http://localhost:8080${NC}"
echo ""
echo -e "${BOLD}Management:${NC}"
echo -e "  → View logs:    ${CYAN}docker-compose -f ${COMPOSE_FILE} logs -f [service]${NC}"
echo -e "  → Stop:         ${CYAN}./stop-prod.sh${NC}"
echo -e "  → Restart:      ${CYAN}./restart-prod.sh${NC}"
echo ""
