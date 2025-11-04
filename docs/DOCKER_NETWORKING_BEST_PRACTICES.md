# Docker Networking Best Practices for ShadowCheck

## Overview

This document outlines best practices for managing Docker networking in the ShadowCheck application, including troubleshooting common issues and maintaining reliable host-to-container connectivity.

## Core Principles

### 1. Use Docker Compose Native Features

**✅ DO:**
- Let Docker Compose manage network creation via `docker-compose.yml`
- Use `depends_on` with `condition: service_healthy` for service dependencies
- Define explicit networks with static subnets for predictability
- Use Docker's built-in health checks instead of external polling

**❌ DON'T:**
- Create networks manually with `docker network create`
- Hardcode bridge interface names in scripts
- Use external health check scripts that poll from the host
- Modify Docker bridge IPs manually unless absolutely necessary

### 2. Health Checks

**Proper Health Check Implementation:**

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/v1/health"]
  interval: 15s
  timeout: 5s
  retries: 3
  start_period: 40s
```

**Check Health from Scripts:**
```bash
# Use Docker's health status, not external curl
docker inspect --format='{{.State.Health.Status}}' container_name
```

### 3. Port Binding Best Practices

**For Production:**
```yaml
# Bind backend to all interfaces for maximum compatibility
ports:
  - "5000:5000"  # Instead of 127.0.0.1:5000:5000

# Bind database only to localhost for security
ports:
  - "127.0.0.1:5432:5432"
```

### 4. Network Configuration

**Static Subnet Definition:**
```yaml
networks:
  shadowcheck_internal_prod:
    driver: bridge
    ipam:
      config:
        - subnet: 172.29.0.0/16
```

**Why:** Predictable IP ranges make troubleshooting easier and prevent conflicts.

## Common Issues and Solutions

### Issue 1: "Cannot connect to localhost:5000"

**Symptoms:**
- `curl http://localhost:5000` times out
- Services work from inside containers
- Ports show as listening on host

**Root Cause:** Docker bridge missing gateway IP

**Solution:**
```bash
# Run diagnostic
./troubleshoot-network.sh

# If bridge IP is missing, recreate network
docker-compose -f docker-compose.prod.yml down
docker network prune -f
./start-prod.sh
```

### Issue 2: Containers start but health checks fail

**Symptoms:**
- Containers show as "Up" but not "healthy"
- Docker logs show repeated health check attempts

**Root Cause:** Health check command requires dependencies not in container

**Solution:**
- Ensure health check tools (curl, wget) are installed in Dockerfile
- Use appropriate health check intervals (not too frequent)
- Allow sufficient `start_period` for application initialization

### Issue 3: Network conflicts after system reboot

**Symptoms:**
- Containers fail to start
- "address already in use" errors

**Root Cause:** Stale Docker networks or iptables rules

**Solution:**
```bash
# Clean slate approach
docker-compose down
docker network prune -f
docker system prune -f  # Optional: removes unused resources
./start-prod.sh
```

## Troubleshooting Workflow

### 1. Run Diagnostic Script

```bash
./troubleshoot-network.sh
```

This script checks:
- Container status and health
- Port bindings
- Host port listening
- Internal container connectivity
- Host-to-container connectivity
- Docker network configuration
- Firewall rules

### 2. Interpret Results

The script will report specific issues and provide remediation steps. Common fixes:

**Fix 1: Recreate Network (Safest)**
```bash
docker-compose -f docker-compose.prod.yml down
docker network prune -f
./start-prod.sh
```

**Fix 2: Restart Docker Daemon (Requires sudo)**
```bash
sudo systemctl restart docker
./start-prod.sh
```

**Fix 3: Manual Bridge IP Fix (Last Resort)**
```bash
# Only if troubleshoot script identifies missing bridge IP
./troubleshoot-network.sh --fix
```

### 3. Verify Fix

```bash
# Should return 0 if all tests pass
./troubleshoot-network.sh
echo $?

# Manual verification
curl http://localhost:5173  # Frontend
curl http://localhost:5000/api/v1/health  # Backend
```

## Startup Script Standards

All startup/shutdown/restart scripts MUST follow these standards:

### ✅ Correct Pattern (Docker-native)

```bash
#!/usr/bin/env bash
set -euo pipefail

# Start services (Docker handles dependencies)
docker-compose -f docker-compose.prod.yml up -d

# Wait for health using Docker's status
wait_for_healthy() {
  local service="$1"
  health=$(docker-compose ps -q "$service" | \
    xargs docker inspect --format='{{.State.Health.Status}}')

  if [[ "$health" == "healthy" ]]; then
    echo "✓ $service is healthy"
    return 0
  fi
  return 1
}

wait_for_healthy "backend"
```

### ❌ Incorrect Pattern (External polling)

```bash
# DON'T DO THIS - subject to network issues
while ! curl -sf http://localhost:5000/health; do
  sleep 2
done
```

## Maintenance Tasks

### Weekly

- Review Docker logs for networking warnings:
  ```bash
  docker-compose logs | grep -i "network\|connection"
  ```

### After System Updates

1. Restart Docker daemon:
   ```bash
   sudo systemctl restart docker
   ```

2. Recreate networks:
   ```bash
   docker-compose down && docker network prune -f
   ```

3. Verify with diagnostic script:
   ```bash
   ./troubleshoot-network.sh
   ```

### Before Production Deployment

1. Clean environment:
   ```bash
   docker system prune -f
   docker volume prune -f
   docker network prune -f
   ```

2. Start fresh:
   ```bash
   ./start-prod.sh
   ```

3. Verify all endpoints:
   ```bash
   ./troubleshoot-network.sh
   ```

## Security Considerations

### Port Exposure

**Database Ports:** Bind only to localhost
```yaml
ports:
  - "127.0.0.1:5432:5432"  # ✅ Secure
  - "5432:5432"             # ❌ Exposed to all interfaces
```

**Application Ports:** Can bind to all interfaces if behind firewall
```yaml
ports:
  - "5000:5000"  # ✅ OK if firewall configured
  - "0.0.0.0:5000:5000"  # ✅ Explicit, same as above
```

### Network Isolation

Use separate networks for different tiers:
```yaml
networks:
  frontend_network:
    # Public-facing services
  backend_network:
    # Internal services only
```

## Debugging Commands

### Network Inspection
```bash
# List all Docker networks
docker network ls

# Inspect specific network
docker network inspect shadowcheck_shadowcheck_internal_prod

# Show bridge configuration
ip addr show | grep br-
```

### Container Connectivity
```bash
# Test from inside container
docker exec shadowcheck_backend curl -f http://localhost:5000/api/v1/health

# Test DNS resolution
docker exec shadowcheck_backend nslookup postgres

# Check port bindings
docker port shadowcheck_backend
```

### System-Level Debugging
```bash
# Check if ports are listening
ss -tlnp | grep -E '5000|5173|5432'

# Check iptables rules
sudo iptables -L -n | grep -E '5000|5173'

# Check Docker iptables chains
sudo iptables -L DOCKER -n
```

## Environment-Specific Notes

### Development (docker-compose.yml)
- Use hot-reload and volume mounts
- Expose all ports for debugging
- Health checks can be more lenient

### Production (docker-compose.prod.yml)
- Strict health checks
- Minimal port exposure
- Always use secrets for credentials
- Enable resource limits
- Implement restart policies

## Quick Reference

### Common Commands

| Task | Command |
|------|---------|
| Start services | `./start-prod.sh` |
| Stop services | `./stop-prod.sh` |
| Restart services | `./restart-prod.sh` |
| Check health | `docker-compose ps` |
| View logs | `docker-compose logs -f [service]` |
| Troubleshoot network | `./troubleshoot-network.sh` |
| Fix network | `docker-compose down && docker network prune -f && ./start-prod.sh` |

### Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Backend | `http://localhost:5000/api/v1/health` | `{"ok":true}` |
| Frontend | `http://localhost:5173/` | HTML page |
| PostgreSQL | `docker exec shadowcheck_postgres_18 pg_isready` | `accepting connections` |

## Checklist for New Deployments

- [ ] Run `./troubleshoot-network.sh` before starting
- [ ] Verify no conflicting services on ports 5000, 5173, 5432, 8080
- [ ] Ensure Docker daemon is running: `systemctl status docker`
- [ ] Check available disk space: `df -h`
- [ ] Prune old resources: `docker system prune -f`
- [ ] Start services: `./start-prod.sh`
- [ ] Verify health: `./troubleshoot-network.sh`
- [ ] Test frontend in browser: http://localhost:5173
- [ ] Test backend API: `curl http://localhost:5000/api/v1/health`

## Support

If issues persist after following this guide:

1. Collect diagnostic output:
   ```bash
   ./troubleshoot-network.sh > network-diagnostics.txt 2>&1
   docker-compose logs > docker-logs.txt 2>&1
   ```

2. Check Docker daemon logs:
   ```bash
   sudo journalctl -u docker --no-pager -n 100
   ```

3. Review system networking:
   ```bash
   ip addr show > network-config.txt
   ss -tlnp > listening-ports.txt
   ```
