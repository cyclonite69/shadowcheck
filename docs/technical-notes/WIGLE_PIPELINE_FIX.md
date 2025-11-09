# WiGLE API Pipeline Investigation & Fix

**Date:** 2025-11-07
**Issue:** WiGLE Alpha v3 pipeline states success but no longer pulls/downloads/inserts data
**Status:** ✅ ROOT CAUSES IDENTIFIED

---

## Investigation Summary

### Problem Description
The WiGLE API Alpha v3 enrichment pipeline reports success but doesn't actually fetch or insert data into the database tables.

### Root Causes Found

#### 1. **Missing Python `requests` Library** ❌
**Error:** `No module named 'requests'`

**Evidence:**
```sql
SELECT bssid, error_message FROM app.bssid_enrichment_queue
WHERE status = 'failed' AND error_message LIKE '%requests%';
```

Results show recent failures (Nov 6-7):
```
8E:F4:4A:3E:77:ED | No module named 'requests'
CA:99:B2:1D:B7:2B | No module named 'requests'
CA:99:B2:2E:55:12 | No module named 'requests'
```

**Root Cause:** The Python script `/home/nunya/shadowcheck/server/pipelines/enrichment/wigle_api_alpha_v3.py` requires the `requests` library (line 123), but it's not installed in the Python environment used by the backend.

#### 2. **DNS Resolution Failures** ❌
**Error:** `Failed to resolve 'api.wigle.net'`

**Evidence:**
```
Failed to resolve 'api.wigle.net' ([Errno -3] Temporary failure in name resolution)
```

**Root Cause:** Network connectivity issues or Docker DNS configuration preventing API access.

#### 3. **Stuck Queue Items** ❌
**Issue:** 29 enrichment queue items stuck in "processing" status

**Evidence:**
```sql
SELECT status, COUNT(*) FROM app.bssid_enrichment_queue GROUP BY status;
```
Results:
- `processing`: 29 (stuck - likely from crashed runs)
- `pending`: 175
- `failed`: 34
- `completed`: 14

**Root Cause:** Pipeline crashes or interruptions left items in "processing" state instead of completing or failing.

#### 4. **Last Successful Run** ⏰
**Last Activity:** November 3, 2025 at 14:34:37 UTC (4 days ago)

```sql
SELECT MAX(query_timestamp) FROM app.wigle_alpha_v3_networks;
-- Result: 2025-11-03 14:34:37.018414+00
```

---

## Database State Analysis

### Current Data

**wigle_alpha_v3_networks:**
- 33 networks enriched
- Last update: 2025-11-03

**wigle_alpha_v3_observations:**
- 3,491 observations stored

**bssid_enrichment_queue:**
- 204 pending (after reset from 175)
- 34 failed
- 14 completed
- 0 processing (after reset from 29)

### Queue Status Breakdown

| Status | Count | Action Needed |
|--------|-------|---------------|
| `pending` | 204 | Ready to process |
| `failed` | 34 | Investigate errors |
| `completed` | 14 | No action |
| `processing` | 0 | ✅ Reset to pending |

---

## Understanding the Two WiGLE Systems

ShadowCheck has TWO separate WiGLE integration systems:

### System 1: WiGLE API v2 (TypeScript)
**Location:** `/home/nunya/shadowcheck/server/services/wigleApi.ts`

**Tables:**
- `app.wigle_api_networks_staging`
- `app.wigle_api_locations_staging`

**API Endpoint:** `https://api.wigle.net/api/v2/network/search`

**Usage:** Called from TypeScript/Express routes
- Route: `/api/v1/wigle/enrich`
- Uses `fetch()` API (built-in to Node.js)
- NO Python dependencies

**Status:** ✅ Should be working (no `requests` library needed)

### System 2: WiGLE Alpha v3 API (Python)
**Location:** `/home/nunya/shadowcheck/server/pipelines/enrichment/wigle_api_alpha_v3.py`

**Tables:**
- `app.wigle_alpha_v3_networks`
- `app.wigle_alpha_v3_observations`

**API Endpoint:** `https://api.wigle.net/api/v3/detail/wifi/{BSSID}`

**Usage:** Python script for detailed network history
- Called via Python subprocess
- Uses PostgreSQL function: `app.import_wigle_alpha_v3_response()`
- **Requires Python `requests` library** ❌

**Status:** ❌ BROKEN - Missing dependencies

---

## Fixes Applied

### Fix 1: Reset Stuck Queue Items ✅

**Action Taken:**
```sql
UPDATE app.bssid_enrichment_queue
SET status = 'pending'
WHERE status = 'processing';
```

**Result:** 29 items reset to `pending`, now ready for retry

**Impact:** Queue can now process these items again

---

## Fixes Needed

### Fix 2: Install Python `requests` Library

**Option A: Install system-wide (recommended)**
```bash
pip3 install requests
# or
python3 -m pip install requests
```

**Option B: Install in Docker container (if backend runs in Docker)**
```bash
# Add to Dockerfile
RUN pip3 install requests

# Or install manually in running container
docker exec shadowcheck_backend pip3 install requests
```

**Option C: Create requirements.txt**
```bash
# Create /home/nunya/shadowcheck/server/pipelines/requirements.txt
echo "requests>=2.28.0" > server/pipelines/requirements.txt
echo "psycopg2-binary>=2.9.0" >> server/pipelines/requirements.txt

# Install
pip3 install -r server/pipelines/requirements.txt
```

### Fix 3: Verify DNS/Network Connectivity

**Test WiGLE API access:**
```bash
curl -I https://api.wigle.net
```

**Expected:** HTTP 200 or 301

**If fails:**
- Check `/etc/resolv.conf` for DNS servers
- Test DNS: `nslookup api.wigle.net`
- Check firewall rules
- Verify Docker network configuration if backend runs in container

### Fix 4: Test Pipeline Manually

**Test WiGLE Alpha v3 script:**
```bash
cd /home/nunya/shadowcheck/server/pipelines/enrichment

# Set environment variables
export WIGLE_API_KEY="your_api_key_here"
export PGHOST="localhost"  # or "postgres" if in Docker
export PGDATABASE="shadowcheck"
export PGUSER="shadowcheck_user"
export PGPASSWORD="DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8="

# Process 1 item from queue
python3 wigle_api_alpha_v3.py --process-queue --limit 1
```

**Expected output:**
```
Processing 1 BSSIDs from enrichment queue...

Fetching XX:XX:XX:XX:XX:XX from WiGLE Alpha v3 API...
✓ Imported network: XX:XX:XX:XX:XX:XX
  - Networks: 1
  - Observations: 150

Queue processing complete:
  - Success: 1
  - Errors: 0
```

### Fix 5: Check API Key Configuration

**Verify API key is set:**
```bash
echo $WIGLE_API_KEY
```

**If not set, add to environment:**
```bash
# Add to ~/.bashrc or /etc/environment
export WIGLE_API_KEY="your_wigle_api_key_here"
```

**Or configure in Docker:**
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - WIGLE_API_KEY=${WIGLE_API_KEY}
```

---

## Verification Steps

### Step 1: Verify `requests` is installed
```bash
python3 -c "import requests; print('✓ requests installed:', requests.__version__)"
```

### Step 2: Test network connectivity
```bash
curl -I https://api.wigle.net/api/v3/detail/wifi/AA:BB:CC:DD:EE:FF
```

### Step 3: Check queue status
```sql
SELECT status, COUNT(*)
FROM app.bssid_enrichment_queue
GROUP BY status;
```

### Step 4: Trigger enrichment manually
```bash
# Via API (TypeScript system)
curl -X POST http://localhost:3001/api/v1/wigle/enrich

# Via Python script (Alpha v3 system)
cd /home/nunya/shadowcheck/server/pipelines/enrichment
python3 wigle_api_alpha_v3.py --process-queue --limit 5
```

### Step 5: Verify data inserted
```sql
-- Check last enrichment
SELECT MAX(query_timestamp), COUNT(*)
FROM app.wigle_alpha_v3_networks;

-- Check observations
SELECT COUNT(*)
FROM app.wigle_alpha_v3_observations
WHERE observation_timestamp > NOW() - INTERVAL '1 hour';
```

---

## Recommended Action Plan

### Immediate (Today)

1. **Install `requests` library**
   ```bash
   pip3 install requests psycopg2-binary
   ```

2. **Test network connectivity**
   ```bash
   curl https://api.wigle.net
   ```

3. **Verify API key is configured**
   ```bash
   echo $WIGLE_API_KEY
   ```

4. **Run manual test**
   ```bash
   cd /home/nunya/shadowcheck/server/pipelines/enrichment
   python3 wigle_api_alpha_v3.py --process-queue --limit 1
   ```

### Short Term (This Week)

1. **Create requirements.txt** for Python dependencies
2. **Document API key setup** in deployment docs
3. **Add health check** for WiGLE API connectivity
4. **Clear failed items** after fixing root causes

### Long Term (Next Month)

1. **Containerize Python pipelines** with proper dependency management
2. **Add monitoring** for queue processing
3. **Implement retry logic** with exponential backoff
4. **Add alerting** when queue gets backed up (> 100 pending)

---

## Error Analysis

### Recent Failures Breakdown

| Error Type | Count | Time Period | Status |
|------------|-------|-------------|--------|
| `No module named 'requests'` | 4 | Nov 6-7 | Fix: Install requests |
| `Failed to resolve api.wigle.net` | 6 | Nov 3-4 | Fix: Check DNS/network |
| Stuck in processing | 29 | Unknown | ✅ Fixed: Reset to pending |

---

## Monitoring Commands

### Check queue health
```sql
-- Queue summary
SELECT status, COUNT(*),
       MIN(tagged_at) as oldest,
       MAX(tagged_at) as newest
FROM app.bssid_enrichment_queue
GROUP BY status
ORDER BY status;

-- Recent failures
SELECT bssid, error_message, tagged_at
FROM app.bssid_enrichment_queue
WHERE status = 'failed'
ORDER BY tagged_at DESC
LIMIT 10;

-- Processing rate
SELECT
  DATE_TRUNC('hour', tagged_at) as hour,
  COUNT(*) as tagged,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
FROM app.bssid_enrichment_queue
WHERE tagged_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Check enrichment success rate
```sql
SELECT
  COUNT(*) FILTER (WHERE wigle_records_found > 0) * 100.0 / NULLIF(COUNT(*), 0) as success_rate,
  AVG(wigle_records_found) as avg_records_per_bssid,
  AVG(wigle_locations_found) as avg_locations_per_bssid
FROM app.bssid_enrichment_queue
WHERE status = 'completed';
```

---

## Prevention

### Add Dependency Check

Create a pre-flight check script:

```python
#!/usr/bin/env python3
# check_dependencies.py

import sys

required = ['requests', 'psycopg2']
missing = []

for module in required:
    try:
        __import__(module)
    except ImportError:
        missing.append(module)

if missing:
    print(f"ERROR: Missing Python modules: {', '.join(missing)}")
    print(f"Install with: pip3 install {' '.join(missing)}")
    sys.exit(1)

print("✓ All dependencies installed")
```

### Add to Backend Startup

```typescript
// server/index.ts
import { exec } from 'child_process';

// Check Python dependencies on startup
exec('python3 check_dependencies.py', (error, stdout, stderr) => {
  if (error) {
    console.error('⚠️  Python dependencies missing:', stderr);
    console.warn('WiGLE Alpha v3 enrichment may not work');
  } else {
    console.log('✓ Python dependencies OK');
  }
});
```

---

## Next Steps

1. ✅ Queue items reset (29 items from `processing` → `pending`)
2. ⏳ Install `requests` library
3. ⏳ Test manual enrichment
4. ⏳ Verify API key configuration
5. ⏳ Process pending queue
6. ⏳ Monitor for new failures

---

**Investigation completed:** 2025-11-07
**Status:** Root causes identified, fixes documented
**Next:** Apply fixes and test
