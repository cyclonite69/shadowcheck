# ShadowCheck - Startup/Shutdown Scripts

## Quick Start

```bash
./start.sh      # Start all services with health checks
./stop.sh       # Stop all services gracefully
./restart.sh    # Restart all services
```

## Scripts Overview

### ✅ start.sh
**Starts all services in correct dependency order with health checks**

- **Step 1**: Infrastructure (PostgreSQL, Loki)
- **Step 2**: Monitoring (Promtail, Prometheus, Grafana)
- **Step 3**: Application (Backend API, pgAdmin)
- **Step 4**: Frontend

**Health Checks:**
- PostgreSQL: `pg_isready` command
- Backend: `/api/v1/health` endpoint
- Loki: `/ready` endpoint
- Prometheus: `/-/healthy` endpoint
- Grafana: `/api/health` endpoint
- Frontend: HTTP 200 response

**Typical Startup Time:** ~60-90 seconds

### ✅ stop.sh
**Stops all services in reverse order with graceful shutdown**

- **Step 1**: Frontend (10s timeout)
- **Step 2**: Backend API (10s timeout)
- **Step 3**: pgAdmin (10s timeout)
- **Step 4**: Monitoring (Grafana, Prometheus, Promtail, Loki - 10s each)
- **Step 5**: PostgreSQL (30s timeout for data integrity)

**Typical Shutdown Time:** ~10-15 seconds

### ✅ restart.sh
**Performs clean shutdown followed by startup**

Executes `./stop.sh` then `./start.sh` with 3-second pause between.

### ✅ check-network.sh
**Diagnoses Docker network and inter-container connectivity**

- Validates network configuration
- Lists connected containers with IP addresses
- Tests connectivity between services
- Useful for troubleshooting networking issues

## Network Configuration

**Enhanced Docker Bridge Network:**
- **Name:** `shadowcheck_shadowcheck_network`
- **Driver:** bridge
- **Subnet:** 172.18.0.0/16
- **Gateway:** 172.18.0.1
- **IP Range:** 172.18.1.0/24
- **MTU:** 1500
- **Inter-Container Communication:** Enabled

**Features:**
- Isolated network for ShadowCheck services
- Automatic DNS resolution between containers
- Rock-solid inter-service communication
- Named bridge (br-shadowcheck)

## Available Services

Once started, services are available at:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend Dashboard** | http://localhost:3001 | - |
| **Backend API** | http://localhost:5000 | - |
| **Backend Health** | http://localhost:5000/api/v1/health | - |
| **PostgreSQL** | localhost:5432 | shadowcheck_user / [from .env] |
| **pgAdmin** | http://localhost:8080 | admin@shadowcheck.local / admin123 |
| **Grafana** | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9091 | - |
| **Loki** | http://localhost:3100 | - |

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs [service]

# Check network
./check-network.sh

# Full cleanup and restart
docker-compose down
docker network prune -f
./start.sh
```

### Network errors
```bash
# Verify network exists
docker network ls | grep shadowcheck

# Inspect network
docker network inspect shadowcheck_shadowcheck_network

# Test connectivity
./check-network.sh
```

### Container stuck
```bash
# Force stop specific service
docker stop shadowcheck_[service]

# Force stop all
docker-compose down

# Nuclear option (removes containers, preserves data)
docker-compose down
docker system prune -f
```

## Development Notes

- All scripts use `set -euo pipefail` for safety
- Health checks timeout gracefully with warnings
- Shutdown gives PostgreSQL 30s to ensure data integrity
- Network is recreated if configuration changes
- Scripts log to stdout with color-coded status messages

## Exit Codes

- **0**: Success
- **1**: Error (check output for details)

## Environment Variables

Scripts respect docker-compose.yml environment variables:
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `DB_POOL_MIN/MAX`
- `DB_RETRY_ATTEMPTS/DELAY`

See `.env` file for configuration.
