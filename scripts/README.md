# ShadowCheck Scripts

Utility scripts for managing the ShadowCheck platform.

## Directory Structure

```
scripts/
├── docker/          # Docker stack management
├── monitoring/      # Monitoring stack (Prometheus, Grafana)
├── network/         # Network diagnostics and fixes
├── backup/          # Backup strategies
└── future_iterations/  # Development and deployment scripts
```

## Quick Reference

### Docker Stack Management (`docker/`)

- `start.sh` - Start production stack
- `stop.sh` - Stop production stack
- `restart.sh` - Restart production stack
- `restart-stack.sh` - Full stack restart with rebuilds
- `start-dev.sh` - Start development environment

**Usage:**
```bash
./scripts/docker/start.sh
./scripts/docker/stop.sh
```

### Monitoring (`monitoring/`)

- `monitoring-start.sh` - Start Prometheus/Grafana stack
- `monitoring-stop.sh` - Stop monitoring stack
- `monitoring-toggle.sh` - Toggle monitoring on/off

**Usage:**
```bash
./scripts/monitoring/monitoring-start.sh
# Access Grafana at http://localhost:3000
```

### Network Utilities (`network/`)

- `check-network.sh` - Diagnose network connectivity
- `network-update.sh` - Update network configuration
- `fix-docker-bridge.sh` - Fix Docker bridge network issues

**Usage:**
```bash
./scripts/network/check-network.sh
```

### Backup (`backup/`)

- `full_backup_strategy.sh` - Complete system backup

**Usage:**
```bash
./scripts/backup/full_backup_strategy.sh
```

### Future Iterations (`future_iterations/`)

Development and deployment scripts - use with caution.

## See Also

- `/docs/guides/QUICK_START.md` - Getting started guide
- `/docs/guides/TROUBLESHOOTING.md` - Common issues and fixes
- `/docs/README_SCRIPTS.md` - Detailed script documentation
