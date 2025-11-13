# Grafana Configuration

This directory contains all Grafana configuration, secrets, dashboards, and provisioning files for the ShadowCheck monitoring stack.

## Directory Structure

```
docker/grafana/
├── README.md                    # This file
├── config/
│   └── grafana.ini             # Main Grafana configuration
├── dashboards/                  # JSON dashboard definitions
│   ├── shadowcheck-overview.json
│   ├── shadowcheck-networks.json
│   ├── shadowcheck-db.json
│   └── shadowcheck-api.json
├── provisioning/
│   ├── dashboards/
│   │   └── dashboards.yml      # Dashboard provisioning config
│   └── datasources/
│       ├── datasources.yml     # Data source provisioning (Prometheus, Loki, PostgreSQL)
│       └── postgresql.yml      # (deprecated - consolidated into datasources.yml)
└── secrets/
    ├── .gitignore              # Prevents secrets from being committed
    ├── grafana.env             # **ACTUAL SECRETS** (gitignored)
    └── grafana.env.example     # Template for secrets
```

## Setup Instructions

### 1. Configure Secrets

Copy the example secrets file and fill in your values:

```bash
cd docker/grafana/secrets
cp grafana.env.example grafana.env
# Edit grafana.env with your actual credentials
```

### 2. Important Secrets

Edit `docker/grafana/secrets/grafana.env` and update:

- `GF_SECURITY_ADMIN_PASSWORD` - Grafana admin password
- `GF_SECURITY_SECRET_KEY` - Random 32-character string for encryption
- `POSTGRES_DATASOURCE_PASSWORD` - Password for PostgreSQL data source
- SMTP settings (if using email alerts)

### 3. Generate Secure Secrets

Generate a secure admin password:
```bash
openssl rand -base64 32
```

Generate a secret key:
```bash
openssl rand -hex 32
```

### 4. Start Grafana

```bash
cd /home/nunya/shadowcheck
docker compose up -d grafana
```

### 5. Access Grafana

- URL: http://localhost:3000
- Username: admin
- Password: (from `GF_SECURITY_ADMIN_PASSWORD` in grafana.env)

## Configuration Files

### grafana.ini

Main Grafana configuration located at `config/grafana.ini`. Contains:

- Server settings (root_url, ports)
- Security settings (embedding, cookies)
- Anonymous access configuration
- Dashboard settings

### Data Sources

Configured in `provisioning/datasources/datasources.yml`:

1. **Prometheus** - Metrics and monitoring
   - URL: http://prometheus:9090
   - Default data source

2. **Loki** - Log aggregation
   - URL: http://loki:3100

3. **PostgreSQL** - ShadowCheck database
   - Host: shadowcheck_postgres_18:5432
   - Database: shadowcheck
   - User: shadowcheck_user
   - Password: From environment variable

### Dashboards

Pre-configured dashboards in `dashboards/`:

- **shadowcheck-overview.json** - System overview
- **shadowcheck-networks.json** - Network analysis
- **shadowcheck-db.json** - Database metrics
- **shadowcheck-api.json** - API performance

Dashboards are auto-provisioned from `provisioning/dashboards/dashboards.yml`.

## Security Best Practices

### Secrets Management

- ✅ **DO**: Keep secrets in `secrets/grafana.env` (gitignored)
- ✅ **DO**: Use strong, unique passwords
- ✅ **DO**: Rotate passwords regularly
- ❌ **DON'T**: Commit `grafana.env` to git
- ❌ **DON'T**: Use default passwords in production
- ❌ **DON'T**: Share secrets in chat or email

### Access Control

- Anonymous access is enabled for embedding dashboards
- Anonymous users have **Viewer** role (read-only)
- Admin access requires login
- Sign-up is disabled by default

### Network Security

- Grafana is bound to `127.0.0.1:3000` (localhost only)
- Access from external networks requires proxy (nginx/Caddy)
- Use HTTPS for production deployments

## Environment Variables

All environment variables are defined in `secrets/grafana.env`:

### Grafana Core Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `GF_SECURITY_ADMIN_USER` | Admin username | `admin` |
| `GF_SECURITY_ADMIN_PASSWORD` | Admin password | **CHANGE ME** |
| `GF_SECURITY_SECRET_KEY` | Encryption key | **CHANGE ME** |
| `GF_SERVER_ROOT_URL` | Base URL | `http://localhost:3000` |

### Data Source Credentials

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_DATASOURCE_PASSWORD` | PostgreSQL password | `your_password_here` |
| `POSTGRES_DATASOURCE_USER` | PostgreSQL user | `shadowcheck_user` |
| `POSTGRES_DATASOURCE_HOST` | PostgreSQL host | `shadowcheck_postgres_18` |
| `PROMETHEUS_URL` | Prometheus endpoint | `http://prometheus:9090` |
| `LOKI_URL` | Loki endpoint | `http://loki:3100` |

## Troubleshooting

### Grafana won't start

Check logs:
```bash
docker logs shadowcheck_grafana
```

Common issues:
- Missing `grafana.env` file
- Invalid environment variables
- Port 3000 already in use

### Data source connection failed

1. Verify PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Check network connectivity:
   ```bash
   docker exec shadowcheck_grafana ping shadowcheck_postgres_18
   ```

3. Verify credentials in `secrets/grafana.env`

### Dashboards not loading

1. Check provisioning configuration:
   ```bash
   docker exec shadowcheck_grafana ls /etc/grafana/provisioning/dashboards
   ```

2. Verify dashboard files:
   ```bash
   ls -la docker/grafana/dashboards/
   ```

3. Check Grafana logs for errors:
   ```bash
   docker logs shadowcheck_grafana | grep -i error
   ```

### Reset admin password

```bash
docker exec -it shadowcheck_grafana grafana-cli admin reset-admin-password newpassword
```

## Backup and Restore

### Backup Grafana Data

```bash
# Backup Grafana database (SQLite by default)
docker exec shadowcheck_grafana tar -czf /tmp/grafana-backup.tar.gz /var/lib/grafana
docker cp shadowcheck_grafana:/tmp/grafana-backup.tar.gz ./backups/

# Backup configuration
cp -r docker/grafana backups/grafana-config-$(date +%Y%m%d)
```

### Restore Grafana Data

```bash
# Restore from backup
docker stop shadowcheck_grafana
docker cp ./backups/grafana-backup.tar.gz shadowcheck_grafana:/tmp/
docker exec shadowcheck_grafana tar -xzf /tmp/grafana-backup.tar.gz -C /
docker start shadowcheck_grafana
```

## Adding New Dashboards

### Method 1: Web UI

1. Log in to Grafana
2. Create dashboard in the UI
3. Click "Save" → "Export" → "Save to file"
4. Save JSON to `docker/grafana/dashboards/`
5. Restart Grafana to provision:
   ```bash
   docker restart shadowcheck_grafana
   ```

### Method 2: API

```bash
# Export existing dashboard
curl -u admin:password http://localhost:3000/api/dashboards/uid/DASHBOARD_UID | jq '.dashboard' > new-dashboard.json

# Move to dashboards directory
mv new-dashboard.json docker/grafana/dashboards/
```

## Upgrading Grafana

1. **Backup current configuration and data** (see Backup section)

2. Update image version in `docker-compose.yml`:
   ```yaml
   grafana:
     image: grafana/grafana:11.0.0  # Change version here
   ```

3. Pull new image and restart:
   ```bash
   docker compose pull grafana
   docker compose up -d grafana
   ```

4. Check logs for errors:
   ```bash
   docker logs -f shadowcheck_grafana
   ```

## Additional Resources

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Provisioning Documentation](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [PostgreSQL Data Source](https://grafana.com/docs/grafana/latest/datasources/postgres/)
- [Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)
