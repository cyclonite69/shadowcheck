#!/bin/bash
# Toggle ShadowCheck monitoring stack on/off

# Check if monitoring is running
if docker ps | grep -q "shadowcheck_grafana"; then
    echo "🛑 Monitoring is currently RUNNING - stopping..."
    docker-compose -f docker-compose.yml stop pgadmin prometheus grafana loki promtail
    echo ""
    echo "✅ Monitoring stopped (data preserved)"
    echo "Run ./monitoring-toggle.sh again to start"
else
    echo "🚀 Monitoring is currently STOPPED - starting..."
    docker-compose -f docker-compose.yml up -d pgadmin prometheus grafana loki promtail
    echo ""
    echo "✅ Monitoring started!"
    echo ""
    echo "Access URLs:"
    echo "  📊 Grafana:     http://localhost:3000"
    echo "  📈 Prometheus:  http://localhost:9091"
    echo "  🗄️  pgAdmin:     http://localhost:8080"
fi

echo ""
echo "Current status:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(grafana|prometheus|pgadmin|loki|promtail|NAMES)" || echo "No monitoring containers running"

