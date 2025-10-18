#!/bin/bash
# ==============================================================================
# SHADOWCHECK SECRET GENERATION SCRIPT
# ==============================================================================
#
# Generates secure random secrets for Docker secrets
#
# Usage:
#   chmod +x generate-secrets.sh
#   ./generate-secrets.sh
#
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "===================================================================="
echo "SHADOWCHECK SECRET GENERATION"
echo "===================================================================="
echo

# Create secrets directory
SECRETS_DIR="./secrets"
if [ ! -d "$SECRETS_DIR" ]; then
    mkdir -p "$SECRETS_DIR"
    echo -e "${GREEN}✓${NC} Created secrets directory: $SECRETS_DIR"
else
    echo -e "${YELLOW}⚠${NC} Secrets directory already exists: $SECRETS_DIR"
    read -p "Overwrite existing secrets? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

echo

# Generate database password (32 characters)
echo -n "Generating db_password... "
openssl rand -base64 32 > "$SECRETS_DIR/db_password.txt"
echo -e "${GREEN}✓${NC}"

# Generate API key (32 characters)
echo -n "Generating api_key... "
openssl rand -base64 32 > "$SECRETS_DIR/api_key.txt"
echo -e "${GREEN}✓${NC}"

# Generate JWT secret (64 characters for extra security)
echo -n "Generating jwt_secret... "
openssl rand -base64 64 > "$SECRETS_DIR/jwt_secret.txt"
echo -e "${GREEN}✓${NC}"

# Generate Grafana password (32 characters)
echo -n "Generating grafana_password... "
openssl rand -base64 32 > "$SECRETS_DIR/grafana_password.txt"
echo -e "${GREEN}✓${NC}"

echo

# Set restrictive permissions
echo -n "Setting secure permissions (600)... "
chmod 600 "$SECRETS_DIR"/*.txt
echo -e "${GREEN}✓${NC}"

echo

# Display summary
echo "===================================================================="
echo "SECRETS GENERATED SUCCESSFULLY"
echo "===================================================================="
echo
echo "Location: $SECRETS_DIR/"
echo
echo "Files created:"
echo "  - db_password.txt       (Database password)"
echo "  - api_key.txt          (API authentication key)"
echo "  - jwt_secret.txt       (JWT signing secret)"
echo "  - grafana_password.txt (Grafana admin password)"
echo
echo "Permissions: 600 (read/write for owner only)"
echo

# Add to .gitignore if not already present
if ! grep -q "^secrets/$" .gitignore 2>/dev/null; then
    echo "secrets/" >> .gitignore
    echo -e "${GREEN}✓${NC} Added 'secrets/' to .gitignore"
else
    echo -e "${YELLOW}⚠${NC} 'secrets/' already in .gitignore"
fi

echo
echo "===================================================================="
echo "NEXT STEPS"
echo "===================================================================="
echo
echo "1. Verify secrets were created:"
echo "   ls -la $SECRETS_DIR/"
echo
echo "2. View Grafana password:"
echo "   cat $SECRETS_DIR/grafana_password.txt"
echo
echo "3. Build and start Docker containers:"
echo "   docker-compose -f docker-compose.prod.yml build"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo
echo "4. Check service health:"
echo "   docker-compose -f docker-compose.prod.yml ps"
echo "   curl http://localhost:5000/api/v1/health"
echo
echo "===================================================================="
echo
echo -e "${GREEN}Secret generation complete!${NC}"
echo
