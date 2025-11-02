# WiGLE Alpha v3 Pipeline Usage Guide

**Quick Reference**: How to fetch and import WiGLE Alpha v3 network data

---

## 🚀 Quick Start

### 1. Tag a BSSID for enrichment

```bash
curl -X POST http://localhost:5000/api/v1/wigle/tag \
  -H "Content-Type: application/json" \
  -d '{
    "bssids": ["CA:99:B2:1E:55:13", "AA:BB:CC:DD:EE:FF"],
    "reason": "suspicious network",
    "priority": 50
  }'
```

### 2. Process the queue (fetch from WiGLE API)

```bash
# Set your WiGLE API key
export WIGLE_API_KEY="your_wigle_api_key_here"

# Process up to 10 BSSIDs from queue
python3 server/pipelines/enrichment/wigle_api_alpha_v3.py --process-queue --limit 10
```

### 3. Import from existing JSON file

```bash
# If you already have Alpha v3 JSON response
python3 server/pipelines/enrichment/wigle_api_alpha_v3.py /path/to/response.json
```

---

## 📋 Pipeline Workflow

```
┌─────────────────┐
│  User Tags      │
│  BSSID via API  │
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│ bssid_enrichment_queue  │
│ status: 'pending'       │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│ wigle_api_alpha_v3.py   │
│ --process-queue         │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│ Fetch from WiGLE API    │
│ /api/v3/detail/network  │
└────────┬────────────────┘
         │
         v
┌─────────────────────────────────┐
│ import_wigle_alpha_v3_response()│
│ PostgreSQL function             │
└────────┬────────────────────────┘
         │
         ├─> wigle_alpha_v3_networks (1 row)
         │
         └─> wigle_alpha_v3_observations (937 rows)
                  │
                  v
         ┌──────────────────────────┐
         │ Dynamic SSID Clustering  │
         │ (at query time)          │
         └──────────────────────────┘
```

---

## 🔧 Usage Modes

### Mode 1: Import from JSON File

**Use case**: You already have Alpha v3 JSON responses (manual download, testing)

```bash
# Single file
python3 server/pipelines/enrichment/wigle_api_alpha_v3.py response_1762039938542.json

# From stdin (pipeline-friendly)
cat response_1762039938542.json | python3 server/pipelines/enrichment/wigle_api_alpha_v3.py -

# Batch import
for file in wigle_responses/*.json; do
    python3 server/pipelines/enrichment/wigle_api_alpha_v3.py "$file"
done
```

**Output**:
```
Reading from response_1762039938542.json...
✓ Imported network: CA:99:B2:1E:55:13
  - Networks: 1
  - Observations: 937

  SSID Clusters (dynamic analysis):
  - Delta3G: 476 obs, 37 days, 0.28km from home
    Pattern: stationary, Threat: LOW
  - Whitman1968: 461 obs, 30 days, 125.18km from home
    Pattern: mobile_hotspot, Threat: EXTREME

✓ Import complete!
```

### Mode 2: Process Enrichment Queue (Fetch from WiGLE)

**Use case**: Automated pipeline that fetches from WiGLE API

```bash
# Set API key (get from https://wigle.net/account)
export WIGLE_API_KEY="AIDxxxxxxxxxxxxxxxxxxxx"

# Process queue (fetches from WiGLE API)
python3 server/pipelines/enrichment/wigle_api_alpha_v3.py \
  --process-queue \
  --limit 10
```

**What happens**:
1. Queries `app.bssid_enrichment_queue` for `status='pending'`
2. For each BSSID:
   - Marks as `status='processing'`
   - Fetches from `https://api.wigle.net/api/v3/detail/network/{bssid}`
   - Calls `app.import_wigle_alpha_v3_response()`
   - Marks as `status='completed'` or `status='failed'`

---

## 🗄 Database Functions Used

### `app.import_wigle_alpha_v3_response(bssid, alpha_v3_json)`

**Purpose**: Import Alpha v3 JSON response into simplified schema

**Returns**: `(networks_imported, observations_imported)`

**What it does**:
1. Extracts root metadata → `wigle_alpha_v3_networks`
2. Flattens ALL location clusters → individual rows in `wigle_alpha_v3_observations`
3. Preserves SSID per observation (key for temporal tracking!)
4. Updates `bssid_enrichment_queue` status

**Example**:
```sql
-- Direct SQL call
SELECT * FROM app.import_wigle_alpha_v3_response(
    'CA:99:B2:1E:55:13',
    '{"networkId": "CA:99:B2:1E:55:13", ...}'::JSONB
);
```

---

## 📊 Query Results

### Check what's imported

```sql
-- Summary
SELECT
    COUNT(DISTINCT bssid) as networks,
    COUNT(*) as total_observations,
    MIN(query_timestamp)::date as oldest,
    MAX(query_timestamp)::date as newest
FROM app.wigle_alpha_v3_observations;
```

### View SSID clusters (dynamic!)

```sql
-- All networks with SSID rotation
SELECT
    bssid,
    ssid,
    observation_count,
    max_distance_from_home_km::NUMERIC(10,2) as max_km,
    mobility_pattern,
    threat_level
FROM app.wigle_alpha_v3_ssid_clusters
ORDER BY max_distance_from_home_km DESC;
```

### Check enrichment queue status

```sql
SELECT
    status,
    COUNT(*) as count
FROM app.bssid_enrichment_queue
GROUP BY status;
```

---

## 🔄 Automated Pipeline Setup

### Cron Job (runs every hour)

```bash
# Add to crontab
0 * * * * cd /app && /usr/bin/python3 server/pipelines/enrichment/wigle_api_alpha_v3.py --process-queue --limit 50 >> /var/log/wigle_enrichment.log 2>&1
```

### Docker Container Integration

```yaml
# docker-compose.prod.yml
services:
  wigle-enrichment:
    image: shadowcheck_backend
    command: >
      bash -c "
        while true; do
          python3 /app/server/pipelines/enrichment/wigle_api_alpha_v3.py --process-queue --limit 10
          sleep 3600
        done
      "
    environment:
      - WIGLE_API_KEY=${WIGLE_API_KEY}
      - PGHOST=postgres
      - PGDATABASE=shadowcheck
      - PGUSER=shadowcheck_user
      - PGPASSWORD=${DB_PASSWORD}
    depends_on:
      - postgres
```

### Systemd Service

```ini
# /etc/systemd/system/wigle-enrichment.service
[Unit]
Description=WiGLE Alpha v3 Enrichment Pipeline
After=network.target postgresql.service

[Service]
Type=simple
User=shadowcheck
WorkingDirectory=/home/shadowcheck/shadowcheck
Environment="WIGLE_API_KEY=AIDxxxxxxxxxx"
ExecStart=/usr/bin/python3 server/pipelines/enrichment/wigle_api_alpha_v3.py --process-queue --limit 100
Restart=always
RestartSec=3600

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable wigle-enrichment
sudo systemctl start wigle-enrichment
```

---

## 🧪 Testing

### Test with existing data

```bash
# Import the test file
python3 server/pipelines/enrichment/wigle_api_alpha_v3.py \
  /home/nunya/shadowcheck/response_1762039938542.json

# Verify import
psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c "
SELECT * FROM app.wigle_alpha_v3_ssid_clusters
WHERE bssid = 'CA:99:B2:1E:55:13';
"
```

### Test queue processing (without API calls)

```bash
# Tag a BSSID
curl -X POST http://localhost:5000/api/v1/wigle/tag \
  -H "Content-Type: application/json" \
  -d '{"bssids": ["CA:99:B2:1E:55:13"]}'

# Check queue
psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c "
SELECT * FROM app.bssid_enrichment_queue WHERE bssid = 'CA:99:B2:1E:55:13';
"
```

---

## 🔐 WiGLE API Key Setup

### Get API Key

1. Sign up at https://wigle.net/
2. Go to https://wigle.net/account
3. Generate API token under "Account" → "API Token"
4. Copy the token (format: `AID...`)

### Set in Environment

```bash
# For terminal session
export WIGLE_API_KEY="AIDxxxxxxxxxxxxxxxxxx"

# For Docker
# Add to .env file
WIGLE_API_KEY=AIDxxxxxxxxxxxxxxxxxx

# For systemd
# Add to service file Environment=
```

### API Rate Limits

WiGLE API limits:
- Free tier: ~100 queries/day
- Paid tier: Higher limits

**Recommendation**: Process queue in small batches (10-50 at a time)

---

## 📈 Monitoring

### Check pipeline health

```bash
# Recent imports
psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c "
SELECT
    query_timestamp::date as date,
    COUNT(DISTINCT bssid) as networks_imported,
    COUNT(*) as observations_imported
FROM app.wigle_alpha_v3_observations
GROUP BY query_timestamp::date
ORDER BY date DESC
LIMIT 7;
"

# Queue backlog
psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c "
SELECT
    status,
    COUNT(*) as count,
    MAX(tagged_at) as most_recent
FROM app.bssid_enrichment_queue
GROUP BY status;
"
```

### Error logs

```bash
# If using systemd
journalctl -u wigle-enrichment -n 50

# If using Docker
docker logs shadowcheck-wigle-enrichment

# If using cron
tail -f /var/log/wigle_enrichment.log
```

---

## 🚨 Troubleshooting

### "No 'networkId' field in JSON"

**Cause**: Invalid or incomplete Alpha v3 response
**Fix**: Verify JSON structure matches WiGLE Alpha v3 format

### "WIGLE_API_KEY environment variable not set"

**Cause**: API key not configured
**Fix**: `export WIGLE_API_KEY="AIDxxx..."`

### "psycopg2.OperationalError: connection to server"

**Cause**: Database not accessible
**Fix**: Check `PGHOST` (use `postgres` in Docker, `127.0.0.1` locally)

### "No pending BSSIDs in enrichment queue"

**Cause**: Queue is empty
**Fix**: Tag BSSIDs first via `/api/v1/wigle/tag`

---

## 📚 Related Documentation

- [WiGLE Alpha v3 Final Design](./WIGLE_ALPHA_V3_FINAL.md)
- [Schema Migration](../../schema/009_wigle_alpha_v3_simple.sql)
- [API Endpoints](../../server/routes/wigleEnrichment.ts)

---

**You can absolutely reuse the existing WiGLE pipeline infrastructure!** Just use the new `wigle_api_alpha_v3.py` script with the simplified schema. 🎯
