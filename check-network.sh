#!/usr/bin/env bash
#
# ShadowCheck - Network Diagnostic Script
# Validates Docker network and container connectivity
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

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║              ShadowCheck Network Diagnostics                  ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check network exists
log_info "Checking Docker network..."
if docker network inspect shadowcheck_shadowcheck_network >/dev/null 2>&1; then
    log_success "Network exists: shadowcheck_shadowcheck_network"
else
    log_error "Network does not exist!"
    exit 1
fi

echo ""
log_info "Network Configuration:"
echo ""
docker network inspect shadowcheck_shadowcheck_network --format='  Driver: {{.Driver}}
  Subnet: {{range .IPAM.Config}}{{.Subnet}}{{end}}
  Gateway: {{range .IPAM.Config}}{{.Gateway}}{{end}}
  IP Range: {{range .IPAM.Config}}{{.IPRange}}{{end}}
  Bridge Name: {{index .Options "com.docker.network.bridge.name"}}
  ICC Enabled: {{index .Options "com.docker.network.bridge.enable_icc"}}
  MTU: {{index .Options "com.docker.network.driver.mtu"}}'

# Check connected containers
echo ""
log_info "Connected Containers:"
echo ""

CONTAINERS=$(docker network inspect shadowcheck_shadowcheck_network --format='{{range $k, $v := .Containers}}{{$v.Name}} {{end}}')

if [[ -z "${CONTAINERS}" ]]; then
    log_warning "No containers connected to network"
else
    for container in ${CONTAINERS}; do
        IP=$(docker inspect "${container}" --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
        STATUS=$(docker inspect "${container}" --format='{{.State.Status}}')

        if [[ "${STATUS}" == "running" ]]; then
            echo -e "  ${GREEN}●${NC} ${container} → ${IP}"
        else
            echo -e "  ${RED}●${NC} ${container} → ${IP} (${STATUS})"
        fi
    done
fi

# Test inter-container connectivity
echo ""
log_info "Testing Inter-Container Connectivity:"
echo ""

ALL_OK=true

# Test backend -> postgres
if docker ps --filter "name=shadowcheck_backend" --filter "status=running" | grep -q shadowcheck_backend; then
    if docker exec shadowcheck_backend sh -c "nc -zv postgres 5432" >/dev/null 2>&1; then
        log_success "Backend → PostgreSQL: Connected"
    else
        log_error "Backend → PostgreSQL: Failed"
        ALL_OK=false
    fi
else
    log_warning "Backend not running, skipping connectivity test"
fi

# Test backend -> loki
if docker ps --filter "name=shadowcheck_backend" --filter "status=running" | grep -q shadowcheck_backend; then
    if docker ps --filter "name=shadowcheck_loki" --filter "status=running" | grep -q shadowcheck_loki; then
        if docker exec shadowcheck_backend sh -c "nc -zv loki 3100" >/dev/null 2>&1; then
            log_success "Backend → Loki: Connected"
        else
            log_error "Backend → Loki: Failed"
            ALL_OK=false
        fi
    else
        log_warning "Loki not running, skipping connectivity test"
    fi
fi

# Test prometheus -> postgres (for metrics)
if docker ps --filter "name=shadowcheck_prometheus" --filter "status=running" | grep -q shadowcheck_prometheus; then
    if docker exec shadowcheck_prometheus sh -c "nc -zv postgres 5432" >/dev/null 2>&1; then
        log_success "Prometheus → PostgreSQL: Connected"
    else
        log_warning "Prometheus → PostgreSQL: Failed (may be expected)"
    fi
else
    log_warning "Prometheus not running, skipping connectivity test"
fi

echo ""

if [[ "${ALL_OK}" == true ]]; then
    log_success "All connectivity tests passed!"
else
    log_error "Some connectivity tests failed"
    exit 1
fi

echo ""
log_info "Network diagnostics complete"
echo ""
