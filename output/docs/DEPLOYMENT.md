# ShadowCheck Production Deployment Guide

Complete guide for deploying the ShadowCheck surveillance detection platform with enterprise-grade reliability.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SHADOWCHECK STACK                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)  →  Backend (Node + Express)       │
│         :3001                      :5000                     │
│           ↓                          ↓                       │
│      nginx (optional)        PostgreSQL + PostGIS           │
│                                     :5432                    │
├─────────────────────────────────────────────────────────────┤
│              MONITORING (Optional)                           │
│  Grafana (:3000) ← Prometheus (:9091) ← Loki (:3100)       │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 22.04+ recommended)
- **CPU**: 6+ cores (Ryzen 5 or equivalent)
- **RAM**: 16GB minimum
- **Disk**: 50GB+ SSD storage
- **Docker**: 24.0+ with Compose V2

### Software Dependencies
```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

## 🚀 Quick Start (Development)

### 1. Clone and Setup
```bash
git clone <repository-url> shadowcheck
cd shadowcheck

# Create environment file
cp .env.example .env
nano .env  # Edit with your values
```

### 2. Initialize Database
```bash
# Create Docker volume
docker volume create shadowcheck_postgres_data

# Start database only
docker compose up -d postgres

# Wait for health check
docker compose ps
```

### 3. Start Full Stack
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Check service health
curl http://localhost:5000/api/v1/health
```

### 4. Access Services
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/v1/health/detailed
- **pgAdmin** (optional): http://localhost:8080

## 🔧 Production Deployment

### Step 1: Security Hardening

#### A. Create Docker Secrets
```bash
# Create secrets directory (git-ignored)
mkdir -p secrets
chmod 700 secrets

# Generate secure passwords
openssl rand -base64 32 > secrets/db_password.txt
openssl rand -base64 32 > secrets/grafana_password.txt

# Store API keys
echo "your_mapbox_token" > secrets/mapbox_token.txt
echo "your_anthropic_key" > secrets/anthropic_key.txt

# Secure permissions
chmod 600 secrets/*
```

#### B. Update docker-compose.yml for Secrets
```yaml
services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

  backend:
    secrets:
      - db_password
      - mapbox_token
    environment:
      DATABASE_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  mapbox_token:
    file: ./secrets/mapbox_token.txt
```

### Step 2: Configure Environment

Create `.env.production`:
```bash
# ============================================================================
# SHADOWCHECK PRODUCTION CONFIGURATION
# ============================================================================

# Node Environment
NODE_ENV=production

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=shadowcheck
DB_USER=shadowcheck
# Password loaded from Docker secret: /run/secrets/db_password

# Database Pool Settings (optimized for 16GB RAM)
DB_POOL_MIN=10
DB_POOL_MAX=30
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000

# Retry Configuration
DB_RETRY_ATTEMPTS=5
DB_RETRY_DELAY=2000
DB_RETRY_MAX_DELAY=30000
DB_RETRY_BACKOFF_MULTIPLIER=2.0

# Backend Configuration
PORT=5000
LOG_LEVEL=info
LOG_DIR=/app/logs

# Frontend Configuration
VITE_API_URL=http://localhost:5000

# Monitoring (if using monitoring stack)
GRAFANA_PASSWORD_FILE=/run/secrets/grafana_password
PROMETHEUS_RETENTION=30d
```

### Step 3: Build Production Images

```bash
# Build all services
docker compose -f docker-compose.yml build --no-cache

# Tag images for registry (optional)
docker tag shadowcheck-backend:latest your-registry/shadowcheck-backend:v1.0.0
docker tag shadowcheck-frontend:latest your-registry/shadowcheck-frontend:v1.0.0

# Push to registry (optional)
docker push your-registry/shadowcheck-backend:v1.0.0
docker push your-registry/shadowcheck-frontend:v1.0.0
```

### Step 4: Deploy Stack

```bash
# Deploy with production config
docker compose --env-file .env.production up -d

# Verify all services are healthy
docker compose ps

# Watch startup logs
docker compose logs -f
```

### Step 5: Deploy Monitoring (Optional)

```bash
# Start monitoring stack
docker compose \
  -f docker-compose.yml \
  -f docker-compose.monitoring.yml \
  up -d

# Access Grafana
# URL: http://localhost:3000
# User: admin
# Password: (from secrets/grafana_password.txt)
```

## 📊 Health Checks

### Service Health Endpoints

```bash
# Backend Liveness (is process alive?)
curl http://localhost:5000/api/v1/health

# Backend Readiness (can handle requests?)
curl http://localhost:5000/api/v1/health/ready

# Detailed Health with Metrics
curl http://localhost:5000/api/v1/health/detailed

# Prometheus Metrics
curl http://localhost:5000/api/v1/health/metrics
```

### Docker Health Status
```bash
# Check all services
docker compose ps

# Check specific service
docker inspect shadowcheck_backend --format='{{.State.Health.Status}}'

# View health check logs
docker inspect shadowcheck_backend --format='{{json .State.Health}}' | jq
```

## 🔄 Upgrades and Rollbacks

### Zero-Downtime Upgrade

```bash
# 1. Build new image
docker compose build backend

# 2. Create new container (without starting)
docker compose up --no-start backend

# 3. Stop old container gracefully
docker compose stop backend

# 4. Start new container
docker compose up -d backend

# 5. Verify health
docker compose exec backend wget -qO- http://localhost:5000/api/v1/health
```

### Rollback Procedure

```bash
# 1. Stop current version
docker compose stop backend

# 2. Restore previous image
docker tag shadowcheck-backend:v1.0.0-prev shadowcheck-backend:latest

# 3. Start with previous image
docker compose up -d backend

# 4. Verify rollback successful
docker compose logs backend
```

## 🚨 Troubleshooting

### Database Connection Issues

**Symptom**: Backend fails with `ECONNREFUSED` or `Connection timeout`

**Solution**:
```bash
# Check postgres is running
docker compose ps postgres

# Check postgres logs
docker compose logs postgres | tail -50

# Test connection from backend container
docker compose exec backend \
  wget -qO- http://postgres:5432 || echo "Cannot reach postgres"

# Verify network
docker network inspect shadowcheck_network

# Restart with fresh connection
docker compose restart backend
```

### Container Crashes on Startup

**Symptom**: Backend exits with code 1 immediately after starting

**Solution**:
```bash
# View recent logs
docker compose logs backend --tail=100

# Check for:
# - Missing environment variables
# - Database connection failures
# - Port conflicts

# Run interactively for debugging
docker compose run --rm backend sh
```

### Memory Issues

**Symptom**: OOM kills or slow performance

**Solution**:
```bash
# Check current usage
docker stats

# Adjust memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G  # Increase if needed

# Restart with new limits
docker compose up -d backend
```

### Graceful Shutdown Not Working

**Symptom**: Data loss during restarts

**Verification**:
```bash
# Check if tini is running
docker compose exec backend ps aux | grep tini

# Verify signal handling
docker compose exec backend cat /proc/1/status | grep SigIgn

# Test graceful shutdown
docker compose stop -t 30 backend  # 30 second timeout
docker compose logs backend | grep -i shutdown
```

## 📈 Performance Tuning

### PostgreSQL Optimization

Located in `config/postgres-config/postgresql.conf`:
```ini
# Already configured for 16GB RAM system
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 128MB
```

### Connection Pool Tuning

Adjust based on load testing:
```bash
# For high concurrency (1000+ req/s)
DB_POOL_MIN=20
DB_POOL_MAX=50

# For low concurrency (< 100 req/s)
DB_POOL_MIN=5
DB_POOL_MAX=15
```

### Docker Resource Limits

Current settings (docker-compose.yml):
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'          # Max 2 cores
        memory: 1G          # Max 1GB RAM
      reservations:
        cpus: '1'          # Guarantee 1 core
        memory: 512M        # Guarantee 512MB RAM
```

## 🔒 Security Checklist

- [ ] Docker secrets configured for all sensitive data
- [ ] All services bind to `127.0.0.1` only (not `0.0.0.0`)
- [ ] Non-root users in all containers
- [ ] Secrets directory excluded from git (`.gitignore`)
- [ ] Regular security updates: `docker compose pull`
- [ ] Firewall configured to block external access
- [ ] TLS/SSL certificates if exposing publicly
- [ ] Database backups automated
- [ ] Monitoring and alerting configured

## 📦 Backup and Restore

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump \
  -U shadowcheck \
  -d shadowcheck \
  -F c \
  -b \
  -v \
  -f /backups/shadowcheck_$(date +%Y%m%d_%H%M%S).dump

# Verify backup
ls -lh backups/
```

### Database Restore

```bash
# Restore from backup
docker compose exec postgres pg_restore \
  -U shadowcheck \
  -d shadowcheck \
  -v \
  /backups/shadowcheck_20251011_230000.dump
```

### Automated Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/shadowcheck && docker compose exec postgres pg_dump -U shadowcheck -d shadowcheck -F c -f /backups/daily_$(date +\%Y\%m\%d).dump

# Weekly backup on Sunday at 3 AM
0 3 * * 0 cd /path/to/shadowcheck && docker compose exec postgres pg_dump -U shadowcheck -d shadowcheck -F c -f /backups/weekly_$(date +\%Y_week\%U).dump
```

## 📞 Support and Resources

- **Health Check Guide**: `docker/MONITORING_SETUP.md`
- **Database Schema**: `schema/`
- **API Documentation**: http://localhost:5000/api/v1/health/detailed
- **Container Logs**: `docker compose logs -f <service>`

## 🎯 Production Readiness Checklist

Before going live, verify:

- [ ] All health checks passing (`docker compose ps`)
- [ ] Database backup strategy implemented
- [ ] Monitoring stack deployed and configured
- [ ] Resource limits appropriate for load
- [ ] Secrets properly configured
- [ ] Firewall rules in place
- [ ] Log rotation configured
- [ ] Disaster recovery plan documented
- [ ] Team trained on deployment procedures
- [ ] Rollback procedure tested

---

## Quick Command Reference

```bash
# Start/Stop
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose restart <service>  # Restart specific service

# Logs
docker compose logs -f            # Follow all logs
docker compose logs -f backend    # Follow backend logs only
docker compose logs --tail=100    # Last 100 lines

# Health
docker compose ps                 # Service status
docker compose exec backend wget -qO- http://localhost:5000/api/v1/health

# Cleanup
docker compose down -v            # Remove volumes (DESTRUCTIVE!)
docker system prune -a            # Clean unused images

# Monitoring
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

**For detailed monitoring setup, see**: `docker/MONITORING_SETUP.md`
