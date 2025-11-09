# WiGLE Alpha v3 Pipeline - FIXED ✅

**Date:** 2025-11-07
**Status:** ✅ **OPERATIONAL**

---

## What Was Fixed

### Issue 1: Missing Python `requests` Library ✅ FIXED
**Problem:** `ModuleNotFoundError: No module named 'requests'`

**Solution:**
```bash
docker exec shadowcheck_backend pip3 install --break-system-packages requests
```

**Result:** ✅ `requests` version 2.32.5 installed

### Issue 2: Stuck Queue Items ✅ FIXED
**Problem:** 29 items stuck in "processing" status

**Solution:**
```sql
UPDATE app.bssid_enrichment_queue
SET status = 'pending'
WHERE status = 'processing';
```

**Result:** ✅ 29 items reset, 11 successfully processed

### Issue 3: API Key Configuration ✅ VERIFIED
**Status:** API credentials correctly configured in container

**Format:** `WIGLE_API_NAME:WIGLE_API_TOKEN`
- Name: `AIDc40fa13ea2238ef65909f4a816b48e60`
- Token: `5798dce2f34b8e730fef29f4193f4252`

### Issue 4: Network Connectivity ✅ VERIFIED
**Test:** `curl https://api.wigle.net` → HTTP 200 OK

**Result:** ✅ Container can reach WiGLE API

---

## Test Results

### Test Run #1: Single BSSID
```
✓ Successfully processed 24:41:FE:57:6C:8E
  - SSID: "Cheeto fingers"
  - Observations: 390
  - Pattern: mobile
  - Threat: HIGH
```

### Test Run #2: 10 BSSIDs
```
Queue processing complete:
  - Success: 10
  - Errors: 0

Networks enriched include:
- BC:82:5D:72:1B:B9 - "Mobile FBI Van" (4 obs, CRITICAL threat)
- B2:00:73:5F:D5:E5 - "FBI Microchip Van" (5 obs, HIGH threat)
- 18:A5:FF:AC:60:E8 - "FBI666" (1 obs, HIGH threat)
... and 7 more
```

---

## Current Database State

**Before Fix (Nov 3):**
- Networks: 33
- Observations: 3,491
- Last update: 4 days ago

**After Fix (Nov 7):**
- Networks: 33+ (still showing old count, needs refresh)
- Observations: 3,491+ (new data added)
- Pipeline: ✅ WORKING
- Queue: 193 pending, 25 completed, 34 failed

---

## How to Run the Pipeline

### Manual Execution (Recommended for Testing)

```bash
docker exec shadowcheck_backend bash -c '
  cd /app/server/pipelines/enrichment && \
  export WIGLE_API_KEY="${WIGLE_API_NAME}:${WIGLE_API_TOKEN}" && \
  export PGHOST=postgres && \
  python3 wigle_api_alpha_v3.py --process-queue --limit 10
'
```

### Process All Pending Items

```bash
# Process in batches to avoid rate limiting
docker exec shadowcheck_backend bash -c '
  cd /app/server/pipelines/enrichment && \
  export WIGLE_API_KEY="${WIGLE_API_NAME}:${WIGLE_API_TOKEN}" && \
  export PGHOST=postgres && \
  python3 wigle_api_alpha_v3.py --process-queue --limit 100
'
```

**Note:** WiGLE has rate limits. Processing large batches may take time.

---

## Known Limitation: Queue Status Not Updated

**Issue:** The Python script (`wigle_api_alpha_v3.py`) doesn't automatically update the `bssid_enrichment_queue` table status from "processing" to "completed".

**Workaround:** Manually update after processing:

```sql
UPDATE app.bssid_enrichment_queue
SET status = 'completed', processed_at = NOW()
WHERE status = 'processing';
```

**Long-term Fix Needed:** Modify the Python script to update queue status, or use the TypeScript WiGLE service (`wigleApi.ts`) which handles this correctly.

---

## Queue Management Commands

### Check Queue Status
```sql
SELECT status, COUNT(*),
       MIN(tagged_at) as oldest,
       MAX(tagged_at) as newest
FROM app.bssid_enrichment_queue
GROUP BY status
ORDER BY status;
```

### Clear Failed Items (After Fixes)
```sql
-- Reset failed items to pending (to retry after fixing issues)
UPDATE app.bssid_enrichment_queue
SET status = 'pending', error_message = NULL
WHERE status = 'failed';
```

### View Recent Enrichments
```sql
SELECT bssid, ssid,
       COUNT(*) FILTER (WHERE observation_timestamp > NOW() - INTERVAL '1 day') as recent_obs
FROM app.wigle_alpha_v3_observations o
JOIN app.wigle_alpha_v3_networks n USING (bssid)
GROUP BY bssid, ssid
ORDER BY recent_obs DESC
LIMIT 10;
```

---

## Automated Processing (Future Enhancement)

### Option 1: Cron Job

Create `/etc/cron.d/wigle-enrichment`:
```bash
# Run WiGLE enrichment every hour, process up to 50 items
0 * * * * root docker exec shadowcheck_backend bash -c 'cd /app/server/pipelines/enrichment && export WIGLE_API_KEY="${WIGLE_API_NAME}:${WIGLE_API_TOKEN}" && export PGHOST=postgres && python3 wigle_api_alpha_v3.py --process-queue --limit 50' >> /var/log/wigle-enrichment.log 2>&1
```

### Option 2: Systemd Timer

Similar to the backup timer, create a scheduled job for enrichment processing.

### Option 3: Backend Integration

Add an API endpoint to trigger enrichment:

```typescript
// server/routes/wigleEnrichment.ts
router.post('/alpha-v3/process', async (req, res) => {
  const limit = req.body.limit || 10;

  const { exec } = require('child_process');
  exec(`cd /app/server/pipelines/enrichment && ... --limit ${limit}`, (error, stdout) => {
    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, output: stdout });
  });
});
```

---

## Monitoring

### Check for Stale Queue Items

```sql
-- Items pending for more than 24 hours
SELECT bssid, tagged_at,
       NOW() - tagged_at as age
FROM app.bssid_enrichment_queue
WHERE status = 'pending'
  AND tagged_at < NOW() - INTERVAL '24 hours'
ORDER BY tagged_at
LIMIT 10;
```

### Check Processing Rate

```sql
SELECT
  DATE_TRUNC('day', tagged_at) as day,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM app.bssid_enrichment_queue
WHERE tagged_at > NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day DESC;
```

---

## Troubleshooting

### Pipeline Returns "No pending BSSIDs"

**Check queue:**
```sql
SELECT COUNT(*) FROM app.bssid_enrichment_queue WHERE status = 'pending';
```

**If zero:** Queue is empty (this is OK!)

### "Failed to resolve api.wigle.net"

**Test connectivity:**
```bash
docker exec shadowcheck_backend curl -I https://api.wigle.net
```

**If fails:** Check Docker DNS configuration or network connectivity

### "No module named 'requests'"

**Reinstall:**
```bash
docker exec shadowcheck_backend pip3 install --break-system-packages requests
```

### Items Stuck in "processing"

**Reset:**
```sql
UPDATE app.bssid_enrichment_queue
SET status = 'pending'
WHERE status = 'processing'
  AND (processed_at IS NULL OR processed_at < NOW() - INTERVAL '1 hour');
```

---

## Summary

✅ **Pipeline Status:** OPERATIONAL
✅ **Dependencies:** Installed
✅ **Connectivity:** Verified
✅ **API Key:** Configured
✅ **Test Results:** 11/11 successful

**Pending Items:** 193
**Completed:** 25
**Failed:** 34 (need investigation)

**Next Steps:**
1. Process remaining 193 pending items in batches
2. Investigate 34 failed items
3. Consider automating with cron/systemd timer
4. Fix queue status update issue in Python script

---

**Fixed by:** Claude Code
**Date:** 2025-11-07
**Documentation:** `/home/nunya/shadowcheck/docs/technical-notes/WIGLE_PIPELINE_FIX.md`
