#!/bin/bash
# Stable restart script for ShadowCheck

echo "🔄 Restarting ShadowCheck stack..."

# Stop everything
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.yml stop grafana prometheus loki promtail pgadmin

# Start core services
docker-compose -f docker-compose.prod.yml up -d

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be healthy..."
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker exec shadowcheck_backend wget -qO- http://localhost:5000/api/v1/health 2>/dev/null | grep -q "ok"; then
        echo "✅ Backend is healthy"
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done

# Start monitoring
docker-compose -f docker-compose.yml up -d grafana prometheus loki promtail pgadmin

# Connect monitoring to prod network
echo "🔗 Connecting monitoring to prod network..."
for container in shadowcheck_grafana shadowcheck_prometheus shadowcheck_loki shadowcheck_promtail shadowcheck_pgadmin; do
    docker network connect shadowcheck_shadowcheck_internal_prod $container 2>/dev/null || true
done

# Copy latest frontend build
echo "📦 Deploying frontend..."
docker cp /home/nunya/shadowcheck/client/dist/. shadowcheck_frontend:/usr/share/nginx/html/

echo "✅ Stack restarted successfully"
echo "🌐 Frontend: http://localhost:5173"
echo "🌐 Backend: http://localhost:5000 (internal only)"
echo "🌐 Grafana: http://localhost:3000"
echo "🌐 pgAdmin: http://localhost:8080"
