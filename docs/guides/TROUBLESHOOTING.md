# ShadowCheck Troubleshooting Guide

## Common Issues and Solutions

### ✅ RESOLVED: 500 Error on Networks Page
**Issue**: `/api/v1/networks` returned 500 error because it was querying non-existent normalized tables.

**Solution**: Updated the endpoint to use `app.networks_legacy` table instead.

**Verification**:
```bash
curl http://localhost:5000/api/v1/networks?limit=3
```

Should return JSON with 3 network records.

---

### ⚠️ Favicon 404 Error (Non-Critical)
**Issue**: Browser shows 404 error for `/favicon.ico`

**Impact**: None - this is just a missing icon file and doesn't affect functionality.

**Solution** (optional):
1. Download a favicon or create one at https://favicon.io
2. Save as `client/public/favicon.ico`
3. Restart dev server

---

### Database Connection Issues

#### PostgreSQL Not Running
**Symptoms**: `ECONNREFUSED` errors, API returns 500

**Check**:
```bash
docker ps | grep postgres
```

**Fix**:
```bash
cd /home/nunya/shadowcheck
docker compose -f docker-compose.prod.yml up -d postgres
```

#### Wrong Credentials
**Symptoms**: Authentication failed errors

**Check**: Verify `.env` file has correct DATABASE_URL:
```bash
cat .env | grep DATABASE_URL
```

**Expected**:
```
DATABASE_URL=postgresql://shadowcheck_user:***REMOVED***@localhost:5432/shadowcheck
```

---

### API Endpoint Issues

#### All Endpoints Return Errors
**Check server logs**: Look at terminal where `npm run dev` is running

**Common causes**:
1. Database not running
2. Wrong table names in queries
3. SQL syntax errors
4. Missing environment variables

**Test individual endpoints**:
```bash
# Analytics
curl http://localhost:5000/api/v1/analytics

# Radio Stats
curl http://localhost:5000/api/v1/radio-stats

# Networks
curl http://localhost:5000/api/v1/networks?limit=5
```

#### Specific Endpoint Returns Empty Data
**Check if table has data**:
```bash
# Locations count
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "SELECT COUNT(*) FROM app.locations_legacy;"

# Networks count
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "SELECT COUNT(*) FROM app.networks_legacy;"
```

---

### Frontend Issues

#### Dashboard Shows "No Data"
**Causes**:
1. API not running
2. API returning errors
3. CORS issues

**Check**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed API calls (red)
5. Click on failed calls to see error details

**Solution**:
- If API calls show 404: Server not running
- If API calls show 500: Check server logs
- If API calls show CORS error: Restart dev server

#### Charts Not Rendering
**Causes**:
1. Data format incorrect
2. React Query cache issues
3. Recharts errors

**Check Console**:
```
F12 → Console → Look for errors
```

**Solutions**:
- Clear React Query cache: Navigate away and back to dashboard
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Check data format matches what charts expect

---

### Development Server Issues

#### Port 5000 Already in Use
**Symptoms**: `EADDRINUSE` error

**Find what's using the port**:
```bash
lsof -i :5000
```

**Kill the process**:
```bash
kill -9 <PID>
```

**Or change port** in `.env`:
```
PORT=5001
```

#### Port 5173 Already in Use
**Same solution as above, but for port 5173**

---

### Performance Issues

#### Slow API Responses
**Causes**:
1. Large dataset queries without limits
2. Missing indexes
3. Complex joins

**Check query performance**:
```bash
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "EXPLAIN ANALYZE SELECT COUNT(*) FROM app.locations_legacy;"
```

**Solutions**:
- Add LIMIT clauses to queries
- Create indexes on frequently queried columns
- Use pagination for large result sets

#### Dashboard Loads Slowly
**Causes**:
1. Too many API calls
2. Large chart datasets
3. No caching

**Check**:
- Open DevTools → Network tab
- See how many requests are made
- Check size of responses

**Solutions**:
- Increase React Query cache time
- Reduce chart data points
- Add pagination to tables

---

### Data Issues

#### Numbers Don't Match Expected Values
**Check raw counts**:
```bash
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "
SELECT
  (SELECT COUNT(*) FROM app.locations_legacy) as locations,
  (SELECT COUNT(*) FROM app.networks_legacy) as networks;
"
```

**Expected**: locations=436622, networks=154997

#### Timeline Shows No Data
**Cause**: Data might be old or time range calculation issue

**Check latest timestamp**:
```bash
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "
SELECT
  TO_TIMESTAMP(MAX(time) / 1000) as latest_observation,
  TO_TIMESTAMP(MAX(time) / 1000) - INTERVAL '24 hours' as twenty_four_hours_ago
FROM app.locations_legacy WHERE time IS NOT NULL;
"
```

---

### SQL Query Errors

#### Column Does Not Exist
**Cause**: Wrong table name or column name

**Check actual columns**:
```bash
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "\d app.networks_legacy"
```

#### Relation Does Not Exist
**Cause**: Table doesn't exist or wrong schema

**List all tables**:
```bash
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "\dt app.*"
```

---

## Quick Diagnostics Checklist

Run these commands to diagnose issues:

```bash
# 1. Check PostgreSQL
docker ps | grep postgres
# Expected: shadowcheck_postgres_18 running

# 2. Test database connection
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "SELECT 1;"
# Expected: Returns 1

# 3. Check record counts
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "
SELECT
  (SELECT COUNT(*) FROM app.locations_legacy) as locations,
  (SELECT COUNT(*) FROM app.networks_legacy) as networks;
"
# Expected: locations=436622, networks=154997

# 4. Test API endpoints
curl http://localhost:5000/api/v1/analytics
curl http://localhost:5000/api/v1/networks?limit=3
# Expected: JSON responses

# 5. Check server logs
# Look at terminal where npm run dev is running
# Should show no errors
```

---

## Getting Help

### Log Locations
- **Server logs**: Terminal where `npm run dev` runs
- **Database logs**: `docker logs shadowcheck_postgres_18`
- **Browser logs**: F12 → Console

### Useful Commands
```bash
# Restart PostgreSQL
docker compose -f docker-compose.prod.yml restart postgres

# Restart dev server
# Ctrl+C in terminal, then:
npm run dev

# Check all processes
ps aux | grep -E "node|postgres"

# Check ports
lsof -i :5000
lsof -i :5173
lsof -i :5432
```

### Debug Mode
Add to `.env`:
```
LOG_LEVEL=debug
NODE_ENV=development
```

Then restart server to see detailed logs.

---

**Last Updated**: October 16, 2025
