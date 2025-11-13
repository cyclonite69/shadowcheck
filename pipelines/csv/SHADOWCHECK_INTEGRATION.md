# Shadowcheck Project Integration Guide

## Files for Your Project

Copy these files to your shadowcheck project under `pipelines/csv/`:

```
shadowcheck/
└── pipelines/
    └── csv/
        ├── wigle_csv_networks_final.csv     (8.0 MB)
        └── wigle_csv_locations_final.csv    (17 MB)
```

## File Contents

### wigle_csv_networks_final.csv
**46,507 unique networks**

Columns:
- `source_id` - NULL (can be used for batch tracking)
- `bssid` - MAC address (UPPERCASE, UNIQUE)
- `ssid` - Network name (cleaned whitespace)
- `frequency` - WiFi frequency (integer)
- `capabilities` - Security/auth modes
- `lasttime` - Last seen (Unix epoch in seconds)
- `lastlat` - Latitude of best signal
- `lastlon` - Longitude of best signal
- `type` - Network type code (**W, G, L, B, or E**)
- `bestlevel` - Strongest RSSI (signal strength, negative integer)
- `bestlat` - Latitude of strongest signal
- `bestlon` - Longitude of strongest signal
- `rcois` - Regulatory info
- `mfgrid` - Manufacturer ID
- `service` - NULL
- `sqlite_filename` - Source file reference

### wigle_csv_locations_final.csv
**123,047 observation records**

Columns:
- `source_id` - NULL (can be used for batch tracking)
- `_id` - Sequential ID (1-123,047)
- `bssid` - MAC address (UPPERCASE)
- `level` - RSSI at this location (signal strength)
- `lat` - Latitude
- `lon` - Longitude
- `altitude` - Altitude in meters
- `accuracy` - GPS accuracy in meters
- `time` - Timestamp (Unix epoch in seconds)
- `external` - 0 (not external scan)
- `mfgrid` - Manufacturer ID
- `type` - Network type code (**W, G, L, B, or E**)
- `sqlite_filename` - Source file reference

## Type Codes Reference

| Code | Type | Examples |
|------|------|----------|
| **W** | WiFi (802.11) | Home routers, hotspots, business WiFi |
| **G** | GSM | Cellular networks (2G/3G) |
| **L** | LTE | Cellular networks (4G/LTE) |
| **B** | Bluetooth | Standard Bluetooth devices |
| **E** | Bluetooth LE | Low-energy Bluetooth (fitness trackers, etc.) |

### Distribution in Your Data

**Networks:** 46,507 total
- E (BLE): 27,365 (58.8%)
- W (WiFi): 9,580 (20.6%)
- B (BT): 9,490 (20.4%)
- L (LTE): 55 (0.1%)
- G (GSM): 17 (0.0%)

**Observations:** 123,047 total
- E (BLE): 48,428 (39.4%)
- W (WiFi): 46,096 (37.5%)
- B (BT): 24,536 (20.0%)
- L (LTE): 2,020 (1.6%)
- G (GSM): 1,967 (1.6%)

## SQL Queries for Your App

```sql
-- Count by type
SELECT type, COUNT(*) as count 
FROM app.wigle_csv_networks 
GROUP BY type 
ORDER BY count DESC;

-- Find all WiFi networks
SELECT * FROM app.wigle_csv_networks WHERE type = 'W';

-- Find all Bluetooth devices
SELECT * FROM app.wigle_csv_networks WHERE type IN ('B', 'E');

-- Get observations for a specific network
SELECT * FROM app.wigle_csv_locations 
WHERE bssid = 'C0:94:35:1E:83:60' 
ORDER BY time;

-- Map visualization - all networks with location
SELECT 
    n.bssid, n.ssid, n.type, n.bestlevel,
    n.bestlat, n.bestlon,
    COUNT(l._id) as observations
FROM app.wigle_csv_networks n
LEFT JOIN app.wigle_csv_locations l ON n.bssid = l.bssid
GROUP BY n.bssid, n.ssid, n.type, n.bestlevel, n.bestlat, n.bestlon;
```

## Data Quality Notes

✅ **All Cleaned:**
- SSID: Whitespace trimmed
- BSSID: Uppercase normalized
- Timestamps: Unix epoch format
- Types: Letter codes (W, G, L, B, E)
- Networks: Deduplicated by strongest signal

✅ **Preserved:**
- All 123,047 observations
- All geographic data
- Signal strength measurements
- Network security info

## Integration Steps

1. **Copy Files:**
   ```bash
   cp wigle_csv_networks_final.csv pipelines/csv/
   cp wigle_csv_locations_final.csv pipelines/csv/
   ```

2. **Import to PostgreSQL** (if using the loader):
   ```bash
   bash load_to_docker_final.sh
   ```

3. **Update Your App:**
   - Update type handling: use single letters (W, G, L, B, E)
   - Update queries to reference the new column names
   - Update UI displays for network types

4. **Test:**
   - Verify row counts (46,507 networks, 123,047 observations)
   - Check type distribution
   - Verify coordinates are within expected range

## File Specifications

| Field | Format | Example |
|-------|--------|---------|
| BSSID | XX:XX:XX:XX:XX:XX | C0:94:35:1E:83:60 |
| SSID | UTF-8 string | "Home WiFi" |
| Type | Single letter | W, G, L, B, E |
| Timestamp | Unix epoch | 1710885515 |
| Coordinates | Float | 43.023341, -83.696969 |
| Signal Strength | Negative integer | -80, -67, etc. |

## Troubleshooting

**Issue:** Type values are single letters but app expects full names
- **Solution:** Update your app's type handling to use: W, G, L, B, E

**Issue:** Timestamps are epoch instead of datetime
- **Solution:** Convert Unix epoch to datetime: `datetime.fromtimestamp(epoch)`

**Issue:** BSSID case doesn't match existing data
- **Solution:** Convert all BSSIDs to uppercase with `.upper()`

## Questions?

Refer to:
- `WIGLE_TYPE_CODES.md` - Type code reference
- `FINAL_SUMMARY.md` - Complete data mapping
- `README.md` - Quick start guide
