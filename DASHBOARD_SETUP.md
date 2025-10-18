# ShadowCheck Dashboard Setup - Complete Guide

## Overview

This document describes the complete setup for the ShadowCheck surveillance detection dashboard, including database connection, API endpoints, and dashboard metrics.

## Database Schema

### Primary Tables

#### `app.locations_legacy` (436,622 records)
Location observations for network detections with signal strength.

| Column | Type | Description |
|--------|------|-------------|
| unified_id | bigint | Primary key |
| bssid | text | MAC address of network |
| level | integer | Signal strength in dBm |
| lat | double precision | Latitude |
| lon | double precision | Longitude |
| altitude | double precision | Altitude in meters |
| accuracy | double precision | GPS accuracy |
| time | bigint | Unix timestamp (milliseconds) |

#### `app.networks_legacy` (154,997 records)
Network metadata including SSIDs, frequencies, and capabilities.

| Column | Type | Description |
|--------|------|-------------|
| unified_id | bigint | Primary key |
| bssid | text | MAC address |
| ssid | text | Network name |
| frequency | integer | Frequency in MHz |
| capabilities | text | Security/encryption info |
| type | text | W=WiFi, C=Cellular, B=Bluetooth |
| lasttime | bigint | Last seen timestamp |
| lastlat | double precision | Last known latitude |
| lastlon | double precision | Last known longitude |
| bestlevel | integer | Best signal strength observed |

## Environment Configuration

### `.env` File
```env
DATABASE_URL=postgresql://shadowcheck_user:***REMOVED***@localhost:5432/shadowcheck
NODE_ENV=development
PORT=5000
```

## API Endpoints

All endpoints return JSON with `{ ok: boolean, data: any }` structure.

### 1. `/api/v1/analytics`
**Dashboard Overview Metrics**

Returns:
```json
{
  "ok": true,
  "data": {
    "overview": {
      "total_observations": 436622,
      "distinct_networks": 154997,
      "geolocated_observations": 436622,
      "earliest_observation": 0,
      "latest_observation": 1759990013000
    }
  }
}
```

**SQL Query:**
- Counts total observations from `locations_legacy`
- Counts distinct networks from `networks_legacy`
- Calculates geolocated observations
- Finds earliest and latest timestamps

### 2. `/api/v1/radio-stats`
**Radio Type Distribution (WiFi, Cellular, Bluetooth, BLE)**

Returns array of radio type statistics:
```json
{
  "ok": true,
  "data": [
    {
      "radio_type": "wifi",
      "total_observations": 120000,
      "distinct_networks": 45000
    },
    {
      "radio_type": "cellular",
      "total_observations": 5000,
      "distinct_networks": 1200
    }
  ]
}
```

**Classification Logic:**
- **Cellular**: `type = 'C'` or BSSID matches pattern `^[0-9]+_[0-9]+_[0-9]+$`
- **Bluetooth**: `type = 'B'`
- **BLE**: `frequency = 0` or `frequency BETWEEN 1 AND 500`
- **WiFi**: `type = 'W'` or frequency in 2.4GHz/5GHz bands

### 3. `/api/v1/signal-strength`
**Signal Strength Distribution**

Returns signal strength ranges and counts:
```json
{
  "ok": true,
  "data": [
    {
      "signal_range": "Excellent (-50 to 0 dBm)",
      "count": 45000
    },
    {
      "signal_range": "Good (-60 to -50 dBm)",
      "count": 120000
    }
  ]
}
```

**Ranges:**
- Excellent: -50 to 0 dBm
- Good: -60 to -50 dBm
- Fair: -70 to -60 dBm
- Weak: -80 to -70 dBm
- Very Weak: < -80 dBm

### 4. `/api/v1/security-analysis`
**Network Security Breakdown**

Returns security level distribution:
```json
{
  "ok": true,
  "data": [
    {
      "security_level": "WPA2 (Secure)",
      "security": "[WPA2-PSK-CCMP][ESS]",
      "network_count": 85000,
      "percentage": 54.85
    }
  ]
}
```

**Security Categories:**
- WPA3 (Most Secure)
- WPA2 (Secure)
- WPA (Moderate)
- WEP (Insecure - Deprecated)
- Open Network (No Encryption)

### 5. `/api/v1/timeline`
**Hourly Detection Counts (Last 24 Hours)**

Returns time-series data by radio type:
```json
{
  "ok": true,
  "data": [
    {
      "hour": "2025-10-16T06:00:00.000Z",
      "radio_type": "wifi",
      "detection_count": 1250
    }
  ]
}
```

**Features:**
- Automatically calculates last 24 hours from latest timestamp
- Groups by hour and radio type
- Useful for timeline/activity charts

## Dashboard Metrics

### Key Performance Indicators (KPIs)

1. **Total Network Observations** (436,622)
   - All location records in database
   - Represents individual signal detections

2. **Distinct Networks** (154,997)
   - Unique BSSIDs (MAC addresses)
   - Represents individual network devices

3. **Radio Type Breakdown**
   - WiFi observations and networks
   - Cellular tower observations
   - Bluetooth device observations
   - BLE beacon observations

4. **Signal Strength Distribution**
   - Histogram of signal strength ranges
   - Helps identify coverage areas

5. **Security Analysis**
   - Encryption type breakdown
   - Percentage distribution
   - Identifies vulnerable networks

6. **Timeline Activity**
   - Hourly detection patterns
   - By radio type
   - Useful for identifying surveillance patterns

## Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **pg** (node-postgres) for database connection
- **Drizzle ORM** (optional, not currently used for legacy tables)

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **TanStack Query** (React Query) for data fetching
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Radix UI** for components

### Database
- **PostgreSQL 18** with **PostGIS 3.6**
- Connection pooling with max 10 connections
- Docker containerized

## Running the Application

### Start PostgreSQL
```bash
cd /home/nunya/shadowcheck
docker compose -f docker-compose.prod.yml up -d postgres
```

### Start Development Server
```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

### Access Dashboard
Navigate to: `http://localhost:5173/dashboard`

## Dashboard Components

### Files Structure
```
client/src/
├── pages/
│   └── dashboard.tsx          # Main dashboard page
├── lib/
│   └── api.ts                 # API client with typed methods
├── components/
│   ├── ui/                    # Radix UI components
│   └── Map/                   # Mapbox visualization components
└── hooks/
    └── useMediaQuery.ts       # Responsive design hook

server/
├── index.ts                   # Express server with API routes
├── db.ts                      # PostgreSQL connection pool
└── routes/
    └── health.ts              # Health check endpoints
```

### Dashboard Features

1. **Radio Type Statistics Cards**
   - WiFi, Cellular, Bluetooth, BLE
   - Total observations and unique networks
   - Color-coded icons

2. **Total Overview Cards**
   - Total observations
   - Distinct networks
   - Time span coverage

3. **Security Analysis**
   - Pie chart of security levels
   - Detailed breakdown table
   - Percentage calculations

4. **Signal Strength Distribution**
   - Bar chart visualization
   - Color-coded by strength
   - Count by range

5. **Timeline Chart**
   - Line chart of detections over 24 hours
   - Multiple series by radio type
   - Interactive tooltips

6. **Recent Activity**
   - Latest network observations
   - Real-time updates every 30 seconds

## Data Flow

```
PostgreSQL Database
  ↓
app.locations_legacy + app.networks_legacy
  ↓
Express API Endpoints (/api/v1/*)
  ↓
TanStack Query (React Query)
  ↓
Dashboard Components (React)
  ↓
Recharts Visualizations
```

## Performance Optimizations

1. **Database**
   - Indexed columns: bssid, lat/lon, time
   - Connection pooling (max 10)
   - Query timeouts (10 seconds)

2. **API**
   - Efficient SQL with CTEs
   - Aggregate queries to reduce data transfer
   - Error handling and retry logic

3. **Frontend**
   - React Query caching (30 second refetch)
   - Lazy loading of components
   - Optimized Recharts rendering

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database connectivity
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "SELECT 1;"

# View logs
docker logs shadowcheck_postgres_18
```

### API Endpoint Testing
```bash
# Test analytics endpoint
curl http://localhost:5000/api/v1/analytics

# Test radio stats
curl http://localhost:5000/api/v1/radio-stats

# Test signal strength
curl http://localhost:5000/api/v1/signal-strength
```

### Frontend Issues
```bash
# Check React Query cache
# Open browser DevTools → Components → Select component → View queries

# Clear React Query cache
# Navigate away and back to dashboard
```

## Future Enhancements

1. **Real-time Updates**
   - WebSocket connections for live data
   - Server-sent events (SSE)

2. **Advanced Analytics**
   - Machine learning anomaly detection
   - Surveillance pattern recognition
   - Geospatial clustering

3. **Export Capabilities**
   - CSV/JSON data export
   - PDF report generation
   - KML/GeoJSON for mapping

4. **Filtering and Search**
   - Date range filters
   - BSSID/SSID search
   - Geographic bounding box

5. **Performance**
   - Database query caching (Redis)
   - API response caching
   - Pagination for large datasets

## Security Considerations

1. **Database Access**
   - Use environment variables for credentials
   - Never commit `.env` files
   - Rotate passwords regularly

2. **API Security**
   - Add authentication/authorization
   - Rate limiting
   - Input validation

3. **Data Privacy**
   - Anonymize sensitive data
   - Secure transmission (HTTPS)
   - Access logging

## Support

For issues or questions:
1. Check Docker container logs
2. Verify database connectivity
3. Test API endpoints directly
4. Review browser console for errors
5. Check React Query DevTools

---

**Last Updated:** October 16, 2025
**Version:** 1.0.0
**Database:** PostgreSQL 18 + PostGIS 3.6
