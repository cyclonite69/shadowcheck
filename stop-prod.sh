#!/usr/bin/env bash
#
# ShadowCheck - Production Shutdown Script
# Stops postgres, backend, frontend, and pgadmin containers
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

# Shutdown timeouts (seconds)
APP_TIMEOUT=10        # Frontend/Backend
POSTGRES_TIMEOUT=30   # PostgreSQL (longer for data integrity)
PGADMIN_TIMEOUT=10    # pgAdmin

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"

log_info() {
  echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
  echo -e "${GREEN}✓${NC} $*"
}

log_error() {
  echo -e "${RED}✗${NC} $*"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $*"
}

stop_service() {
  local service="$1"
  local timeout="$2"
  local description="$3"

  if ! docker-compose -f "${COMPOSE_FILE}" ps | grep -q "${service}.*Up"; then
    log_success "${description} is already stopped"
    return 0
  fi

  log_info "Stopping ${description} (timeout: ${timeout}s)..."

  if docker-compose -f "${COMPOSE_FILE}" stop -t "${timeout}" "${service}" 2>&1; then
    log_success "${description} stopped gracefully"
    return 0
  else
    log_warning "${description} stop had issues"
    return 1
  fi
}

verify_stopped() {
  local service="$1"
  local description="$2"

  if docker-compose -f "${COMPOSE_FILE}" ps | grep -q "${service}.*Up"; then
    log_error "${description} is still running!"
    return 1
  else
    log_success "${description} is stopped"
    return 0
  fi
}

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║             ShadowCheck Production Shutdown                   ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)

# Step 1: Stop frontend (UI layer)
log_info "Step 1: Stopping frontend..."
echo ""
stop_service "frontend" "${APP_TIMEOUT}" "Frontend"
echo ""

# Step 2: Stop backend (API layer)
log_info "Step 2: Stopping backend..."
echo ""
stop_service "backend" "${APP_TIMEOUT}" "Backend API"
echo ""

# Step 3: Stop pgAdmin (management tool)
log_info "Step 3: Stopping pgAdmin..."
echo ""
stop_service "pgadmin" "${PGADMIN_TIMEOUT}" "pgAdmin"
echo ""

# Step 4: Stop PostgreSQL (last, needs clean shutdown)
log_info "Step 4: Stopping PostgreSQL (ensuring data integrity)..."
echo ""
stop_service "postgres" "${POSTGRES_TIMEOUT}" "PostgreSQL"
echo ""

# Calculate total time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

log_success "All services stopped in ${TOTAL_TIME}s"
echo ""

# Verify everything is stopped
log_info "Verifying shutdown..."
echo ""

ALL_STOPPED=true

verify_stopped "frontend" "Frontend" || ALL_STOPPED=false
verify_stopped "backend" "Backend API" || ALL_STOPPED=false
verify_stopped "pgadmin" "pgAdmin" || ALL_STOPPED=false
verify_stopped "postgres" "PostgreSQL" || ALL_STOPPED=false

echo ""

if [[ "${ALL_STOPPED}" == true ]]; then
  log_success "All services verified stopped"
else
  log_warning "Some services may still be running"
fi

echo ""
log_info "Final Status:"
echo ""
docker-compose -f "${COMPOSE_FILE}" ps postgres backend frontend pgadmin

echo ""
log_success "Shutdown complete!"
echo ""
echo -e "${BOLD}Control:${NC}"
echo -e "  → Start again:  ${CYAN}./start-prod.sh${NC}"
echo -e "  → Full cleanup: ${CYAN}docker-compose -f ${COMPOSE_FILE} down${NC}"
echo -e "  → View logs:    ${CYAN}docker-compose -f ${COMPOSE_FILE} logs [service]${NC}"
echo ""
