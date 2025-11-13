# Docker Volume & Directory Cleanup Guide
**Date:** 2025-11-13

## ⚠️ IMPORTANT: Run this on your LOCAL system with Docker

## Current Shadowcheck Persistence Strategy

### Named Docker Volumes (Managed by Docker)
These are stored in `/var/lib/docker/volumes/` on your host:

```bash
shadowcheck_postgres_data    # ✅ KEEP - Your database
shadowcheck_pgadmin           # ⚠️  Optional - Only if using pgAdmin
prometheus_data               # ✅ KEEP - Metrics history
grafana_data                  # ✅ KEEP - Dashboard configs
loki_data                     # ✅ KEEP - Log history
npm-cache                     # ⚠️  Can recreate - NPM dependencies cache
```

### Bind Mounts (Local directories in shadowcheck/)
These directories are mounted directly from your repo:

```bash
./logs/                       # ✅ KEEP - Application logs
./backups/                    # ✅ KEEP - Database backups (if exists)
./config/                     # ✅ KEEP - Configuration files
./docker/                     # ✅ KEEP - Docker configs
./pipelines/                  # ✅ KEEP - Data pipelines
```

---

## 🗑️ Safe to Delete

### 1. Old Backup Tarballs
```bash
# Remove old backup if you don't need it
rm /home/user/shadowcheck_backup.tar.gz
```

### 2. Unused Docker Volumes
**Run on your local system with Docker:**

```bash
# Check for orphaned volumes (not used by any container)
docker volume ls --filter dangling=true

# Remove only dangling/unused volumes
docker volume prune

# Or remove specific old volumes (CAREFUL!)
# docker volume rm volume_name
```

### 3. Old Log Files (if logs/ gets too large)
```bash
cd shadowcheck/logs/
# Archive old logs first
tar -czf logs_archive_$(date +%Y%m%d).tar.gz *.log
# Then remove originals if needed
rm *.log
```

### 4. Development Artifacts
```bash
cd shadowcheck/
# Node modules (can be reinstalled)
rm -rf node_modules/
rm -rf client/node_modules/

# Build artifacts (can be rebuilt)
rm -rf dist/
rm -rf client/dist/
```

---

## ⛔ DO NOT DELETE

### Critical Volumes
- **shadowcheck_postgres_data** - Your entire database
- **prometheus_data** - Historical metrics
- **grafana_data** - Dashboard configurations
- **loki_data** - Historical logs

### Critical Directories
- `./config/` - Database and service configs
- `./schema/` - Database schema definitions
- `./server/` - Backend source code
- `./client/` - Frontend source code
- `./pipelines/` - Data ingestion scripts
- `./docker/` - Docker service configurations

---

## 🔍 How to Find Your Docker Volumes

### On Linux/Mac:
```bash
# List all Docker volumes
docker volume ls

# Inspect specific volume location
docker volume inspect shadowcheck_postgres_data

# See volume disk usage
docker system df -v
```

### Volume Locations:
- **Linux:** `/var/lib/docker/volumes/`
- **Mac:** `~/Library/Containers/com.docker.docker/Data/vms/0/`
- **Windows:** `C:\ProgramData\Docker\volumes\`

---

## 🧹 Complete Cleanup Script (LOCAL SYSTEM ONLY)

```bash
#!/bin/bash
# cleanup_docker.sh - Run on your LOCAL system

echo "🔍 Checking Docker disk usage..."
docker system df

echo -e "\n📦 Current volumes:"
docker volume ls | grep shadowcheck

echo -e "\n⚠️  This will remove:"
echo "  - Stopped containers"
echo "  - Unused networks"
echo "  - Dangling images"
echo "  - Dangling build cache"
echo "  - Unused volumes (NOT shadowcheck volumes)"

read -p "Continue? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Remove stopped containers
    docker container prune -f

    # Remove unused networks
    docker network prune -f

    # Remove dangling images
    docker image prune -f

    # Remove build cache
    docker builder prune -f

    # Remove ONLY dangling volumes (not named volumes)
    docker volume prune -f

    echo "✅ Cleanup complete!"
    docker system df
fi
```

---

## 📊 Backup Before Cleanup

Always backup your database before major cleanup:

```bash
# Backup database volume
docker run --rm \
  -v shadowcheck_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data

# Backup Grafana dashboards
docker run --rm \
  -v grafana_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/grafana_backup_$(date +%Y%m%d).tar.gz /data
```

---

## 🚨 Recovery Commands

If you accidentally delete something:

```bash
# Restore database backup
docker run --rm \
  -v shadowcheck_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd / && tar xzf /backup/postgres_backup_YYYYMMDD.tar.gz"

# Recreate volumes (will be empty)
docker volume create shadowcheck_postgres_data

# Reimport schema
docker-compose exec postgres psql -U shadowcheck_user -d shadowcheck -f /schema/migration.sql
```

---

## 📝 Summary

**Safe to clean on your local system:**
1. ✅ `/home/user/shadowcheck_backup.tar.gz` - Old backup tarball
2. ✅ Dangling Docker volumes (use `docker volume prune`)
3. ✅ Old log files in `./logs/` (after archiving)
4. ✅ `node_modules/` and `dist/` directories (can rebuild)

**NEVER delete:**
1. ❌ Named volumes (shadowcheck_postgres_data, grafana_data, etc.)
2. ❌ Source code directories (server/, client/, pipelines/)
3. ❌ Configuration directories (config/, docker/, schema/)
4. ❌ The shadowcheck/ repository itself

**shadowcheck-lite**: As you mentioned, don't touch it - it's a separate project.
