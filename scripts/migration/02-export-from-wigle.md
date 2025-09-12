# Exporting Data from WiGLE Android App

## Prerequisites

- WiGLE WiFi Wardriving app installed on Android
- Collected WiFi network data through normal app usage
- **Note**: Direct database access requires root - use app export features instead

## Export Methods (Recommended)

### Method 1: WiGLE App Export Feature (Recommended)

**Most reliable method - works on non-rooted devices**

1. Open WiGLE WiFi Wardriving app
2. Navigate to **Settings** → **Database**
3. Select **"Export Database"** or **"Backup Database"**
4. Choose export location (usually Downloads or Documents)
5. Export generates `.sqlite` file with all collected data

### Method 2: Android Backup (Alternative)

**For devices with ADB debugging enabled**

```bash
# Enable USB debugging in Android Developer Options first
adb backup -shared net.wigle.wigleandroid
# Creates backup.ab file - requires extraction tools to get SQLite
```

### Method 3: File Manager (Root Required)

**Only works on rooted devices with root file manager**

1. Install root file manager (Root Explorer, Solid Explorer with root add-on)
2. Navigate to: `/data/data/net.wigle.wigleandroid/databases/`
3. Copy `wiglewifi.sqlite` to accessible location
4. Transfer to computer for processing

**⚠️ Root Warning**: Most modern Android devices don't allow easy rooting, and rooting voids warranties. Use app export features instead.

## Verify Export

Check the exported SQLite file:

```bash
sqlite3 your_export.sqlite ".tables"
# Expected output: network, location, route, android_metadata

sqlite3 your_export.sqlite ".schema network"
# Should show network table structure with bssid, ssid, frequency columns
```

## Export File Characteristics

**Typical file sizes:**

- Light usage (few days): 1-10 MB
- Regular usage (weeks): 10-100 MB
- Heavy usage (months): 100MB-1GB+

**Data included:**

- WiFi network observations (BSSID, SSID, security, frequency)
- GPS coordinates and timestamps for each observation
- Signal strength measurements (RSSI)
- Route tracking data (if enabled)

## Privacy Considerations

**Before sharing exports:**

- WiGLE data contains precise GPS coordinates of your movements
- Network data may reveal home/work locations and travel patterns
- Consider coordinate sanitization for public analysis
- Review WiGLE Terms of Use regarding data sharing

**Coordinate sanitization example:**

```sql
-- Reduce coordinate precision for privacy
UPDATE network SET
  lastlat = ROUND(lastlat, 3),  -- ~100m precision
  lastlon = ROUND(lastlon, 3),
  bestlat = ROUND(bestlat, 3),
  bestlon = ROUND(bestlon, 3);
```

## Troubleshooting

**"Export Database" option missing:**

- Update to latest WiGLE app version
- Check app permissions (Storage access)
- Try "Backup Database" instead

**Export file empty or corrupted:**

- Ensure app has collected data (check statistics in app)
- Try exporting to different location
- Restart app and retry export

**Large export files:**

- Consider date range filtering if supported
- Split exports by time period
- Compress before transfer (.sqlite.gz)

## Next Steps

After successful export, proceed to:

1. **Verify export integrity** with SQLite commands above
2. **Run import script**: `./03-import-sqlite.sh your_export.sqlite`
3. **Check migration logs** for any import issues
