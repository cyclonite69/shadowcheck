# ShadowCheck Optimized Deployment Guide
## Ryzen 5 + 16GB RAM + Parrot OS Bare Metal

Complete deployment guide for maximum performance on your hardware configuration.

## 🚀 Quick Deployment (5 minutes)

```bash
# 1. Optimize system for database performance
./optimize_system.sh

# 2. Reboot system (required for kernel optimizations)
sudo reboot

# 3. Deploy secure database with auto-generated passwords
./deploy_secure.sh

# 4. Monitor performance
./monitor_performance.sh
```

## 🔧 Performance Optimizations Applied

### Hardware Utilization
- **CPU**: Optimized for Ryzen 5 (6 cores/12 threads)
  - 12 max worker processes
  - 4 parallel workers per query
  - JIT compilation enabled for complex spatial queries

- **Memory**: Optimized for 16GB RAM
  - 4GB shared_buffers (25% of RAM)
  - 12GB effective_cache_size (75% of RAM)
  - 128MB work_mem for spatial operations
  - 1GB maintenance_work_mem
  - 2GB hugepages for zero-copy memory access

- **Storage**: SSD-optimized I/O
  - `none`/`noop` I/O scheduler
  - 300 effective_io_concurrency (NVMe)
  - 8GB WAL size for bulk imports
  - LZ4 WAL compression

### Database Configuration Highlights

```postgresql
# Memory (optimized for 16GB)
shared_buffers = 4GB
work_mem = 128MB
maintenance_work_mem = 1GB
effective_cache_size = 12GB

# CPU (optimized for Ryzen 5)
max_worker_processes = 12
max_parallel_workers = 8
max_parallel_workers_per_gather = 4

# Storage (SSD optimized)
random_page_cost = 1.1
effective_io_concurrency = 300
wal_compression = lz4
```

### Kernel Optimizations

```bash
# Memory management
vm.swappiness = 1              # Prefer RAM over swap
vm.dirty_ratio = 5             # Aggressive writeback
vm.overcommit_memory = 2       # No memory overcommit

# Shared memory (for PostgreSQL)
kernel.shmmax = 8589934592     # 8GB max shared memory
kernel.shmall = 2097152        # Total shared memory pages

# Network tuning
net.core.rmem_max = 134217728  # 128MB socket buffers
net.ipv4.tcp_congestion_control = bbr
```

## 📊 Expected Performance

### Wardriving Data Import
- **WiGLE SQLite Import**: ~50,000 records/second
- **Real-time Signal Collection**: <10ms insert latency
- **Spatial Queries**: <100ms for 1km radius searches
- **Bulk Analytics**: Full parallel processing utilization

### Resource Usage (Typical)
```
CPU Usage: 30-60% during imports, 5-15% steady state
Memory Usage: 8-12GB PostgreSQL, 2-4GB OS/containers
Disk I/O: 200-500MB/s sequential writes (import)
Network: Minimal (localhost only)
```

## 🔐 Security Configuration

### Authentication
- **SCRAM-SHA-256** password encryption
- **Auto-generated** 32-40 character passwords
- **Localhost-only** binding (127.0.0.1)
- **Role-based** access control

### Generated Roles
```
shadowcheck_admin    - Full database access (5 connections)
shadowcheck_analyst  - Security analysis (10 connections)
shadowcheck_user     - Data collection (25 connections)
shadowcheck_readonly - Reporting only (50 connections)
shadowcheck_api      - Application access (100 connections)
shadowcheck_emergency - Emergency access (disabled by default)
```

### Network Security
- Docker containers isolated on private network
- PostgreSQL: `127.0.0.1:5432` only
- pgAdmin: `127.0.0.1:8080` only (optional)
- No external network access possible

## 📈 Performance Monitoring

### Real-time Monitoring
```bash
# System performance overview
./monitor_performance.sh

# Docker container resources
docker stats shadowcheck_postgres

# PostgreSQL query performance
docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC LIMIT 10;"
```

### Key Metrics to Watch
- **Memory usage**: Should stay under 14GB total
- **CPU usage**: Should spike during imports, low otherwise
- **Disk I/O**: Should be consistent, no blocked processes
- **Connection count**: Monitor with `pg_stat_activity`

## 🗂️ File Structure

```
/home/nunya/shadowcheck/
├── deploy_secure.sh           # Secure deployment with auto-passwords
├── optimize_system.sh         # System optimization for Ryzen 5
├── monitor_performance.sh     # Performance monitoring
├── docker-compose.yml         # Optimized Docker configuration
├── postgres-config/           # PostgreSQL performance tuning
│   ├── postgresql.conf        # Ryzen 5 + 16GB optimized settings
│   └── pg_hba.conf           # Localhost-only authentication
├── credentials/               # Auto-generated secure passwords
├── backups/                  # Database backups
├── schema_refactored.sql     # Your 3NF normalized schema
├── migration.sql             # Data migration scripts
├── indexes.sql               # Performance indexes
└── roles_secure.sql          # Secure role creation
```

## 🚨 Troubleshooting

### Performance Issues

1. **Slow Queries**
   ```bash
   # Check for missing indexes
   docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "
   SELECT schemaname, tablename, attname, n_distinct, correlation
   FROM pg_stats WHERE schemaname = 'app' AND n_distinct > 100;"
   ```

2. **High Memory Usage**
   ```bash
   # Check shared memory usage
   ipcs -m

   # Monitor PostgreSQL memory
   docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "
   SELECT name, setting, unit FROM pg_settings
   WHERE name IN ('shared_buffers', 'work_mem', 'maintenance_work_mem');"
   ```

3. **Connection Issues**
   ```bash
   # Check active connections
   docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "
   SELECT usename, count(*) FROM pg_stat_activity GROUP BY usename;"
   ```

### System Issues

1. **Docker Performance**
   ```bash
   # Check Docker daemon status
   sudo systemctl status docker

   # Monitor Docker resources
   docker system df
   docker system events &
   ```

2. **Kernel Optimization**
   ```bash
   # Verify sysctl settings
   sysctl vm.swappiness vm.dirty_ratio kernel.shmmax

   # Check hugepages
   grep HugePages /proc/meminfo
   ```

## 📋 Maintenance Tasks

### Daily
```bash
# Monitor performance
./monitor_performance.sh

# Check database health
docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "
SELECT * FROM app.password_expiry_status;"
```

### Weekly
```bash
# Backup database
docker exec shadowcheck_postgres pg_dump -U shadowcheck_admin shadowcheck > "backups/shadowcheck_$(date +%Y%m%d).sql"

# Update statistics
docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "ANALYZE;"

# Rotate old backups
./backup_rotate.sh
```

### Monthly
```bash
# Rotate passwords (if policy requires)
docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "
SELECT app.rotate_role_password('shadowcheck_api');"

# Check for unused indexes
docker exec shadowcheck_postgres psql -U shadowcheck_admin -d shadowcheck -c "
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'app' AND idx_scan < 100
ORDER BY idx_scan;"
```

## 🎯 Use Cases & Examples

### Wardriving Import
```bash
# Start monitoring
./monitor_performance.sh &

# Import large WiGLE dataset
docker exec shadowcheck_postgres psql -U shadowcheck_user -d shadowcheck -c "
COPY app.signal_measurements FROM '/path/to/large_dataset.csv' WITH CSV HEADER;"

# Check import performance
docker stats shadowcheck_postgres
```

### Spatial Analysis
```sql
-- Find networks near coordinates (should be <100ms)
SELECT mac_address, network_name,
       ST_Distance(primary_location_point::geography,
                   ST_Point(-122.4194, 37.7749)::geography) as distance_meters
FROM app.wireless_access_points
WHERE ST_DWithin(primary_location_point::geography,
                  ST_Point(-122.4194, 37.7749)::geography, 1000)
ORDER BY distance_meters LIMIT 20;
```

### Security Analysis
```sql
-- Check for potential stalking (should be <1s)
SELECT device_1_mac, device_2_mac, stalking_risk_score, colocation_count
FROM app.mv_colocation_patterns
WHERE stalking_risk_score > 0.7
ORDER BY stalking_risk_score DESC;
```

## ✅ Success Criteria

Your deployment is successful when:

- [ ] System optimization completed without errors
- [ ] PostgreSQL container starts and passes health checks
- [ ] All 6 roles created with secure passwords
- [ ] Spatial queries execute in <100ms
- [ ] Import performance >10,000 records/second
- [ ] Memory usage stable under 14GB
- [ ] CPU usage responsive to workload
- [ ] All security tests pass

## 🔄 Next Steps

1. **Import your existing data** using migration scripts
2. **Set up monitoring dashboards** for ongoing operations
3. **Configure backup automation** for data protection
4. **Implement application layer** using secure API credentials
5. **Scale horizontally** if needed with read replicas

Your ShadowCheck database is now optimized for maximum performance on Ryzen 5 hardware with enterprise-grade security!