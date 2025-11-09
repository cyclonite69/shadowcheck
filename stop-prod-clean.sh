#!/usr/bin/env bash
set -euo pipefail
echo "🛑 Stopping ShadowCheck Production..."
docker compose -f docker compose.prod.yml stop frontend backend pgadmin postgres
echo "✅ All services stopped"
docker compose -f docker compose.prod.yml ps
