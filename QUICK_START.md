# ShadowCheck Dashboard - Quick Start Guide

## 🚀 Start Development (One Command)

```bash
cd /home/nunya/shadowcheck
./start-dev.sh
```

Then open: **http://localhost:5173/dashboard**

---

## 📊 What You'll See

### Dashboard Metrics
- **436,622 total observations** from surveillance detection
- **154,997 unique networks** (WiFi, Cellular, Bluetooth, BLE)
- **Signal strength distribution** across all detections
- **Network security analysis** (WPA3, WPA2, WEP, Open)
- **24-hour activity timeline** by radio type
- **Recent network activity** table

---

## 🗄️ Database Info

**Container**: `shadowcheck_postgres_18`
**Database**: `shadowcheck`
**User**: `shadowcheck_user`
**Password**: `***REMOVED***`

### Tables Used
- `app.locations_legacy` (436,622 records) - Signal detections
- `app.networks_legacy` (154,997 records) - Network metadata

---

## 🔌 API Endpoints

All at `http://localhost:5000/api/v1/`

| Endpoint | Description | Data Source |
|----------|-------------|-------------|
| `/analytics` | Overview metrics | Both tables |
| `/radio-stats` | WiFi/Cellular/BT/BLE breakdown | networks_legacy |
| `/signal-strength` | Signal strength distribution | locations_legacy |
| `/security-analysis` | Encryption breakdown | networks_legacy |
| `/timeline` | 24-hour activity | Both tables |

---

## ⚡ Quick Commands

### Database
```bash
# Check PostgreSQL status
docker ps | grep postgres

# Connect to database
docker exec -it shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck

# View logs
docker logs shadowcheck_postgres_18
```

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Start only backend
npm run dev:server

# Start only frontend
npm run dev:client
```

### Testing
```bash
# Test analytics endpoint
curl http://localhost:5000/api/v1/analytics

# Test radio stats
curl http://localhost:5000/api/v1/radio-stats

# Check database counts
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "SELECT COUNT(*) FROM app.locations_legacy;"
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env` | Database credentials |
| `server/index.ts` | API endpoints |
| `client/src/pages/dashboard.tsx` | Dashboard UI |
| `client/src/lib/api.ts` | API client |
| `DASHBOARD_SETUP.md` | Full documentation |

---

## 🐛 Troubleshooting

### Database won't start
```bash
docker compose -f docker-compose.prod.yml restart postgres
```

### Port 5000 in use
```bash
# Find process
lsof -i :5000
# Kill it
kill -9 <PID>
```

### Dashboard shows no data
1. Check terminal for API errors
2. Open browser console (F12)
3. Check Network tab for failed requests
4. Verify database is running

---

## 📚 Documentation

- **DASHBOARD_SETUP.md** - Complete technical guide
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **QUICK_START.md** - This file

---

## ✅ Success Checklist

Before starting:
- [x] PostgreSQL container running
- [x] Database has 436K+ location records
- [x] Database has 155K+ network records
- [x] `.env` file configured
- [x] Dependencies installed (`npm install`)

After starting:
- [ ] Server starts without errors
- [ ] Dashboard loads at http://localhost:5173/dashboard
- [ ] Metrics cards show numbers
- [ ] Charts render correctly
- [ ] No console errors

---

**Need Help?** Check the full docs in `DASHBOARD_SETUP.md`

**Last Updated:** October 16, 2025
