#!/usr/bin/env bash
#
# ShadowCheck - Unified Production Restart Script
# Performs clean shutdown and startup with network reset
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

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================
log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✓${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $*"; }

# ============================================================================
# HEADER
# ============================================================================
echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}║             ShadowCheck Production Restart                    ║${NC}"
echo -e "${CYAN}${BOLD}║                                                                ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOTAL_START=$(date +%s)

# ============================================================================
# PHASE 1: SHUTDOWN
# ============================================================================
log_info "Phase 1: Shutting down all services..."
echo ""

if ! "${SCRIPT_DIR}/stop.sh"; then
    log_error "Shutdown failed"
    exit 1
fi

echo ""
log_info "Waiting 3 seconds for clean shutdown..."
sleep 3
echo ""

# ============================================================================
# PHASE 2: STARTUP
# ============================================================================
log_info "Phase 2: Starting all services..."
echo ""

if ! "${SCRIPT_DIR}/start.sh"; then
    log_error "Startup failed"
    exit 1
fi

# ============================================================================
# SUMMARY
# ============================================================================
TOTAL_END=$(date +%s)
TOTAL_TIME=$((TOTAL_END - TOTAL_START))

echo ""
log_success "Restart complete in ${TOTAL_TIME}s"
echo ""
