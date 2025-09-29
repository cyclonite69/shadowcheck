#!/bin/bash
set -euo pipefail

# Shadowcheck Docker Management CLI
# A production-ready CLI for managing the shadowcheck Docker environment
# Protects existing shadowcheck_postgres container while managing other services

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    printf "${BLUE}[INFO]${NC} %s\n" "$1"
}

log_success() {
    printf "${GREEN}[SUCCESS]${NC} %s\n" "$1"
}

log_warning() {
    printf "${YELLOW}[WARNING]${NC} %s\n" "$1"
}

log_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

# Generate secure random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Check if container exists
container_exists() {
    docker ps -a --format "table {{.Names}}" | grep -q "^$1$"
}

# Check if container is running
container_running() {
    docker ps --format "table {{.Names}}" | grep -q "^$1$"
}

# Source environment variables
source_env() {
    if [[ -f "$ENV_FILE" ]]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi
}

# Environment check and setup
env_check() {
    log_info "Checking environment configuration..."

    # Create .env if it doesn't exist
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warning ".env file not found, creating..."
        touch "$ENV_FILE"
    fi

    # Required environment variables
    declare -A required_vars=(
        ["POSTGRES_USER"]="postgres"
        ["POSTGRES_PASSWORD"]=""
        ["PGADMIN_DEFAULT_EMAIL"]="admin@shadowcheck.local"
        ["PGADMIN_DEFAULT_PASSWORD"]=""
    )

    # Check and generate missing variables
    for var in "${!required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
            if [[ "$var" == *"PASSWORD"* ]]; then
                value=$(generate_password)
                log_info "Generated secure password for $var"
            else
                value="${required_vars[$var]}"
            fi
            echo "${var}=${value}" >> "$ENV_FILE"
            log_success "Added $var to .env"
        fi
    done

    # Source the updated environment
    source_env

    # Display configuration summary
    log_success "Environment configuration:"
    printf "%-25s | %s\n" "Variable" "Value"
    printf "%-25s | %s\n" "-------------------------" "------------------------"
    printf "%-25s | %s\n" "POSTGRES_USER" "${POSTGRES_USER:-'NOT SET'}"
    printf "%-25s | %s\n" "POSTGRES_PASSWORD" "${POSTGRES_PASSWORD:+***MASKED***}"
    printf "%-25s | %s\n" "PGADMIN_DEFAULT_EMAIL" "${PGADMIN_DEFAULT_EMAIL:-'NOT SET'}"
    printf "%-25s | %s\n" "PGADMIN_DEFAULT_PASSWORD" "${PGADMIN_DEFAULT_PASSWORD:+***MASKED***}"
}

# Show container status
status() {
    log_info "Shadowcheck Docker Environment Status:"
    echo

    # Show shadowcheck-related containers
    if docker ps -a --filter name=shadowcheck --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q shadowcheck; then
        docker ps -a --filter name=shadowcheck --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        log_warning "No shadowcheck containers found"
    fi

    echo

    # Check postgres health
    if container_running "shadowcheck_postgres"; then
        log_success "PostgreSQL container is running"
        # Test connection
        if docker exec shadowcheck_postgres pg_isready -U postgres >/dev/null 2>&1; then
            log_success "PostgreSQL is accepting connections"
        else
            log_warning "PostgreSQL is running but not ready for connections"
        fi
    else
        log_error "PostgreSQL container is not running"
    fi

    # Check pgAdmin status
    if container_running "shadowcheck_pgadmin"; then
        log_success "pgAdmin container is running"
    else
        log_warning "pgAdmin container is not running"
    fi
}

# Start services
start() {
    log_info "Starting shadowcheck services..."

    # Ensure environment is set up
    env_check >/dev/null
    source_env

    # Check if postgres is running (don't start it, just verify)
    if ! container_running "shadowcheck_postgres"; then
        log_error "PostgreSQL container 'shadowcheck_postgres' is not running"
        log_error "Please start your PostgreSQL container before running other services"
        exit 1
    fi

    # Start pgAdmin if not running
    if container_running "shadowcheck_pgadmin"; then
        log_info "pgAdmin is already running"
    else
        log_info "Starting pgAdmin container..."

        # Remove existing container if it exists but is stopped
        if container_exists "shadowcheck_pgadmin"; then
            docker rm shadowcheck_pgadmin >/dev/null 2>&1
        fi

        docker run -d \
            --name shadowcheck_pgadmin \
            --cpus=1 \
            --memory=512m \
            --restart=unless-stopped \
            -p 8082:80 \
            -e PGADMIN_DEFAULT_EMAIL="${PGADMIN_DEFAULT_EMAIL}" \
            -e PGADMIN_DEFAULT_PASSWORD="${PGADMIN_DEFAULT_PASSWORD}" \
            -e PGADMIN_LISTEN_PORT=80 \
            -v shadowcheck_pgadmin_data:/var/lib/pgadmin \
            dpage/pgadmin4:latest >/dev/null

        # Wait for container to be ready
        log_info "Waiting for pgAdmin to start..."
        sleep 5

        if container_running "shadowcheck_pgadmin"; then
            log_success "pgAdmin started successfully on http://localhost:8082"
        else
            log_error "Failed to start pgAdmin"
            exit 1
        fi
    fi
}

# Connect to pgAdmin
connect_pgadmin() {
    source_env

    if ! container_running "shadowcheck_pgadmin"; then
        log_error "pgAdmin is not running. Start it with: $0 start"
        exit 1
    fi

    log_success "pgAdmin is available at: http://localhost:8082"
    echo
    log_info "Login credentials:"
    echo "  Email: ${PGADMIN_DEFAULT_EMAIL}"
    echo "  Password: ${PGADMIN_DEFAULT_PASSWORD}"
    echo
    log_info "To add the PostgreSQL server in pgAdmin:"
    echo "  1. Click 'Add New Server'"
    echo "  2. General tab:"
    echo "     Name: Shadowcheck DB"
    echo "  3. Connection tab:"
    echo "     Host: shadowcheck_postgres"
    echo "     Port: 5432"
    echo "     Username: ${POSTGRES_USER}"
    echo "     Password: ${POSTGRES_PASSWORD}"
    echo
    log_info "Test connection with curl:"
    echo "  curl -I http://localhost:8082"
}

# Show logs for a container
logs() {
    local container_name="$1"

    # Add shadowcheck prefix if not present
    if [[ "$container_name" != shadowcheck_* ]]; then
        container_name="shadowcheck_${container_name}"
    fi

    if ! container_exists "$container_name"; then
        log_error "Container '$container_name' does not exist"
        log_info "Available shadowcheck containers:"
        docker ps -a --filter name=shadowcheck --format "  - {{.Names}}"
        exit 1
    fi

    log_info "Showing logs for $container_name (press Ctrl+C to exit)..."
    docker logs -f "$container_name"
}

# Stop services (excluding postgres)
stop() {
    log_info "Stopping shadowcheck services (excluding PostgreSQL)..."

    if container_running "shadowcheck_pgadmin"; then
        log_info "Stopping pgAdmin..."
        docker stop shadowcheck_pgadmin >/dev/null
        log_success "pgAdmin stopped"
    else
        log_info "pgAdmin is not running"
    fi

    log_warning "PostgreSQL container left running (as requested)"
}

# Export environment for Node.js integration
export_env() {
    source_env
    echo "# Source this output to set environment variables for Node.js"
    echo "export POSTGRES_USER='${POSTGRES_USER}'"
    echo "export POSTGRES_PASSWORD='${POSTGRES_PASSWORD}'"
    echo "export PGHOST='localhost'"
    echo "export PGPORT='5432'"
    echo "export PGDATABASE='shadowcheck'"
    echo "export DATABASE_URL='postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/shadowcheck'"
}

# Show help
show_help() {
    cat << EOF
Shadowcheck Docker Management CLI

USAGE:
    $0 <command> [options]

COMMANDS:
    status              Show status of all shadowcheck containers
    start               Start pgAdmin (PostgreSQL must already be running)
    stop                Stop services (excluding PostgreSQL)
    connect-pgadmin     Show pgAdmin connection details and setup instructions
    env-check           Validate and setup environment variables
    logs <container>    Show logs for specified container (postgres, pgadmin)
    export-env          Export environment variables for Node.js integration
    help                Show this help message

EXAMPLES:
    $0 status                    # Check container status
    $0 start                     # Start pgAdmin service
    $0 connect-pgadmin           # Get pgAdmin connection info
    $0 logs postgres             # Show PostgreSQL logs
    $0 logs pgadmin              # Show pgAdmin logs

    # Source environment for Node.js development:
    source <($0 export-env)
    npm run dev

NOTES:
    - This script never stops or removes the 'shadowcheck_postgres' container
    - Environment variables are stored in .env file
    - pgAdmin runs on http://localhost:8082
    - PostgreSQL should be accessible on localhost:5432

EOF
}

# Main command handling
main() {
    case "${1:-help}" in
        "status")
            status
            ;;
        "start")
            start
            ;;
        "stop")
            stop
            ;;
        "connect-pgadmin")
            connect_pgadmin
            ;;
        "env-check")
            env_check
            ;;
        "logs")
            if [[ -z "${2:-}" ]]; then
                log_error "Container name required. Usage: $0 logs <container>"
                exit 1
            fi
            logs "$2"
            ;;
        "export-env")
            export_env
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown command: ${1:-}"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

# Example usage (in comments):
# ./shadowcheck-cli.sh status                    # Check all container status
# ./shadowcheck-cli.sh start                     # Start pgAdmin
# ./shadowcheck-cli.sh connect-pgadmin           # Get connection details
# ./shadowcheck-cli.sh logs postgres             # Tail PostgreSQL logs
# source <(./shadowcheck-cli.sh export-env)      # Export env vars for Node.js
# npm run dev                                     # Start Node.js with proper env