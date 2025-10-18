# ShadowCheck Production Deployment Checklist

## ✅ Pre-Deployment Verification

### Infrastructure Files
- [x] `docker-compose.prod.yml` - Production orchestration with PostgreSQL 18
- [x] `docker/backend/Dockerfile` - Multi-stage backend build
- [x] `docker/frontend/Dockerfile` - Multi-stage frontend build
- [x] `docker/postgres/init/01-init-postgis-pg18.sql` - Database schema
- [x] `docker/postgres/conf/postgresql-18.conf` - PostgreSQL 18 config

### Application Code
- [x] `server/utils/shutdown.ts` - Graceful shutdown handler
- [x] `server/routes/health.ts` - Health check endpoints
- [x] `server/db/connection.ts` - Resilient database connection
- [x] `server/index.ts` - Server entry point with shutdown integration

### Monitoring Configuration
- [x] `docker/prometheus/prometheus.yml` - Metrics scraping config
- [x] `docker/prometheus/rules/alerts.yml` - Alert rules
- [x] `docker/grafana/provisioning/datasources/datasources.yml` - Datasources
- [x] `docker/loki/loki-config.yml` - Log aggregation config
- [x] `docker/promtail/promtail-config.yml` - Log shipping config

---

## 🚀 Deployment Steps

### Step 1: Generate Secrets (2 minutes)

```bash
cd ~/shadowcheck

# Run the secret generation script
./generate-secrets.sh

# Verify secrets were created
ls -la secrets/
# Should show:
#   db_password.txt
#   api_key.txt
#   jwt_secret.txt
#   grafana_password.txt
```

**✅ Checkpoint:** All 4 secret files exist with 600 permissions

---

### Step 2: Set Environment Variables (1 minute)

Create or update `.env.production`:

```bash
# Node environment
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=shadowcheck
DB_USER=shadowcheck_user
DB_POOL_MIN=5
DB_POOL_MAX=20

# Mapbox configuration (REQUIRED)
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here

# API configuration
VITE_API_URL=http://backend:5000/api/v1
VITE_PUBLIC_API_URL=http://localhost:5000/api/v1
```

**⚠️ IMPORTANT:** Set your real Mapbox token in `VITE_MAPBOX_TOKEN`

**✅ Checkpoint:** `.env.production` file exists with correct values

---

### Step 3: Build Docker Images (5-10 minutes)

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build --no-cache

# Expected output:
#   ✓ Building backend (Node.js 22 Alpine)
#   ✓ Building frontend (Vite + Nginx)
#   ✓ Pulling postgres:18-master with PostGIS
```

**✅ Checkpoint:** All images built successfully without errors

---

### Step 4: Start Services (2-3 minutes)

```bash
# Start all services in detached mode
docker-compose -f docker-compose.prod.yml up -d

# Watch startup logs (Ctrl+C to exit)
docker-compose -f docker-compose.prod.yml logs -f

# Expected startup order:
#   1. postgres (waits for health check)
#   2. loki (waits for health check)
#   3. backend (waits for postgres healthy)
#   4. frontend (waits for backend healthy)
#   5. prometheus, grafana (waits for loki healthy)
#   6. promtail (waits for loki healthy)
```

**✅ Checkpoint:** All services show "healthy" status

---

### Step 5: Verify Service Health (1 minute)

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# All services should show:
#   STATE: Up
#   STATUS: healthy

# Test health endpoints
curl http://localhost:5000/api/v1/health
# Expected: {"ok":true,"status":"ok",...}

curl http://localhost:5000/api/v1/health/ready
# Expected: {"status":"ready",...}

curl http://localhost:5000/api/v1/health/detailed
# Expected: {"status":"healthy","checks":{"database":{"status":"ok","postgisVersion":"..."}}}
```

**✅ Checkpoint:** All health checks return 200 OK

---

### Step 6: Verify Database Connectivity (1 minute)

```bash
# Connect to PostgreSQL
docker exec -it shadowcheck_postgres psql -U shadowcheck_user -d shadowcheck

# Verify PostgreSQL 18
SELECT version();
# Should show: PostgreSQL 18.x

# Verify PostGIS
SELECT PostGIS_version();
# Should show: 3.x or later

# Check partitioned table
\d+ sigint.signal_detections

# Exit psql
\q
```

**✅ Checkpoint:** PostgreSQL 18 with PostGIS is running

---

### Step 7: Access Monitoring Dashboards (1 minute)

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | - |
| **Backend API** | http://localhost:5000/api/v1 | - |
| **Health Checks** | http://localhost:5000/api/v1/health | - |
| **Prometheus** | http://localhost:9091 | - |
| **Grafana** | http://localhost:3000 | admin / [see `secrets/grafana_password.txt`] |
| **Loki** | http://localhost:3100 | - |

**Get Grafana password:**
```bash
cat secrets/grafana_password.txt
```

**✅ Checkpoint:** All dashboards are accessible

---

### Step 8: Test Graceful Shutdown (1 minute)

```bash
# Send SIGTERM to backend
docker kill --signal=SIGTERM shadowcheck_backend

# Watch logs for graceful shutdown
docker logs shadowcheck_backend --tail 20

# Expected output:
#   [Shutdown] SIGTERM signal received - starting graceful shutdown
#   [Shutdown] Stopping HTTP server (no new connections accepted)
#   [Shutdown] HTTP server closed successfully
#   [Shutdown] Closing database connection pool
#   [Shutdown] Database connections closed successfully
#   [Shutdown] Graceful shutdown completed successfully

# Restart backend
docker-compose -f docker-compose.prod.yml up -d backend
```

**✅ Checkpoint:** Backend shuts down cleanly and restarts successfully

---

## 📊 Post-Deployment Validation

### Database Performance
```bash
# Check connection pool stats
curl -s http://localhost:5000/api/v1/health/detailed | jq '.checks.database.pool'

# Expected:
#   "total": 20,
#   "idle": 15-18,
#   "waiting": 0
```

### Prometheus Metrics
```bash
# Check Prometheus targets
curl -s http://localhost:9091/api/v1/targets | jq '.data.activeTargets[].health'

# All targets should be: "up"
```

### Log Aggregation
```bash
# Check Loki is receiving logs
curl -s "http://localhost:3100/loki/api/v1/label/service/values" | jq

# Expected: ["backend", "postgres", "frontend", "prometheus"]
```

### PostgreSQL 18 Features
```bash
# Verify BRIN indexes exist
docker exec shadowcheck_postgres psql -U shadowcheck_user -d shadowcheck -c \
  "SELECT indexname FROM pg_indexes WHERE tablename='signal_detections' AND indexname LIKE '%brin%';"

# Verify partitions exist
docker exec shadowcheck_postgres psql -U shadowcheck_user -d shadowcheck -c \
  "SELECT tablename FROM pg_tables WHERE schemaname='sigint' AND tablename LIKE 'signal_detections_%';"

# Expected: signal_detections_current, signal_detections_next
```

---

## 🔒 Security Validation

### Secrets Not Exposed
```bash
# Verify secrets are NOT in environment variables
docker exec shadowcheck_backend env | grep -i password
# Should be empty (passwords loaded from /run/secrets/)

# Verify secrets are mounted correctly
docker exec shadowcheck_backend ls -la /run/secrets/
# Should show: db_password, api_key, jwt_secret
```

### Non-Root Execution
```bash
# Verify backend runs as non-root
docker exec shadowcheck_backend whoami
# Expected: appuser (not root)

# Verify frontend runs as non-root
docker exec shadowcheck_frontend whoami
# Expected: nginx or similar (not root)
```

### Network Isolation
```bash
# Verify services are on internal network
docker network inspect shadowcheck_shadowcheck_internal | jq '.Containers | keys'

# All shadowcheck containers should be listed
```

---

## 🎯 Success Criteria

Your deployment is **production-ready** when:

- [x] All 6 services show `healthy` status
- [x] Health endpoints return 200 OK with database connectivity
- [x] Prometheus is scraping metrics from backend
- [x] Grafana dashboards display real-time data
- [x] Loki is receiving logs from all containers
- [x] PostgreSQL 18 with PostGIS is running with partitioned tables
- [x] BRIN indexes exist on `signal_detections` table
- [x] Graceful shutdown completes in <10 seconds
- [x] Secrets are not visible in `docker exec ... env`
- [x] Containers run as non-root users
- [x] Mapbox map loads correctly on frontend

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker logs shadowcheck_backend

# Common issues:
#   - "Secret not found: db_password" → Run ./generate-secrets.sh
#   - "Connection refused" → Check postgres is healthy first
#   - "ECONNREFUSED" → Wait for database health check to pass
```

### Database Connection Failed
```bash
# Check PostgreSQL logs
docker logs shadowcheck_postgres

# Verify PostgreSQL is ready
docker exec shadowcheck_postgres pg_isready -U shadowcheck_user -d shadowcheck

# Test connection manually
docker exec shadowcheck_backend cat /run/secrets/db_password
docker exec shadowcheck_postgres psql -U shadowcheck_user -d shadowcheck -c "SELECT 1;"
```

### Health Checks Failing
```bash
# Check Docker health status
docker inspect shadowcheck_backend | jq '.[].State.Health'

# If unhealthy, check why:
docker inspect shadowcheck_backend | jq '.[].State.Health.Log[-1]'
```

### Prometheus Not Scraping
```bash
# Check Prometheus targets
curl http://localhost:9091/api/v1/targets

# Common issues:
#   - Backend not exposing /api/v1/health/metrics
#   - Network connectivity issues
#   - Backend not healthy yet
```

### Grafana Can't Connect to Datasources
```bash
# Check datasource configuration
docker exec shadowcheck_grafana cat /etc/grafana/provisioning/datasources/datasources.yml

# Test Prometheus connectivity from Grafana
docker exec shadowcheck_grafana wget -O- http://prometheus:9090/-/healthy

# Test Loki connectivity from Grafana
docker exec shadowcheck_grafana wget -O- http://loki:3100/ready
```

---

## 📈 Performance Benchmarks

After deployment, your system should meet these metrics:

| Metric | Target | Command |
|--------|--------|---------|
| Backend startup time | <15s | `docker logs shadowcheck_backend` |
| Health check response | <50ms | `curl -w "%{time_total}\n" http://localhost:5000/api/v1/health` |
| Database query latency | <10ms | Check in detailed health endpoint |
| Memory usage (backend) | <512MB | `docker stats shadowcheck_backend` |
| CPU usage (idle) | <5% | `docker stats` |
| Restart recovery | <30s | Test with `docker restart shadowcheck_backend` |

---

## 🎓 Next Steps

1. **Set up SSL/TLS** - Add nginx reverse proxy with Let's Encrypt
2. **Configure Alertmanager** - Set up email/Slack notifications
3. **Create Grafana Dashboards** - Visualize SIGINT data
4. **Set up Backups** - Automated PostgreSQL backups to S3
5. **Enable cAdvisor** - Container resource monitoring
6. **Add Node Exporter** - Host system metrics
7. **Configure Log Rotation** - Prevent disk space issues
8. **Set up CI/CD** - Automated deployment pipeline

---

## 📞 Support

If you encounter issues not covered in this checklist:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Review QUICK_START.md for detailed guidance
3. Review DOCKER_RESILIENCE_IMPLEMENTATION_GUIDE.md for architecture details
4. Check GitHub issues: https://github.com/your-org/shadowcheck/issues

---

**Last Updated:** 2025-10-11
**ShadowCheck Version:** 1.0.0
**PostgreSQL Version:** 18 with PostGIS
**Node.js Version:** 22 Alpine
