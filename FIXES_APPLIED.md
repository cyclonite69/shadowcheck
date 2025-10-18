# Fixes Applied - ShadowCheck Platform

## Date: October 17, 2025

### Issue 1: PostgreSQL Connection Pool Hanging & Timeout
**Status**: ✅ **RESOLVED**

#### Root Cause
The Docker bridge network `br-c92029280bb0` for `shadowcheck_shadowcheck_network` was missing its IPv4 gateway address (`172.18.0.1/16`). This prevented:
- docker-proxy from forwarding connections from `127.0.0.1:5432` to container IP `172.18.0.6:5432`
- All backend API database queries (resulted in connection timeout errors)
- Node.js pg library connections from hanging indefinitely

#### Symptoms
- Backend API endpoints returning: `Connection terminated due to connection timeout`
- Node.js pg library `pool.connect()` hanging forever without timeout
- `ECONNRESET` errors in backend logs
- TCP connections stuck in `SYN_SENT` state to `172.18.0.6:5432`
- psql connections from host machine timing out

#### Solution Applied
```bash
sudo ip addr add 172.18.0.1/16 dev br-c92029280bb0
```

#### Files Modified
- `/home/nunya/shadowcheck/.env`: Updated DATABASE_URL to use explicit IPv4 `127.0.0.1` instead of `localhost`
- `/home/nunya/shadowcheck/server/db.ts`: Previously added TCP keepAlive and increased timeouts (lines 19-20, 33-34)

#### Persistence Note
⚠️ **IMPORTANT**: The Docker bridge IP fix may not persist across system reboots. If database connections fail after reboot, run:
```bash
/home/nunya/shadowcheck/fix-docker-bridge.sh
```

#### Verification
```bash
# Test PostgreSQL connection
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -p 5432 -U shadowcheck_user -d shadowcheck -c "SELECT 1"

# Test backend API
curl http://localhost:5000/api/v1/health
curl http://localhost:5000/api/v1/analytics
```

---

### Issue 2: Grafana PostgreSQL Datasource Connection Failure
**Status**: ✅ **RESOLVED**

#### Root Cause
Grafana datasource was configured to connect to `postgres:5432`, but Docker DNS only resolves the actual container name `shadowcheck_postgres_18` (no network alias "postgres" exists).

#### Solution Applied
Updated Grafana datasource configuration to use correct container hostname.

#### Files Modified
- `/home/nunya/shadowcheck/docker/grafana/provisioning/datasources/datasources.yml`:
  - Changed `url: postgres:5432` to `url: shadowcheck_postgres_18:5432` (line 28)

#### Verification
```bash
# Check Grafana can resolve PostgreSQL hostname
docker exec shadowcheck_grafana nc -zv shadowcheck_postgres_18 5432

# Check PostgreSQL logs for Grafana connections (IP: 172.18.0.5)
docker logs shadowcheck_postgres_18 | grep "172.18.0.5"
```

---

### Issue 3: Duplicate BSSID Counting in Analytics
**Status**: ✅ **RESOLVED** (in previous session)

#### Root Cause
The `app.networks_legacy` table contains 154,997 rows but only 152,482 distinct BSSIDs (2,515 duplicates). Queries using `COUNT(*)` were returning inflated numbers.

#### Solution Applied
Updated all counting queries to use `COUNT(DISTINCT bssid)`.

#### Files Modified
- `/home/nunya/shadowcheck/server/index.ts`:
  - Line 175: Analytics endpoint now uses `COUNT(DISTINCT bssid)`
  - Line 332: Timeline endpoint now uses `COUNT(DISTINCT l.bssid)`

---

## System Status

### ✅ Working Services
- PostgreSQL: Accepting connections on `127.0.0.1:5432` and Docker network `172.18.0.6:5432`
- Backend API: All endpoints responding correctly
- Grafana: Dashboards can query PostgreSQL datasource
- Prometheus: Collecting metrics
- Loki: Aggregating logs

### API Endpoints Tested
- ✅ `/api/v1/health` - Returns database connection status
- ✅ `/api/v1/analytics` - Returns 137,640 observations, 152,482 distinct networks
- ✅ `/api/v1/networks` - Returns network list
- ✅ `/api/v1/timeline` - Returns 31 hourly data points by radio type
- ✅ `/api/v1/radio-stats` - Returns 4 radio type statistics

### Data Summary
- Total observations: **137,640** (distinct BSSID count from locations_legacy)
- Distinct networks: **152,482** (distinct BSSID count from networks_legacy)
- Geolocated observations: **137,640**
- Date range: March 2024 - October 2025

---

## Recommendations

1. **Make Docker bridge fix persistent**: Consider adding the bridge IP configuration to a systemd service or Docker network configuration file

2. **Update docker-compose.yml**: Add a network alias for PostgreSQL:
   ```yaml
   postgres:
     networks:
       shadowcheck_network:
         aliases:
           - postgres
   ```

3. **Monitor connection pool**: The current pool settings are:
   - Max connections: 20
   - Connection timeout: 60 seconds
   - Query timeout: 120 seconds
   - TCP keepAlive: enabled

4. **Database cleanup**: Consider deduplicating the 2,515 duplicate BSSIDs in `app.networks_legacy` table

---

## Commands for Quick Checks

```bash
# Check Docker bridge IP
ip addr show br-c92029280bb0 | grep "inet 172.18"

# Test PostgreSQL connection
curl -s http://localhost:5000/api/v1/health | jq .

# Check PostgreSQL connections
docker exec shadowcheck_postgres_18 psql -U postgres -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# View backend logs
tail -f /home/nunya/shadowcheck/logs/backend.log

# Check Grafana datasources
curl -s -u admin:KZQvo7+1Vj5lEw9P4dVwJi40OcHYA6kJR1iCULWza4k= \
  http://localhost:3000/api/datasources | jq '.[] | {name: .name, type: .type}'
```
