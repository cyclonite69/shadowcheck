#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

POSTGRES_TIMEOUT=60
BACKEND_TIMEOUT=30
FRONTEND_TIMEOUT=30
PGADMIN_TIMEOUT=20
COMPOSE_FILE="docker-compose.prod.yml"
DB_USER="${DB_USER:-shadowcheck_user}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✓${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $*"; }

wait_for_http() {
  local url="$1" service="$2" timeout="$3" elapsed=0
  log_info "Waiting for ${service} at ${url} (timeout: ${timeout}s)..."
  while [[ ${elapsed} -lt ${timeout} ]]; do
    if curl -sf "${url}" >/dev/null 2>&1 || wget --quiet --tries=1 --spider "${url}" >/dev/null 2>&1; then
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
  local timeout="${POSTGRES_TIMEOUT}" elapsed=0
  log_info "Waiting for PostgreSQL (timeout: ${timeout}s)..."
  while [[ ${elapsed} -lt ${timeout} ]]; do
    if docker exec shadowcheck_postgres_18 pg_isready -U "${DB_USER}" -d shadowcheck >/dev/null 2>&1; then
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
  local container="$1" service="$2" timeout="${3:-30}" elapsed=0
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
echo -e "${CYAN}${BOLD}║              ShadowCheck Production Startup                   ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)

# Step 1: Start PostgreSQL
log_info "Step 1: Starting PostgreSQL..."
echo ""
docker-compose -f "${COMPOSE_FILE}" up -d postgres || { log_error "Failed to start PostgreSQL"; exit 1; }
wait_for_postgres || exit 1
echo ""

# Step 2: Start Backend and pgAdmin
log_info "Step 2: Starting backend and pgAdmin..."
echo ""
docker-compose -f "${COMPOSE_FILE}" up -d backend pgadmin || { log_error "Failed to start backend/pgAdmin"; exit 1; }
wait_for_http "http://127.0.0.1:5000/api/v1/health" "Backend API" "${BACKEND_TIMEOUT}" || exit 1
echo ""
wait_for_container "shadowcheck_pgadmin" "pgAdmin" "${PGADMIN_TIMEOUT}" || log_warning "pgAdmin health check failed"
echo ""

# Step 3: Start Frontend
log_info "Step 3: Starting frontend..."
echo ""
docker-compose -f "${COMPOSE_FILE}" up -d frontend || { log_error "Failed to start frontend"; exit 1; }
wait_for_http "http://localhost:${FRONTEND_PORT}" "Frontend" "${FRONTEND_TIMEOUT}" || log_warning "Frontend health check failed"
echo ""

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
log_success "All services started in ${TOTAL_TIME}s"
echo ""

log_info "Service Status:"
echo ""
docker-compose -f "${COMPOSE_FILE}" ps postgres backend frontend pgadmin
echo ""
echo -e "${BOLD}${GREEN}Available Services:${NC}"
echo -e "  ${GREEN}●${NC} PostgreSQL Database  → localhost:5432"
echo -e "  ${GREEN}●${NC} Backend API          → ${CYAN}http://127.0.0.1:5000${NC}"
echo -e "  ${GREEN}●${NC} Backend Health       → ${CYAN}http://127.0.0.1:5000/api/v1/health${NC}"
echo -e "  ${GREEN}●${NC} Frontend Dashboard   → ${CYAN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  ${GREEN}●${NC} pgAdmin              → ${CYAN}http://localhost:8080${NC}"
echo ""
