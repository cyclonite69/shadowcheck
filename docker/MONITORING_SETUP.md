# ShadowCheck Monitoring Stack

This directory contains the configuration for the complete monitoring and observability stack for ShadowCheck.

## 🚀 Quick Start

### Start Basic Monitoring (Prometheus + Grafana + Loki)
```bash
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Start Full Monitoring (includes cAdvisor, Node Exporter, AlertManager)
```bash
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml --profile monitoring-full up -d
```

### Stop Monitoring Stack
```bash
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml down
```

## 📊 Components

### Prometheus (Port 9091)
- **URL**: http://localhost:9091
- **Purpose**: Metrics collection and storage
- **Retention**: 30 days
- **Scrape Interval**: 15 seconds

### Grafana (Port 3000)
- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: See `.env` file or use default from admin panel
- **Purpose**: Metrics visualization and dashboards

**Pre-configured Datasources:**
- Prometheus (metrics)
- Loki (logs)
- PostgreSQL (direct database access)

### Loki (Port 3100)
- **URL**: http://localhost:3100
- **Purpose**: Log aggregation
- **Access**: Via Grafana Explore interface

### Promtail
- **Purpose**: Log collection and forwarding to Loki
- **Sources**: Docker containers, system logs

### Optional Components (monitoring-full profile)

#### Node Exporter (Port 9100)
- **Purpose**: Host system metrics (CPU, memory, disk, network)

#### cAdvisor (Port 8082)
- **Purpose**: Container metrics and resource usage

#### AlertManager (Port 9093)
- **URL**: http://localhost:9093
- **Purpose**: Alert routing and notification management

#### Postgres Exporter (Port 9187)
- **Purpose**: PostgreSQL-specific metrics

## 🎯 Alert Rules

Alert rules are defined in `prometheus/rules/alerts.yml`:

### Service Availability
- **ServiceDown**: Triggers when a service is down for 2+ minutes
- **HighErrorRate**: Triggers when error rate exceeds 5% for 5 minutes

### Database Health
- **ConnectionPoolExhausted**: 10+ clients waiting for connections
- **ConnectionPoolLow**: Idle connections drop below 20%

### Memory Usage
- **HighMemoryUsage**: Memory usage exceeds 90% for 5 minutes
- **CriticalMemoryUsage**: Memory usage exceeds 95% for 2 minutes

## 📈 Accessing Monitoring Tools

All monitoring tools are accessible from the ShadowCheck Admin Panel:

1. Navigate to `/admin` in the ShadowCheck web interface
2. Select the "Monitoring" tab for Grafana and Prometheus access
3. Select the "Logs" tab for Loki log viewer
4. Select the "Alerts" tab for real-time alert status

## 🔧 Configuration Files

```
docker/
├── prometheus/
│   ├── prometheus.yml          # Main Prometheus configuration
│   └── rules/
│       └── alerts.yml          # Alert rule definitions
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/        # Auto-provisioned data sources
│   │   └── dashboards/         # Auto-provisioned dashboards
│   └── dashboards/             # Dashboard JSON files
├── loki/
│   └── loki-config.yaml        # Loki configuration
├── promtail/
│   └── promtail-config.yaml    # Promtail configuration
└── alertmanager/
    └── alertmanager.yml        # AlertManager routing configuration
```

## 📊 Creating Custom Dashboards

### Option 1: Via Grafana UI
1. Open Grafana at http://localhost:3000
2. Click "+" → "Dashboard"
3. Add panels with PromQL queries
4. Save dashboard

### Option 2: JSON Files
1. Create a dashboard in Grafana
2. Export as JSON
3. Place in `docker/grafana/dashboards/`
4. Restart Grafana to auto-load

## 🔍 Useful PromQL Queries

### Service Health
```promql
up{job="shadowcheck-backend"}
```

### Memory Usage Percentage
```promql
(shadowcheck_memory_heap_used_bytes / shadowcheck_memory_heap_total_bytes) * 100
```

### Database Active Connections
```promql
shadowcheck_db_pool_total - shadowcheck_db_pool_idle
```

### Request Rate (per minute)
```promql
rate(shadowcheck_requests_total[1m]) * 60
```

### Error Rate
```promql
rate(shadowcheck_errors_total[5m])
```

## 📝 Log Queries (LogQL)

### View All Logs
```logql
{service="shadowcheck"}
```

### Filter by Log Level
```logql
{service="shadowcheck"} |= "ERROR"
```

### View Backend Logs
```logql
{container="shadowcheck_backend"}
```

### View Database Logs
```logql
{container="shadowcheck_postgres"}
```

## 🔒 Security Notes

- All services are bound to `127.0.0.1` (localhost only)
- Not accessible from external networks by default
- Use reverse proxy (nginx/traefik) for external access
- Configure AlertManager with proper notification channels
- Rotate Grafana admin password regularly

## 🐛 Troubleshooting

### Prometheus not scraping metrics
1. Check backend is running: `docker ps | grep backend`
2. Verify metrics endpoint: `curl http://localhost:5000/api/v1/health/metrics`
3. Check Prometheus targets: http://localhost:9091/targets

### Grafana datasource connection failed
1. Ensure Prometheus is running: `docker ps | grep prometheus`
2. Check network: `docker network inspect shadowcheck_network`
3. Verify datasource URL in Grafana settings

### No logs appearing in Loki
1. Check Promtail is running: `docker ps | grep promtail`
2. Verify Promtail config: `docker logs shadowcheck_promtail`
3. Check Loki ingestion: `curl http://localhost:3100/ready`

### Alerts not firing
1. Check alert rules: http://localhost:9091/rules
2. Verify alert conditions in `prometheus/rules/alerts.yml`
3. Check AlertManager (if enabled): http://localhost:9093

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [LogQL Documentation](https://grafana.com/docs/loki/latest/logql/)
