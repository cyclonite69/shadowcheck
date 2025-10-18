#!/bin/bash
# ShadowCheck Master Deployment Script
# Choose between your proven schema or comprehensive schema

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "========================================"
echo "  ShadowCheck Database Deployment"
echo "========================================"
echo -e "${NC}"

echo "Choose your deployment option:"
echo
echo "1) Your Proven Schema (3NF Normalized)"
echo "   - Well-tested and documented"
echo "   - Simpler to maintain"
echo "   - Perfect for wardriving"
echo
echo "2) Comprehensive Schema (Full Featured)"
echo "   - Advanced SIGINT capabilities"
echo "   - Chain of custody + audit trails"
echo "   - Temporal tracking + deduplication"
echo "   - Auto-generated secure passwords"
echo
echo "3) System Optimization Only"
echo "   - Hardware optimization for Ryzen 5"
echo "   - No database deployment"
echo

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}Deploying your proven schema...${NC}"
        ./deploy.sh
        ;;
    2)
        echo -e "${GREEN}Deploying comprehensive schema...${NC}"
        ./deploy_secure.sh
        ;;
    3)
        echo -e "${YELLOW}Running system optimization only...${NC}"
        ./scripts/optimize_system.sh
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
