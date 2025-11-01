# 📊 ShadowCheck Monitoring Stack

## ✅ Current Status: ALL HEALTHY

All monitoring services are running and accessible!

---

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3000 | `admin` / `KZQvo7+1Vj5lEw9P4dVwJi40OcHYA6kJR1iCULWza4k=` |
| **Prometheus** | http://localhost:9091 | No auth |
| **pgAdmin** | http://localhost:8080 | `admin@shadowcheck.local` / `admin123` |
| **Loki** | http://localhost:3100 | No auth (API only) |

---

## 🎮 Quick Controls

### Toggle Monitoring On/Off
```bash
./monitoring-toggle.sh
```
This script automatically detects if monitoring is running and toggles it on/off.

### Start Monitoring
```bash
./monitoring-start.sh
```

### Stop Monitoring (Preserves Data)
```bash
./monitoring-stop.sh
```

---

## 📦 What's Running

### Currently Active
- ✅ **Grafana** - Visualization dashboards
- ✅ **Prometheus** - Metrics collection
- ✅ **Loki** - Log aggregation
- ✅ **Promtail** - Log shipping
- ✅ **pgAdmin** - PostgreSQL GUI

### Available (in docker-compose.monitoring.yml)
- Node Exporter - System metrics
- cAdvisor - Container metrics  
- AlertManager - Alert routing
- Postgres Exporter - Database metrics

To add these:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

---

## 🔧 Configuration

### Grafana
- **Default Dashboard**: ShadowCheck Overview
- **Data Sources**: Prometheus, Loki (auto-configured)
- **Config**: `docker/grafana/provisioning/`

### Prometheus
- **Scrape Interval**: 15s
- **Retention**: 30 days
- **Config**: `docker/prometheus/prometheus.yml`

### pgAdmin
- **Database Connection**: Already configured
  - Host: `postgres` (Docker network)
  - Port: `5432`
  - User: `shadowcheck_user`
  - Database: `shadowcheck`

---

## 📈 What Gets Monitored

### Backend Metrics (Prometheus)
- HTTP request counts
- Response times
- Error rates
- Database query performance
- Memory/CPU usage

### Logs (Loki)
- Backend API logs
- PostgreSQL logs
- Container logs
- Structured query logs

### Database (pgAdmin)
- Visual query builder
- Table browsing
- Performance analysis
- Connection monitoring

---

## 💾 Data Persistence

All monitoring data is stored in Docker volumes:
- `shadowcheck_grafana_data` - Dashboards and settings
- `shadowcheck_prometheus_data` - Metrics (30 days)
- `shadowcheck_loki_data` - Logs
- `shadowcheck_pgadmin` - pgAdmin config

**Stopping containers does NOT delete data!**

---

## 🚨 Troubleshooting

### Grafana won't start
```bash
docker logs shadowcheck_grafana
```

### Prometheus not scraping
Check targets: http://localhost:9091/targets

### pgAdmin connection fails
1. Ensure postgres container is healthy
2. Use hostname `postgres` (not `localhost`)
3. Port: `5432`

### Toggle script not working
```bash
chmod +x monitoring-toggle.sh
./monitoring-toggle.sh
```

---

## 🎯 Next Steps

1. ✅ All monitoring services running
2. 🔲 Configure Grafana dashboards
3. 🔲 Set up alerts in AlertManager
4. 🔲 Add custom metrics to backend

