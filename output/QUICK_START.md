# SHADOWCHECK FORENSIC AUDIT - QUICK START GUIDE

**⏱️ Time Required:** 30 minutes for immediate fixes
**🎯 Goal:** Get surveillance detection working today

---

## 🚨 IMMEDIATE ACTION (15 minutes)

### Step 1: Backup Database (2 minutes)
```bash
cd /home/nunya/shadowcheck
pg_dump -h 127.0.0.1 -U shadowcheck_user shadowcheck > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Why:** Safety net if anything goes wrong

---

### Step 2: Run Cleanup Script (5 minutes)
```bash
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -p 5432 -U shadowcheck_user -d shadowcheck \
  -f output/cleanup_script.sql
```

**Expected output:**
```
DROP TABLE
DROP TRIGGER
DROP TRIGGER
TRUNCATE TABLE
TRUNCATE TABLE
DELETE 1
ALTER TABLE
ALTER TABLE
...
COMMIT
```

**Verify cleanup worked:**
```
 table_name              | row_count
-------------------------+-----------
 correlation_alerts      |         0
 detection_records_master|         0
 user_devices            |         0
```

**✅ Success indicator:** All counts are 0, anomalies table gone

---

### Step 3: Run Build Script (5 minutes)
```bash
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -p 5432 -U shadowcheck_user -d shadowcheck \
  -f output/build_script.sql
```

**Expected output:**
```
CREATE FUNCTION
CREATE FUNCTION
CREATE VIEW
CREATE INDEX
CREATE INDEX
CREATE INDEX
COMMIT
```

**Verify build worked:**
```sql
-- Should show 13 detected threats
SELECT bssid, ssid, max_distance_km, threat_level
FROM app.get_surveillance_incidents(10, 5)
LIMIT 5;
```

**✅ Success indicator:** You see 5 rows with BSSIDs, distances, threat levels

---

### Step 4: Fix Backend Code (3 minutes)

**File:** `server/storage.ts`
**Line:** 371

**Find this:**
```typescript
(SELECT COUNT(*) FROM app.locations_legacy) as total_observations,
```

**Change to:**
```typescript
(SELECT COUNT(*) FROM app.locations_legacy) as total_locations,
```

**Save file and restart backend:**
```bash
# If using npm/node directly
cd /home/nunya/shadowcheck
npm run dev

# OR if using systemd/pm2
sudo systemctl restart shadowcheck
# OR
pm2 restart shadowcheck
```

**Verify fix worked:**
```bash
curl http://localhost:5000/api/v1/surveillance/stats | jq
```

**Expected output:**
```json
{
  "ok": true,
  "data": {
    "total_locations": 436622,
    "total_networks": 154997,
    ...
  }
}
```

**✅ Success indicator:** You see `total_locations` (NOT `total_observations`)

---

## ✅ VERIFICATION CHECKLIST

After completing the 4 steps above, verify everything works:

### Database Checks
```bash
# Check cleanup worked
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c \
  "SELECT COUNT(*) FROM app.correlation_alerts;"
# Expected: 0

# Check new function exists
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c \
  "SELECT * FROM app.get_surveillance_incidents(10, 1) LIMIT 1;"
# Expected: 1 row with threat data

# Check view still has threats
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c \
  "SELECT COUNT(*) FROM app.filtered_surveillance_threats;"
# Expected: 13 (or similar number)
```

### Backend API Checks
```bash
# Test stats endpoint (should show total_locations)
curl -s http://localhost:5000/api/v1/surveillance/stats | jq '.data.total_locations'
# Expected: 436622

# Test existing endpoints still work
curl -s http://localhost:5000/api/v1/surveillance/network-patterns?limit=1 | jq '.ok'
# Expected: true
```

### UI Checks (Manual)
1. Open browser: `http://localhost:5000/surveillance` (or your URL)
2. Check "Total Locations" card
   - **Before fix:** Shows 0 or undefined
   - **After fix:** Shows ~437k
3. Check "Networks Detected" card
   - Should show ~155k

---

## 🎉 SUCCESS CRITERIA

If all checks pass, you now have:
- ✅ Clean database (no test data)
- ✅ Working detection functions
- ✅ Fixed API endpoints
- ✅ Accurate UI stats

**Current Status:** Backend infrastructure ready

**Still TODO:** Wire UI "Threats" tab to show the 13 detected incidents

---

## 🔧 TROUBLESHOOTING

### Issue: Cleanup script fails with "table does not exist"
**Solution:** Table already deleted, safe to ignore. Continue to next step.

### Issue: Build script fails with "function already exists"
**Solution:** Functions already created. Either:
```sql
-- Option 1: Drop and recreate
DROP FUNCTION IF EXISTS app.get_surveillance_incidents CASCADE;
-- Then run build script again

-- Option 2: Just verify it works
SELECT * FROM app.get_surveillance_incidents(10, 1);
```

### Issue: Backend won't restart after code change
**Solution:**
```bash
# Check for syntax errors
cd /home/nunya/shadowcheck
npm run build

# Check logs
tail -f logs/backend-new.log

# Common fix: Kill and restart
pkill -f "node.*server"
npm run dev
```

### Issue: API returns 500 error
**Solution:**
```bash
# Check database connection
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c "SELECT 1;"

# Check backend logs
tail -n 50 logs/backend-new.log

# Check if function exists
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck -c \
  "SELECT proname FROM pg_proc WHERE proname = 'get_surveillance_incidents';"
```

### Issue: UI still shows 0 for "Total Locations"
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors (F12 → Console tab)
4. Verify API response:
   ```bash
   curl http://localhost:5000/api/v1/surveillance/stats
   ```
5. If API is correct but UI wrong, check React Query cache (may need 30 sec)

---

## 📋 ROLLBACK PROCEDURE

If something goes wrong and you need to undo:

```bash
# Restore from backup
PGPASSWORD='***REMOVED***' \
  psql -h 127.0.0.1 -U shadowcheck_user -d shadowcheck < backup_YYYYMMDD_HHMMSS.sql

# Revert backend code change
git checkout server/storage.ts
# OR manually change back: total_locations → total_observations

# Restart backend
npm run dev
```

---

## 📞 NEXT STEPS

After completing this quick start:

### TODAY (Optional - 2 hours)
If you want to see threats in the UI immediately, follow "Phase 4: UI Integration" in the main audit report (`FORENSIC_AUDIT_REPORT.md`).

### THIS WEEK (Recommended - 4 hours)
1. Add new API endpoints (`/api/v1/surveillance/incidents`)
2. Wire "Threats" tab in UI to show 13 detected threats
3. Add "Whitelist" button to false positives

### NEXT SPRINT (Nice to have - 8 hours)
1. Build incident detail map view
2. Add whitelist management page
3. Implement trip-based detection
4. Set up automated alerts

---

## 📚 REFERENCE FILES

All files in `output/` directory:

1. **FORENSIC_AUDIT_REPORT.md** - Complete audit (29 KB)
2. **EXECUTIVE_SUMMARY.md** - Quick overview
3. **ARCHITECTURE_DIAGRAM.md** - System architecture
4. **cleanup_script.sql** - What you just ran
5. **build_script.sql** - What you just ran
6. **backend_fix.md** - Code change you just made
7. **QUICK_START.md** - This file

---

## 🎖️ WHAT YOU ACCOMPLISHED

In 15 minutes, you:
- 🗑️ Removed 409 rows of test data
- 🗑️ Deleted 1 dead table and 2 disabled triggers
- 🆕 Created 2 new detection functions
- 🆕 Created 1 trip segmentation view
- 🆕 Added 3 performance indexes
- 🔧 Fixed API field name mismatch
- ✅ Verified 13 surveillance threats still detected

**Database Status:** ✅ Production Ready
**Next Step:** Wire UI to show detected threats

---

**Quick Start Complete!**
**Time Invested:** ~15-30 minutes
**Value Delivered:** Working surveillance detection backend

**To see threats in UI:** Continue to Phase 4 in main audit report.
