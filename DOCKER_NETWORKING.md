# ShadowCheck Docker Networking Guide

## Overview

ShadowCheck uses Docker Compose with a custom bridge network for container communication. This document explains the networking setup, known issues, and workarounds.

## Network Configuration

### Network Details
- **Network Name**: `shadowcheck_internal_prod`
- **Driver**: bridge
- **Subnet**: 172.29.0.0/16
- **Gateway**: 172.29.0.1 (automatically assigned)

### Container IPs
Containers are assigned IPs automatically from the 172.29.0.0/16 subnet:
- `shadowcheck_postgres_18`: 172.29.0.2
- `shadowcheck_backend`: 172.29.0.5
- `shadowcheck_frontend`: 172.29.0.6
- Others: Dynamically assigned

## Port Mappings

### Production Ports (docker-compose.prod.yml)
```
Service          Internal Port    Host Port         Bind Address
-----------------------------------------------------------------------------
postgres         5432            127.0.0.1:5432    localhost only
backend          5000            0.0.0.0:5000      all interfaces
backend metrics  9090            0.0.0.0:9090      all interfaces
frontend         80              0.0.0.0:5173      all interfaces
pgadmin          80              127.0.0.1:8080    localhost only
prometheus       9090            127.0.0.1:9091    localhost only
grafana          3000            127.0.0.1:3000    localhost only
loki             3100            127.0.0.1:3100    localhost only
```

## Known Issue: docker-proxy localhost forwarding

### Problem
On some systems, `docker-proxy` does not properly forward connections from `localhost:5000` or `127.0.0.1:5000` to the backend container, even though:
- The port binding appears correct (`0.0.0.0:5000`)
- `docker-proxy` process is running
- TCP connections to the port succeed
- HTTP requests hang/timeout

### Root Cause
This is a known issue with `docker-proxy` when using the `-use-listen-fd` flag combined with certain kernel or systemd configurations. The proxy accepts the TCP connection but fails to forward the HTTP request to the container.

### Diagnosis
```bash
# Port is listening
$ ss -tlnp | grep 5000
LISTEN 0  4096  0.0.0.0:5000  0.0.0.0:*

# docker-proxy is running
$ ps aux | grep docker-proxy.*5000
root  11634  /usr/bin/docker-proxy ... -container-port 5000 -use-listen-fd

# TCP connect works
$ python3 -c "import socket; s=socket.socket(); s.connect(('127.0.0.1', 5000)); print('OK')"
OK

# But HTTP hangs
$ curl http://localhost:5000/api/v1/health
(timeout after 2 minutes)

# Direct container access works
$ docker exec shadowcheck_backend curl http://localhost:5000/api/v1/health
{"ok":true,"status":"ok"}
```

## Workarounds

### Solution 1: Use Bridge Gateway IP (RECOMMENDED)
Access the backend via the Docker bridge gateway IP instead of localhost:

```bash
# Get bridge gateway IP
BRIDGE_IP=$(docker network inspect shadowcheck_shadowcheck_internal_prod \
  --format='{{range .IPAM.Config}}{{.Gateway}}{{end}}')

# Access backend (typically 172.29.0.1)
curl http://${BRIDGE_IP}:5000/api/v1/health
```

**This is the method used by the `start.sh` script.**

### Solution 2: Access via Container IP
Get the container's IP and access it directly:

```bash
BACKEND_IP=$(docker inspect shadowcheck_backend \
  --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')

curl http://${BACKEND_IP}:5000/api/v1/health
```

### Solution 3: Use Docker exec
Execute curl from inside the container:

```bash
docker exec shadowcheck_backend curl http://localhost:5000/api/v1/health
```

### Solution 4: Restart Docker Daemon (May Fix)
Sometimes restarting the Docker daemon resolves docker-proxy issues:

```bash
sudo systemctl restart docker
./start.sh
```

## Frontend Configuration

The frontend needs to know where to reach the backend API. This is configured in `docker-compose.prod.yml`:

```yaml
frontend:
  environment:
    # For container-to-container communication
    VITE_API_URL: http://backend:5000/api/v1
    # For browser access (needs bridge IP due to docker-proxy issue)
    VITE_PUBLIC_API_URL: http://172.29.0.1:5000/api/v1
```

**Important**: You may need to update `VITE_PUBLIC_API_URL` to use the bridge gateway IP if the frontend can't reach the backend via localhost.

## Startup Script Features

The `start.sh` script includes:

### 1. Network Cleanup
- Detects orphaned shadowcheck networks
- Removes empty networks before starting
- Prevents network conflicts

### 2. Health Checks
- Waits for PostgreSQL to be healthy before starting backend
- Waits for backend to be healthy before starting frontend
- Uses Docker's native health check status

### 3. Network Verification
- Tests backend accessibility via bridge IP
- Tests frontend accessibility
- Reports gateway IP for backend access

### 4. Clear Status Reporting
```bash
$ ./start.sh

=== Startup Complete ===

Available Services:
  ● Backend API          → http://172.29.0.1:5000 (use bridge IP)
  ● Frontend Dashboard   → http://localhost:5173
  ...

Note: Backend API accessible via Docker bridge IP 172.29.0.1
      (docker-proxy localhost forwarding may not work on this system)
```

## Shutdown Script Features

The `stop.sh` script includes:

### 1. Graceful Shutdown
- Stops services in reverse dependency order
- Frontend → Monitoring → Backend → Database
- Longer timeout for PostgreSQL (30s for data integrity)

### 2. Network Cleanup
- Removes stopped containers with `--remove-orphans`
- Removes empty Docker networks
- Cleans up orphaned shadowcheck networks

### 3. Verification
- Confirms all services stopped
- Shows final container status

## Troubleshooting

### Backend not reachable
```bash
# Run network diagnostic
./troubleshoot-network.sh

# Check bridge IP
docker network inspect shadowcheck_shadowcheck_internal_prod \
  --format='{{range .IPAM.Config}}Gateway: {{.Gateway}}{{end}}'

# Test via bridge IP
curl http://172.29.0.1:5000/api/v1/health
```

### Multiple networks exist
```bash
# List shadowcheck networks
docker network ls | grep shadowcheck

# Clean shutdown removes networks
./stop.sh

# Manual cleanup if needed
docker network prune -f
```

### Container can't reach another container
```bash
# Check both are on same network
docker network inspect shadowcheck_shadowcheck_internal_prod \
  --format='{{range .Containers}}{{.Name}} {{end}}'

# Verify DNS resolution
docker exec shadowcheck_backend ping -c 1 postgres
```

## Management Commands

```bash
# Start all services with network setup
./start.sh

# Stop all services and clean networks
./stop.sh

# Full restart with network recreation
./restart.sh

# Network diagnostics
./troubleshoot-network.sh

# View logs
docker compose -f docker-compose.prod.yml logs -f backend

# Check network details
docker network inspect shadowcheck_shadowcheck_internal_prod
```

## Security Considerations

### Port Binding Strategy
- **Production services** (postgres, pgadmin, grafana, loki, prometheus): Bind to `127.0.0.1` only
- **User-facing services** (frontend, backend): Bind to `0.0.0.0` for accessibility

### Why backend binds to 0.0.0.0
The backend binds to `0.0.0.0:5000` instead of `127.0.0.1:5000` because:
1. Allows access via bridge IP (workaround for docker-proxy issue)
2. Enables frontend container to reach backend
3. Supports direct container IP access if needed

**Note**: In production, use a reverse proxy (nginx) to limit external access.

## Future Improvements

### Option 1: Use Host Networking (Not Recommended)
```yaml
backend:
  network_mode: host
```
- Simpler networking, no docker-proxy
- **Downside**: Loses container isolation, can't use depends_on

### Option 2: Disable userland-proxy
In `/etc/docker/daemon.json`:
```json
{
  "userland-proxy": false
}
```
- Uses iptables DNAT instead of docker-proxy
- **Downside**: May not work on all systems, requires testing

### Option 3: Use nginx Reverse Proxy
Add nginx container that proxies `localhost:5000` → `backend:5000`
- Most reliable solution
- Adds complexity

## Summary

✅ **What Works**:
- Docker Compose networking with custom bridge
- Container-to-container communication via service names
- Health checks and dependency ordering
- Network cleanup on shutdown/restart
- Backend accessible via bridge IP (172.29.0.1:5000)

❌ **Known Issues**:
- docker-proxy doesn't forward localhost:5000 → container (workaround: use bridge IP)

🎯 **Best Practices**:
- Use `./start.sh` and `./stop.sh` for management
- Access backend via bridge IP shown in startup output
- Clean shutdown before restart to avoid orphaned networks
- Use `./troubleshoot-network.sh` for diagnostics
