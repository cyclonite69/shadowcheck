#!/bin/bash
# Quick Setup - Add topics and create PR in one command
# Usage: ./scripts/quick-setup.sh [base-branch]

set -e  # Exit on error

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_BRANCH="${1:-main}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ShadowCheck - Quick GitHub Setup     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Add GitHub Topics
echo -e "${BLUE}[1/2] Adding GitHub topics...${NC}"
echo ""
bash "$SCRIPT_DIR/add-github-topics.sh"

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠ Topics not added. You can add them manually later.${NC}"
    echo ""
    read -p "Continue with PR creation? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo ""

# Step 2: Create Pull Request
echo -e "${BLUE}[2/2] Creating pull request...${NC}"
echo ""
bash "$SCRIPT_DIR/create-pull-request.sh" "$BASE_BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Setup Complete!                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review and merge your pull request"
    echo "2. Take screenshots (see docs/images/README.md)"
    echo "3. Start promotion (see GITHUB_MARKETING_GUIDE.md)"
else
    echo ""
    echo -e "${RED}⚠ PR creation failed${NC}"
    echo "Please create PR manually or check authentication"
fi
