#!/bin/bash
# ShadowCheck Network Configuration Update Script
# This script applies the new static IP configuration to all containers

set -e

echo "=========================================="
echo "ShadowCheck Network Configuration Update"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed or not in PATH"
    exit 1
fi

print_status "Detected docker-compose version: $(docker-compose version --short)"
echo ""

# Ask which environment to update
echo "Which environment do you want to update?"
echo "1) Development (docker-compose.yml)"
echo "2) Production (docker-compose.prod.yml)"
echo "3) Both"
read -p "Enter choice [1-3]: " choice

COMPOSE_FILES=()
case $choice in
    1)
        COMPOSE_FILES+=("docker-compose.yml")
        ;;
    2)
        COMPOSE_FILES+=("docker-compose.prod.yml")
        ;;
    3)
        COMPOSE_FILES+=("docker-compose.yml" "docker-compose.prod.yml")
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_warning "This will stop and recreate all containers with new IP addresses"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_error "Update cancelled"
    exit 0
fi

echo ""

# Process each compose file
for compose_file in "${COMPOSE_FILES[@]}"; do
    echo "=========================================="
    print_status "Processing $compose_file"
    echo "=========================================="
    echo ""

    # Validate compose file
    print_status "Validating $compose_file..."
    if [ "$compose_file" = "docker-compose.yml" ]; then
        docker-compose config --quiet
    else
        docker-compose -f "$compose_file" config --quiet
    fi
    print_status "Configuration is valid"
    echo ""

    # Stop containers
    print_status "Stopping containers..."
    if [ "$compose_file" = "docker-compose.yml" ]; then
        docker-compose down
    else
        docker-compose -f "$compose_file" down
    fi
    echo ""

    # Get network name
    if [ "$compose_file" = "docker-compose.yml" ]; then
        NETWORK_NAME="shadowcheck_shadowcheck_network"
    else
        NETWORK_NAME="shadowcheck_shadowcheck_internal_prod"
    fi

    # Check if network exists
    if docker network ls | grep -q "$NETWORK_NAME"; then
        print_warning "Network $NETWORK_NAME already exists"
        read -p "Remove and recreate network? (yes/no): " recreate_net

        if [ "$recreate_net" = "yes" ]; then
            print_status "Removing network $NETWORK_NAME..."
            docker network rm "$NETWORK_NAME" || print_warning "Could not remove network (may still be in use)"
        fi
    fi
    echo ""

    # Start containers with new configuration
    print_status "Starting containers with new network configuration..."
    if [ "$compose_file" = "docker-compose.yml" ]; then
        docker-compose up -d
    else
        docker-compose -f "$compose_file" up -d
    fi
    echo ""

    # Wait for services to start
    print_status "Waiting for services to start (10 seconds)..."
    sleep 10
    echo ""

    # Verify network configuration
    print_status "Verifying network configuration..."
    echo ""
    docker network inspect "$NETWORK_NAME" --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}' | sort
    echo ""
done

echo "=========================================="
print_status "Network configuration update complete!"
echo "=========================================="
echo ""
print_status "Next steps:"
echo "  1. Check container status: docker-compose ps"
echo "  2. View network details: docker network inspect <network_name>"
echo "  3. Test connectivity between containers"
echo "  4. Review NETWORK_CONFIGURATION.md for details"
echo ""
