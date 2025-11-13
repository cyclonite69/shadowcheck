#!/bin/bash
#
# Grafana Stack Toggle - Start/Stop monitoring containers to save RAM
#
# Usage:
#   ./grafana-toggle.sh start
#   ./grafana-toggle.sh stop
#   ./grafana-toggle.sh status
#

set -e

MONITORING_SERVICES="prometheus loki promtail grafana"

case "$1" in
  start)
    echo "Starting Grafana monitoring stack..."
    docker compose up -d $MONITORING_SERVICES
    echo "✓ Monitoring stack started"
    docker compose ps $MONITORING_SERVICES
    ;;

  stop)
    echo "Stopping Grafana monitoring stack..."
    docker compose stop $MONITORING_SERVICES
    echo "✓ Monitoring stack stopped (containers preserved)"
    echo "  RAM has been freed. Run './grafana-toggle.sh start' to restart."
    ;;

  status)
    echo "Monitoring stack status:"
    docker compose ps $MONITORING_SERVICES
    ;;

  restart)
    echo "Restarting Grafana monitoring stack..."
    docker compose restart $MONITORING_SERVICES
    echo "✓ Monitoring stack restarted"
    ;;

  *)
    echo "Usage: $0 {start|stop|status|restart}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all monitoring containers (Grafana, Prometheus, Loki, Promtail)"
    echo "  stop     - Stop all monitoring containers to free RAM"
    echo "  status   - Show current status of monitoring containers"
    echo "  restart  - Restart all monitoring containers"
    exit 1
    ;;
esac
