# pgAdmin Auto-Registration Configuration

## Overview
This directory contains configuration files to automatically register the PostgreSQL server in pgAdmin on startup.

## Files

### `servers.json`
Defines the PostgreSQL server connection. This file is mounted to `/pgadmin4/servers.json` in the container.

**Configuration:**
- **Name:** ShadowCheck Production
- **Host:** postgres (Docker service name)
- **Port:** 5432
- **Database:** shadowcheck
- **Username:** shadowcheck_user
- **PassFile:** Points to `/pgadmin4/pgpassfile` for automatic password authentication

### `pgpassfile`
PostgreSQL password file in the standard `.pgpass` format. This file is mounted to `/pgadmin4/pgpassfile` in the container.

**Format:**
```
hostname:port:database:username:password
```

**Security:**
- This file is gitignored to prevent committing passwords
- Must have 0600 permissions (set automatically)
- Regenerate if database password changes

## How It Works

1. pgAdmin container starts with these volumes mounted:
   ```yaml
   volumes:
     - ./pgadmin-config/servers.json:/pgadmin4/servers.json:ro
     - ./pgadmin-config/pgpassfile:/pgadmin4/pgpassfile:ro
   ```

2. Environment variable tells pgAdmin to load the server config:
   ```yaml
   PGADMIN_SERVER_JSON_FILE: '/pgadmin4/servers.json'
   ```

3. On first login to pgAdmin (http://localhost:8080):
   - Email: `admin@admin.com`
   - Password: `admin`
   - Server "ShadowCheck Production" appears automatically
   - No password prompt needed (uses pgpassfile)

## Regenerating pgpassfile

If the database password changes, regenerate with:

```bash
cat > pgadmin-config/pgpassfile <<EOF
postgres:5432:shadowcheck:shadowcheck_user:NEW_PASSWORD_HERE
*:*:*:shadowcheck_user:NEW_PASSWORD_HERE
EOF

chmod 600 pgadmin-config/pgpassfile
```

## Preserving Configuration

To prevent losing this setup:
1. **Never delete** `pgadmin-config/` directory
2. Keep `docker-compose.prod.yml` volume mounts intact
3. Commit `servers.json` to git (password-free)
4. Keep `pgpassfile` backed up securely (not in git)

## Troubleshooting

**Server not appearing:**
- Check container logs: `docker logs shadowcheck_pgadmin`
- Verify mounts: `docker exec shadowcheck_pgadmin ls -la /pgadmin4/`
- Ensure PGADMIN_SERVER_JSON_FILE env var is set

**Password prompts:**
- Verify pgpassfile format and permissions
- Check PassFile path in servers.json matches mount point
- Ensure password in pgpassfile matches database password
