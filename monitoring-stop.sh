#!/bin/bash
# Stop ShadowCheck monitoring stack (keeps data volumes)

echo "🛑 Stopping monitoring services..."
docker-compose -f docker-compose.yml stop pgadmin prometheus grafana loki promtail

echo ""
echo "✅ Monitoring stack stopped!"
echo ""
echo "Containers stopped (data preserved):"
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -E "(grafana|prometheus|pgadmin|loki|promtail|NAMES)"
echo ""
echo "To start again: ./monitoring-start.sh"
echo "To remove completely: ./monitoring-remove.sh"

