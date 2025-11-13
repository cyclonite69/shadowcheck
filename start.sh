#!/usr/bin/env bash
#
# ShadowCheck - Startup Script with Health Checks
# Starts all services via docker-compose with proper health validation
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

# Timeouts (seconds)
POSTGRES_TIMEOUT=60
BACKEND_TIMEOUT=30
LOKI_TIMEOUT=30
PROMETHEUS_TIMEOUT=30
GRAFANA_TIMEOUT=30

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

wait_for_http() {
  local url="$1"
  local service="$2"
  local timeout="$3"
  local elapsed=0

  log_info "Waiting for ${service} at ${url} (timeout: ${timeout}s)..."

  while [[ ${elapsed} -lt ${timeout} ]]; do
    if curl -sf "${url}" >/dev/null 2>&1; then
      log_success "${service} is ready (${elapsed}s)"
      return 0
    fi

    echo -ne "${YELLOW}⏳${NC} ${service}... ${elapsed}/${timeout}s\r"
    sleep 2
    elapsed=$((elapsed + 2))
  done

  log_error "${service} failed to become ready after ${timeout}s"
  return 1
}

wait_for_postgres() {
  local timeout="${POSTGRES_TIMEOUT}"
  local elapsed=0

  log_info "Waiting for PostgreSQL (timeout: ${timeout}s)..."

  while [[ ${elapsed} -lt ${timeout} ]]; do
    if docker exec shadowcheck_postgres_18 pg_isready -U shadowcheck_user -d shadowcheck >/dev/null 2>&1; then
      log_success "PostgreSQL is ready (${elapsed}s)"
      return 0
    fi

    echo -ne "${YELLOW}⏳${NC} PostgreSQL... ${elapsed}/${timeout}s\r"
    sleep 2
    elapsed=$((elapsed + 2))
  done

  log_error "PostgreSQL failed to become ready after ${timeout}s"
  return 1
}

wait_for_container() {
  local container="$1"
  local service="$2"
  local timeout="${3:-30}"
  local elapsed=0

  log_info "Waiting for ${service} container..."

  while [[ ${elapsed} -lt ${timeout} ]]; do
    if docker ps --filter "name=${container}" --filter "status=running" | grep -q "${container}"; then
      log_success "${service} container is running (${elapsed}s)"
      return 0
    fi

    echo -ne "${YELLOW}⏳${NC} ${service}... ${elapsed}/${timeout}s\r"
    sleep 2
    elapsed=$((elapsed + 2))
  done

  log_error "${service} container failed to start after ${timeout}s"
  return 1
}

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║                    ShadowCheck Startup                        ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)

# Step 1: Start infrastructure services
log_info "Step 1: Starting infrastructure services..."
echo ""

if ! docker-compose up -d postgres loki; then
    log_error "Failed to start infrastructure"
    exit 1
fi

# Wait for PostgreSQL
wait_for_postgres || exit 1
echo ""

# Wait for Loki
wait_for_http "http://localhost:3100/ready" "Loki" "${LOKI_TIMEOUT}" || log_warning "Loki health check failed"
echo ""

# Step 2: Start monitoring services
log_info "Step 2: Starting monitoring services..."
echo ""

if ! docker-compose up -d promtail prometheus grafana; then
    log_error "Failed to start monitoring services"
    exit 1
fi

# Wait for Prometheus
wait_for_http "http://localhost:9091/-/healthy" "Prometheus" "${PROMETHEUS_TIMEOUT}" || log_warning "Prometheus health check failed"
echo ""

# Wait for Grafana
wait_for_http "http://localhost:3000/api/health" "Grafana" "${GRAFANA_TIMEOUT}" || log_warning "Grafana health check failed"
echo ""

# Step 3: Start application services
log_info "Step 3: Starting application services..."
echo ""

if ! docker-compose up -d backend pgadmin; then
    log_error "Failed to start application services"
    exit 1
fi

# Wait for Backend
wait_for_http "http://localhost:5000/api/v1/health" "Backend API" "${BACKEND_TIMEOUT}" || exit 1
echo ""

# Wait for pgAdmin container
wait_for_container "shadowcheck_pgadmin" "pgAdmin" 20 || log_warning "pgAdmin health check failed"
echo ""

# Step 4: Start frontend
log_info "Step 4: Starting frontend..."
echo ""

if ! docker-compose up -d frontend; then
    log_error "Failed to start frontend"
    exit 1
fi

wait_for_http "http://localhost:3001" "Frontend" 30 || log_warning "Frontend health check failed"
echo ""

# Calculate total time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

log_success "All services started in ${TOTAL_TIME}s"
echo ""

# Show final status
log_info "Service Status:"
echo ""
docker-compose ps

echo ""
echo -e "${BOLD}${GREEN}Available Services:${NC}"
echo -e "  ${GREEN}●${NC} PostgreSQL Database  → localhost:5432"
echo -e "  ${GREEN}●${NC} Backend API          → ${CYAN}http://localhost:5000${NC}"
echo -e "  ${GREEN}●${NC} Backend Health       → ${CYAN}http://localhost:5000/api/v1/health${NC}"
echo -e "  ${GREEN}●${NC} Frontend Dashboard   → ${CYAN}http://localhost:3001${NC}"
echo -e "  ${GREEN}●${NC} pgAdmin              → ${CYAN}http://localhost:8080${NC} (admin@shadowcheck.local / admin123)"
echo -e "  ${GREEN}●${NC} Grafana              → ${CYAN}http://localhost:3000${NC} (admin / admin)"
echo -e "  ${GREEN}●${NC} Prometheus           → ${CYAN}http://localhost:9091${NC}"
echo -e "  ${GREEN}●${NC} Loki                 → ${CYAN}http://localhost:3100${NC}"
echo ""
echo -e "${BOLD}Control:${NC}"
echo -e "  → Stop all:    ${CYAN}./stop.sh${NC}"
echo -e "  → Restart all: ${CYAN}./restart.sh${NC}"
echo -e "  → View logs:   ${CYAN}docker-compose logs -f [service]${NC}"
echo ""
