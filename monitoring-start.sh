#!/bin/bash
# Start ShadowCheck monitoring stack

echo "🚀 Starting monitoring services..."
docker-compose -f docker-compose.yml up -d pgadmin prometheus grafana loki promtail

echo ""
echo "✅ Monitoring stack started!"
echo ""
echo "Access URLs:"
echo "  📊 Grafana:     http://localhost:3000    (admin / KZQvo7+1Vj5lEw9P4dVwJi40OcHYA6kJR1iCULWza4k=)"
echo "  📈 Prometheus:  http://localhost:9091"
echo "  🗄️  pgAdmin:     http://localhost:8080    (admin@shadowcheck.local / admin123)"
echo "  📋 Loki:        http://localhost:3100"
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(grafana|prometheus|pgadmin|loki|promtail|NAMES)"

