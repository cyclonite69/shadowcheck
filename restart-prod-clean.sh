#!/usr/bin/env bash
set -euo pipefail
echo "🔄 Restarting ShadowCheck Production..."
./stop-prod-clean.sh
sleep 3
./start-prod-clean.sh
