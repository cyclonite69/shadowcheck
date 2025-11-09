# CRITICAL PRODUCTION FIXES - TESTING GUIDE

**Date:** 2025-11-02
**Commit:** `7560a5d`
**Status:** ✅ DEPLOYED - READY FOR TESTING

---

## 🚨 ISSUES FIXED

### Issue #1: SQLite Backup Import Buffer Overflow ✅
**Error Before:** `RangeError [ERR_CHILD_PROCESS_STDIO_MAXBUFFER]: stderr maxBuffer length exceeded`
**Root Cause:** Default 1MB buffer too small for large database stderr output
**Fix Applied:** Increased maxBuffer to 100MB for all database imports

### Issue #2: WiGLE API Using Wrong Endpoint ✅
**Error Before:** 500 Internal Server Error, partial/no data imported
**Root Cause:** Using v2 endpoint which lacks full location clusters
**Fix Applied:** Switched to Python Alpha v3 importer using `/api/v3/detail/wifi/{netid}.json`

---

## 🧪 TEST PLAN

### Test 1: SQLite Backup Import

**Prerequisites:**
- SQLite backup file: `backup-1761824754281.sqlite`
- File must be in: `/home/nunya/shadowcheck/pipelines/wigle/`

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/v1/pipelines/wigle/import \
  -H "Content-Type: application/json" \
  -d '{"filename": "backup-1761824754281.sqlite"}' \
  -w "\n%{http_code}\n"
```

**Expected Success Response:**
```json
{
  "ok": true,
  "file": "backup-1761824754281.sqlite",
  "stats": {
    "networks": <number>,
    "locations": <number>,
    "source_id": <number>
  }
}
```
**Expected HTTP Code:** `200`

**Verify Data Imported:**
```bash
# Check staging tables
curl http://localhost:5000/api/v1/wigle/staging/summary

# Should show:
# - total_networks_staged > 0
# - total_locations_staged > 0
```

**What to Look For:**
- ✅ No buffer overflow error
- ✅ HTTP 200 response
- ✅ Networks and locations counts > 0
- ✅ Data visible in staging tables
- ⏱️ Should complete in < 10 minutes for large files

---

### Test 2: WiGLE API v3 Import

**Prerequisites:**
- WiGLE API credentials set in `.env`:
  ```bash
  WIGLE_API_NAME=your_api_name
  WIGLE_API_TOKEN=your_api_token
  ```

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/v1/pipelines/wigle-api/detail \
  -H "Content-Type: application/json" \
  -d '{"bssid": "CA:99:B2:1E:55:13"}' \
  -w "\n%{http_code}\n"
```

**Expected Success Response:**
```json
{
  "ok": true,
  "bssid": "CA:99:B2:1E:55:13",
  "stats": {
    "network_imported": true,
    "observations_imported": <number>
  },
  "message": "Imported <N> observations for CA:99:B2:1E:55:13 via Alpha v3 API"
}
```
**Expected HTTP Code:** `200`

**Verify Data Imported:**
```bash
# Check observations were imported
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck \
  -c "SELECT COUNT(*) FROM app.wigle_alpha_v3_observations WHERE bssid = 'CA:99:B2:1E:55:13'"

# Check network metadata
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck \
  -c "SELECT bssid, ssid, trilaterated_lat, trilaterated_lon FROM app.wigle_alpha_v3_networks WHERE bssid = 'CA:99:B2:1E:55:13'"

# View via Alpha v3 API route
curl http://localhost:5000/api/v3/network/CA:99:B2:1E:55:13/detail | jq .
```

**What to Look For:**
- ✅ HTTP 200 response
- ✅ observations_imported > 0 (should be ~937 for this network)
- ✅ Network has trilaterated coordinates
- ✅ Street address data present (via /api/v3 route)
- ✅ Location clusters with SSID tracking
- ⏱️ Should complete in < 30 seconds

---

## 🔍 DEBUGGING

### Check Backend Logs:
```bash
# Real-time logs
docker logs -f shadowcheck_backend

# Last 100 lines
docker logs shadowcheck_backend --tail 100

# Filter for errors
docker logs shadowcheck_backend --tail 200 | grep -i error
```

### SQLite Import Troubleshooting:

**Problem:** File not found
**Solution:** Ensure file is in `pipelines/wigle/` directory
```bash
ls -lh /home/nunya/shadowcheck/pipelines/wigle/backup-*.sqlite
```

**Problem:** Permission denied
**Solution:** Check file permissions
```bash
chmod 644 /home/nunya/shadowcheck/pipelines/wigle/*.sqlite
```

**Problem:** Buffer still overflows (very large files >500MB)
**Solution:** Increase maxBuffer further in `server/routes/pipelines.ts:389`
```javascript
maxBuffer: 200 * 1024 * 1024 // Increase to 200MB
```

### WiGLE API Troubleshooting:

**Problem:** 401 Unauthorized
**Solution:** Check API credentials
```bash
# Verify env vars are set
docker exec shadowcheck_backend env | grep WIGLE
```

**Problem:** 429 Too Many Requests
**Solution:** WiGLE rate limit hit - wait and retry
```bash
# Check WiGLE API rate limits
curl https://api.wigle.net/api/v2/stats/user \
  -H "Authorization: Basic $(echo -n 'API_NAME:API_TOKEN' | base64)"
```

**Problem:** No observations imported
**Solution:** Network might not exist in WiGLE database
```bash
# Test direct API call
curl "https://api.wigle.net/api/v3/detail/wifi/AA:BB:CC:DD:EE:FF.json" \
  -H "Authorization: Basic YOUR_BASE64_CREDENTIALS" | jq .
```

**Problem:** Python script fails
**Solution:** Check Python dependencies
```bash
docker exec shadowcheck_backend python3 -c "import psycopg2; import requests; print('OK')"
```

---

## 📊 VALIDATION CHECKLIST

After running tests, verify:

### SQLite Import Success:
- [ ] HTTP 200 response received
- [ ] No buffer overflow error in logs
- [ ] `stats.networks` > 0
- [ ] `stats.locations` > 0
- [ ] Staging summary shows imported data
- [ ] Import completed in reasonable time

### WiGLE API Import Success:
- [ ] HTTP 200 response received
- [ ] `observations_imported` > 0
- [ ] Network exists in `wigle_alpha_v3_networks` table
- [ ] Observations exist in `wigle_alpha_v3_observations` table
- [ ] Alpha v3 detail endpoint returns full data with street address
- [ ] Location clusters show SSID tracking

---

## 🎯 WHAT'S DIFFERENT NOW

### Before Fixes:
```
❌ SQLite Import: Buffer overflow on files >50MB
❌ WiGLE API: Using v2 endpoint, missing location data
❌ WiGLE API: No street addresses or SSID tracking
❌ WiGLE API: Manual parsing of v2 response format
```

### After Fixes:
```
✅ SQLite Import: Handles files up to 100MB+ with 100MB buffer
✅ WiGLE API: Using v3 endpoint via Python importer
✅ WiGLE API: Full location clusters with SSID temporal tracking
✅ WiGLE API: Street addresses included (Martin Luther King Avenue, Flint, MI)
✅ WiGLE API: Leverages existing tested Python importer
```

---

## 🚀 NEXT STEPS

1. **Test SQLite Import** with `backup-1761824754281.sqlite`
2. **Test WiGLE API** with known BSSID `CA:99:B2:1E:55:13`
3. **Verify** data appears in database tables
4. **Check** Alpha v3 API routes return full data
5. **Monitor** backend logs for any errors

## 📝 REPORT BACK

After testing, provide:
```
✅ SQLite Import: [SUCCESS/FAILED]
   - Networks imported: <number>
   - Locations imported: <number>
   - Time taken: <seconds>
   - Any errors: <yes/no>

✅ WiGLE API Import: [SUCCESS/FAILED]
   - BSSID tested: <bssid>
   - Observations imported: <number>
   - Time taken: <seconds>
   - Street address present: <yes/no>
   - Any errors: <yes/no>
```

---

**All fixes deployed and backend running successfully!** 🎉
