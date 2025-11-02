#!/usr/bin/env bash
#
# ShadowCheck - Production Restart Script
# Performs clean shutdown and startup of production containers
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

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║             ShadowCheck Production Restart                    ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Step 1: Shutdown
log_info "Phase 1: Shutting down all services..."
echo ""

if ! "${SCRIPT_DIR}/stop-prod.sh"; then
  log_error "Shutdown failed"
  exit 1
fi

echo ""
log_info "Waiting 3 seconds before restart..."
sleep 3
echo ""

# Step 2: Startup
log_info "Phase 2: Starting all services..."
echo ""

if ! "${SCRIPT_DIR}/start-prod.sh"; then
  log_error "Startup failed"
  exit 1
fi

echo ""
log_success "Restart complete!"
echo ""
