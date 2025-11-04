#!/usr/bin/env bash
#
# ShadowCheck Network Troubleshooting Script
# Diagnoses and optionally fixes common Docker networking issues
#
# Usage: ./troubleshoot-network.sh [--fix]
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

COMPOSE_FILE="docker-compose.prod.yml"
FIX_MODE=false

# Parse arguments
if [[ "${1:-}" == "--fix" ]]; then
  FIX_MODE=true
  echo -e "${YELLOW}⚠ Running in FIX mode - will attempt to repair issues${NC}"
  echo ""
fi

log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✓${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $*"; }
log_section() { echo -e "\n${CYAN}${BOLD}=== $* ===${NC}\n"; }

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║         ShadowCheck Network Troubleshooting Tool              ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

ISSUES_FOUND=0

# ==============================================================================
# TEST 1: Container Status
# ==============================================================================
log_section "TEST 1: Container Status"

CONTAINERS=("shadowcheck_postgres_18" "shadowcheck_backend" "shadowcheck_frontend" "shadowcheck_pgadmin")

for container in "${CONTAINERS[@]}"; do
  if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "${container}" 2>/dev/null || echo "none")
    running_status=$(docker inspect --format='{{.State.Status}}' "${container}" 2>/dev/null || echo "unknown")

    if [[ "${health_status}" == "healthy" ]] || [[ "${health_status}" == "none" && "${running_status}" == "running" ]]; then
      log_success "${container}: ${running_status} (health: ${health_status})"
    else
      log_error "${container}: ${running_status} (health: ${health_status})"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  else
    log_error "${container}: NOT RUNNING"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

# ==============================================================================
# TEST 2: Port Bindings
# ==============================================================================
log_section "TEST 2: Port Bindings"

check_port_binding() {
  local container="$1"
  local port="$2"

  if ! docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
    log_error "${container} not running - cannot check port ${port}"
    return 1
  fi

  local binding=$(docker port "${container}" "${port}" 2>/dev/null | head -1)
  if [[ -n "${binding}" ]]; then
    log_success "${container}:${port} → ${binding}"
  else
    log_error "${container}:${port} not mapped"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
}

check_port_binding "shadowcheck_frontend" "80"
check_port_binding "shadowcheck_backend" "5000"
check_port_binding "shadowcheck_postgres_18" "5432"

# ==============================================================================
# TEST 3: Host Port Listening
# ==============================================================================
log_section "TEST 3: Host Port Listening"

check_host_port() {
  local port="$1"
  local service="$2"

  if ss -tlnp 2>/dev/null | grep -q ":${port} " || netstat -tlnp 2>/dev/null | grep -q ":${port} "; then
    log_success "Port ${port} (${service}) is listening on host"
  else
    log_error "Port ${port} (${service}) NOT listening on host"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
}

check_host_port "5173" "Frontend"
check_host_port "5000" "Backend"
check_host_port "5432" "PostgreSQL"

# ==============================================================================
# TEST 4: Internal Container Connectivity
# ==============================================================================
log_section "TEST 4: Internal Container Connectivity"

# Test backend API from inside container
if docker exec shadowcheck_backend timeout 3 curl -sf http://localhost:5000/api/v1/health >/dev/null 2>&1; then
  log_success "Backend API responds internally (container→localhost)"
else
  log_error "Backend API does NOT respond internally"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Test frontend from inside container
if docker exec shadowcheck_frontend timeout 3 curl -sf http://localhost:80/ >/dev/null 2>&1; then
  log_success "Frontend responds internally (container→localhost)"
else
  log_error "Frontend does NOT respond internally"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# ==============================================================================
# TEST 5: Host to Container Connectivity
# ==============================================================================
log_section "TEST 5: Host to Container Connectivity"

# Test backend from host (this is where issues occur)
if timeout 3 curl -sf http://127.0.0.1:5000/api/v1/health >/dev/null 2>&1; then
  log_success "Backend API responds from host (host→127.0.0.1:5000)"
else
  log_error "Backend API does NOT respond from host (host→127.0.0.1:5000)"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))

  # Additional diagnostic
  log_info "Testing alternate host address..."
  if timeout 3 curl -sf http://localhost:5000/api/v1/health >/dev/null 2>&1; then
    log_warning "Backend responds to 'localhost' but not '127.0.0.1'"
  fi
fi

# Test frontend from host
if timeout 3 curl -sf http://localhost:5173/ >/dev/null 2>&1; then
  log_success "Frontend responds from host (host→localhost:5173)"
else
  log_error "Frontend does NOT respond from host (host→localhost:5173)"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# ==============================================================================
# TEST 6: Docker Network Configuration
# ==============================================================================
log_section "TEST 6: Docker Network Configuration"

# Get network name from docker-compose
NETWORK_NAME=$(docker-compose -f "${COMPOSE_FILE}" ps -q postgres 2>/dev/null | xargs docker inspect --format='{{range $net,$v := .NetworkSettings.Networks}}{{$net}}{{end}}' 2>/dev/null | head -1)

if [[ -n "${NETWORK_NAME}" ]]; then
  log_success "Docker network: ${NETWORK_NAME}"

  # Check network details
  SUBNET=$(docker network inspect "${NETWORK_NAME}" --format='{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null)
  GATEWAY=$(docker network inspect "${NETWORK_NAME}" --format='{{range .IPAM.Config}}{{.Gateway}}{{end}}' 2>/dev/null)

  log_info "Subnet: ${SUBNET}"
  log_info "Gateway: ${GATEWAY}"

  # Check if bridge has IP address
  BRIDGE_NAME=$(docker network inspect "${NETWORK_NAME}" --format='{{.Id}}' | cut -c1-12)
  BRIDGE_IFACE="br-${BRIDGE_NAME}"

  if ip addr show "${BRIDGE_IFACE}" 2>/dev/null | grep -q "inet ${GATEWAY}"; then
    log_success "Bridge ${BRIDGE_IFACE} has correct IP: ${GATEWAY}"
  else
    log_error "Bridge ${BRIDGE_IFACE} missing IP address!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    if [[ "${FIX_MODE}" == true ]]; then
      log_info "Attempting to fix bridge IP..."
      if sudo ip addr add "${GATEWAY}/16" dev "${BRIDGE_IFACE}" 2>/dev/null; then
        log_success "Bridge IP added"
      else
        log_warning "Could not add bridge IP (may already exist or need manual intervention)"
      fi
    fi
  fi
else
  log_error "Could not determine Docker network name"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# ==============================================================================
# TEST 7: Firewall Rules
# ==============================================================================
log_section "TEST 7: Firewall Rules"

# Check if firewalld is active
if command -v firewall-cmd >/dev/null 2>&1; then
  if systemctl is-active --quiet firewalld 2>/dev/null; then
    log_info "firewalld is active"

    # Check Docker zone
    if firewall-cmd --get-active-zones 2>/dev/null | grep -q docker; then
      log_success "Docker zone exists in firewalld"
    else
      log_warning "Docker zone not found in firewalld"
    fi
  else
    log_info "firewalld not active"
  fi
fi

# Check if ufw is active
if command -v ufw >/dev/null 2>&1; then
  if ufw status 2>/dev/null | grep -q "Status: active"; then
    log_warning "ufw firewall is active - may block Docker ports"
  else
    log_info "ufw not active"
  fi
fi

# Check iptables for Docker chains
if iptables -L DOCKER -n >/dev/null 2>&1; then
  log_success "Docker iptables chains exist"
else
  log_warning "Docker iptables chains not found"
fi

# ==============================================================================
# SUMMARY
# ==============================================================================
log_section "Summary"

echo ""
if [[ ${ISSUES_FOUND} -eq 0 ]]; then
  log_success "All tests passed! No networking issues detected."
  echo ""
  echo -e "${BOLD}${GREEN}✓ Application should be accessible at:${NC}"
  echo -e "  ${GREEN}●${NC} Frontend: ${CYAN}http://localhost:5173${NC}"
  echo -e "  ${GREEN}●${NC} Backend:  ${CYAN}http://localhost:5000${NC}"
else
  log_error "Found ${ISSUES_FOUND} networking issue(s)"
  echo ""
  echo -e "${BOLD}${YELLOW}Recommended Actions:${NC}"

  if [[ "${FIX_MODE}" == false ]]; then
    echo ""
    echo -e "${YELLOW}1.${NC} Run with --fix to attempt automatic repairs:"
    echo -e "   ${CYAN}./troubleshoot-network.sh --fix${NC}"
  fi

  echo ""
  echo -e "${YELLOW}2.${NC} Restart Docker daemon (may resolve bridge issues):"
  echo -e "   ${CYAN}sudo systemctl restart docker${NC}"
  echo -e "   ${CYAN}./start-prod.sh${NC}"

  echo ""
  echo -e "${YELLOW}3.${NC} Recreate Docker network from scratch:"
  echo -e "   ${CYAN}docker-compose -f ${COMPOSE_FILE} down${NC}"
  echo -e "   ${CYAN}docker network prune -f${NC}"
  echo -e "   ${CYAN}./start-prod.sh${NC}"

  echo ""
  echo -e "${YELLOW}4.${NC} Check system firewall settings:"
  echo -e "   ${CYAN}sudo iptables -L -n | grep -E '5000|5173'${NC}"
fi

echo ""
exit ${ISSUES_FOUND}
