# ShadowCheck Network Configuration

## Overview

Each container in the ShadowCheck stack has been assigned a dedicated static IP address on persistent bridge networks. This configuration provides:

- **Predictable networking** - IPs remain constant across container restarts
- **Better isolation** - Each service has its own IP address
- **Simplified debugging** - Easy to identify traffic by IP
- **Service discovery** - Containers can reference each other by IP or hostname
- **Network policies** - Easier to apply firewall rules and traffic shaping

## Network Architecture

### Development Network (docker-compose.yml)
**Network Name:** `shadowcheck_network`
**Subnet:** `172.18.0.0/16`
**Gateway:** `172.18.0.1`
**Usable Range:** `172.18.0.0/24`

| Service | Container Name | IP Address | Internal Port | External Port |
|---------|---------------|------------|---------------|---------------|
| PostgreSQL | shadowcheck_postgres_18 | 172.18.0.10 | 5432 | 127.0.0.1:5432 |
| Backend API | shadowcheck_backend | 172.18.0.20 | 5000 | 127.0.0.1:5000 |
| Frontend | shadowcheck_frontend | 172.18.0.30 | 80 | 127.0.0.1:3001 |
| Prometheus | shadowcheck_prometheus | 172.18.0.40 | 9090 | 127.0.0.1:9091 |
| Loki | shadowcheck_loki | 172.18.0.50 | 3100 | 127.0.0.1:3100 |
| Promtail | shadowcheck_promtail | 172.18.0.60 | - | - |
| Grafana | shadowcheck_grafana | 172.18.0.70 | 3000 | 127.0.0.1:3000 |
| pgAdmin | shadowcheck_pgadmin | 172.18.0.80 | 80 | 127.0.0.1:8080 |

### Production Network (docker-compose.prod.yml)
**Network Name:** `shadowcheck_internal_prod`
**Subnet:** `172.29.0.0/16`
**Gateway:** `172.29.0.1`
**Usable Range:** `172.29.0.0/24`

| Service | Container Name | IP Address | Internal Port | External Port |
|---------|---------------|------------|---------------|---------------|
| PostgreSQL | shadowcheck_postgres_18 | 172.29.0.10 | 5432 | 127.0.0.1:5432 |
| Backend API | shadowcheck_backend | 172.29.0.20 | 5000, 9090 | 127.0.0.1:5000, 127.0.0.1:9090 |
| Frontend | shadowcheck_frontend | 172.29.0.30 | 80 | 5173 |
| Prometheus | shadowcheck_prometheus | 172.29.0.40 | 9090 | 127.0.0.1:9091 |
| Loki | shadowcheck_loki | 172.29.0.50 | 3100 | 127.0.0.1:3100 |
| Promtail | shadowcheck_promtail | 172.29.0.60 | - | - |
| Grafana | shadowcheck_grafana | 172.29.0.70 | 3000 | 127.0.0.1:3000 |
| pgAdmin | shadowcheck_pgadmin | 172.29.0.80 | 80 | 127.0.0.1:8080 |

## IP Address Allocation Strategy

IPs are allocated in blocks of 10 to allow for future expansion:

- **10-19**: Database services (PostgreSQL, future DB replicas)
- **20-29**: Backend/API services
- **30-39**: Frontend/Web services
- **40-49**: Metrics collection (Prometheus)
- **50-59**: Log aggregation (Loki, Promtail)
- **60-69**: Reserved for future log services
- **70-79**: Visualization (Grafana)
- **80-89**: Admin tools (pgAdmin)
- **90-99**: Reserved for future services

## Connection Examples

### From Backend to Database (Development)
```bash
# Using static IP
postgresql://shadowcheck:password@172.18.0.10:5432/shadowcheck

# Using DNS (still works)
postgresql://shadowcheck:password@postgres:5432/shadowcheck
```

### From Backend to Database (Production)
```bash
# Using static IP (configured in docker-compose.prod.yml)
DB_HOST=172.29.0.10
DB_PORT=5432
```

### Direct Container Communication
```bash
# From any container in the network, you can reach others by:

# Static IP
curl http://172.18.0.20:5000/api/v1/health

# DNS name (Docker's built-in DNS)
curl http://backend:5000/api/v1/health

# Container name
curl http://shadowcheck_backend:5000/api/v1/health
```

## Network Management Commands

### Inspect Network Configuration
```bash
# View development network
docker network inspect shadowcheck_shadowcheck_network

# View production network
docker network inspect shadowcheck_shadowcheck_internal_prod

# Check container IPs
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' shadowcheck_backend
```

### Recreate Networks (if needed)
```bash
# Stop all services
docker-compose down

# Remove network (if it exists)
docker network rm shadowcheck_shadowcheck_network

# Recreate with new config
docker-compose up -d
```

### Test Network Connectivity
```bash
# Ping database from backend container
docker exec shadowcheck_backend ping -c 3 172.18.0.10

# Check if backend can reach database
docker exec shadowcheck_backend nc -zv 172.18.0.10 5432

# Test from host
curl http://127.0.0.1:5000/api/v1/health
```

## Firewall Rules (Optional)

If you want to add additional iptables rules for security:

```bash
# Allow only backend to access database on port 5432
iptables -A DOCKER-USER -s 172.18.0.20 -d 172.18.0.10 -p tcp --dport 5432 -j ACCEPT
iptables -A DOCKER-USER -d 172.18.0.10 -p tcp --dport 5432 -j DROP

# Allow only Grafana to access Prometheus
iptables -A DOCKER-USER -s 172.18.0.70 -d 172.18.0.40 -p tcp --dport 9090 -j ACCEPT
iptables -A DOCKER-USER -d 172.18.0.40 -p tcp --dport 9090 -j DROP
```

## DNS Resolution

Docker provides automatic DNS resolution for:
- Service names (e.g., `postgres`, `backend`, `grafana`)
- Container names (e.g., `shadowcheck_postgres_18`)
- Static IPs (e.g., `172.18.0.10`)

All three methods work simultaneously, giving you flexibility in how containers communicate.

## Troubleshooting

### Container Cannot Reach Another Container

1. Check both containers are on the same network:
   ```bash
   docker inspect shadowcheck_backend | grep -A 10 Networks
   docker inspect shadowcheck_postgres_18 | grep -A 10 Networks
   ```

2. Verify IP addresses are assigned correctly:
   ```bash
   docker inspect shadowcheck_backend -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
   ```

3. Test connectivity from inside the container:
   ```bash
   docker exec shadowcheck_backend ping 172.18.0.10
   docker exec shadowcheck_backend nc -zv 172.18.0.10 5432
   ```

### IP Address Conflict

If you see "address already in use" errors:

1. Check what's using the IP:
   ```bash
   docker network inspect shadowcheck_shadowcheck_network
   ```

2. Remove conflicting container or change IP in docker-compose.yml

3. Recreate the network:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Network Already Exists with Different Config

If the network exists with old configuration:

```bash
# Stop all containers
docker-compose down

# Remove the network
docker network rm shadowcheck_shadowcheck_network

# Recreate everything
docker-compose up -d
```

## Security Considerations

1. **Localhost Binding**: All exposed ports bind to `127.0.0.1` only, preventing external access
2. **Internal Network**: Containers communicate on isolated bridge networks
3. **No External Access**: Database and internal services aren't exposed to the public internet
4. **Static IPs**: Makes it easier to implement network policies and firewall rules

## Future Expansion

Reserved IP blocks for future services:

- **172.18.0.90-99**: Additional monitoring tools
- **172.18.0.100-109**: Cache layer (Redis, Memcached)
- **172.18.0.110-119**: Message queue (RabbitMQ, Kafka)
- **172.18.0.120-129**: Additional databases (replicas, read-only)

The `/16` subnet provides 65,534 usable addresses, so there's plenty of room for growth.
