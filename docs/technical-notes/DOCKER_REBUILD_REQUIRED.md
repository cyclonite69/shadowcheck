# CRITICAL: Docker Image Rebuild Required

**Date:** 2025-11-02
**Issue:** Code changes not reflected in running container
**Status:** 🔄 REBUILDING NOW

---

## ROOT CAUSE

The Docker backend container was running **STALE COMPILED CODE** from an old image build.

### What Happened:

1. ✅ Fixed TypeScript source code in `server/routes/pipelines.ts`
   - Changed `time` → `observation_time`
   - Changed `signal_level` → `signal_dbm`
   - Added `maxBuffer` settings

2. ❌ Docker container still running old compiled JavaScript
   - `server/dist/server/routes/pipelines.js` had OLD code
   - Container built from previous image with unfixed code
   - Restart didn't help - need full rebuild

3. 🔄 **Solution:** Rebuild Docker image from source

---

## ERRORS BEFORE REBUILD

```
column "time" of relation "wigle_alpha_v3_observations" does not exist
column "signal_level" does not exist
```

This proves the container was using OLD compiled code that references non-existent columns.

---

## REBUILD COMMAND

```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Force rebuild backend image (no cache)
docker-compose -f docker-compose.prod.yml build --no-cache backend

# Start with new image
docker-compose -f docker-compose.prod.yml up -d
```

---

## VERIFICATION AFTER REBUILD

### 1. Check Compiled Code Has Fixes

```bash
# Should show observation_time, NOT time
docker exec shadowcheck_backend grep -A 3 "INSERT INTO app.wigle_alpha_v3_observations" \
  /app/server/dist/server/routes/pipelines.js | head -20
```

**Expected Output:**
```javascript
INSERT INTO app.wigle_alpha_v3_observations
(bssid, lat, lon, altitude, accuracy, observation_time, last_update, signal_dbm)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
```

**Should NOT contain:**
- ❌ `time` column
- ❌ `signal_level` column
- ❌ `query_params` column

### 2. Test SQLite Import

```bash
curl -X POST http://localhost:5000/api/v1/pipelines/wigle/import \
  -H "Content-Type: application/json" \
  -d '{"filename": "backup-1761824754281.sqlite"}'
```

**Expected:** No column errors, successful import

### 3. Test WiGLE API

```bash
curl -X POST http://localhost:5000/api/v1/pipelines/wigle-api/detail \
  -H "Content-Type: application/json" \
  -d '{"bssid": "CA:99:B2:1E:55:13"}'
```

**Expected:** Observations imported via Python Alpha v3 script

### 4. Check Backend Logs

```bash
docker logs shadowcheck_backend --tail 50 | grep -i error
```

**Expected:** No column errors

---

## WHY THIS HAPPENED

### Docker Multi-Stage Build Process:

1. **STAGE 1 (builder):** Compiles TypeScript → JavaScript
   - Runs `npx tsc` on source code
   - Creates `server/dist/` with compiled JS

2. **STAGE 2 (production):** Copies compiled code
   - `COPY --from=builder /app/server/dist ./server/dist`
   - This is what the container runs

### The Problem:

When you change TypeScript source files, the Docker image still contains OLD compiled JavaScript from a previous build.

Simply restarting the container doesn't recompile - you need to rebuild the image.

---

## PREVENTION FOR FUTURE

### Option 1: Always Rebuild After Code Changes
```bash
# Quick rebuild (uses cache where possible)
docker-compose -f docker-compose.prod.yml build backend

# Full rebuild (fresh, slower but guaranteed clean)
docker-compose -f docker-compose.prod.yml build --no-cache backend
```

### Option 2: Use Development Mode with Volume Mounts

Create `docker-compose.dev.yml` with:
```yaml
services:
  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile.dev
    volumes:
      - ./server:/app/server  # Mount source directly
      - ./node_modules:/app/node_modules
    command: npx tsx watch server/index.ts  # Auto-reload on changes
```

This way code changes are immediately reflected without rebuild.

---

## REBUILD STATUS

🔄 **Currently rebuilding backend image...**

This will take 2-5 minutes depending on machine.

After rebuild completes:
1. ✅ Verify compiled code has fixes
2. ✅ Test SQLite import
3. ✅ Test WiGLE API
4. ✅ Confirm no column errors

---

## LESSON LEARNED

**ALWAYS rebuild Docker images after modifying source code in production builds!**

TypeScript changes don't automatically recompile in Docker containers - the image must be rebuilt to include the new compiled JavaScript.

```bash
# WRONG: Just restart
docker-compose -f docker-compose.prod.yml restart backend  # ❌ Still has old code

# RIGHT: Rebuild and restart
docker-compose -f docker-compose.prod.yml build backend    # ✅ Recompiles code
docker-compose -f docker-compose.prod.yml up -d backend    # ✅ Uses new image
```
