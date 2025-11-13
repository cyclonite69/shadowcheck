# Claude Code CLI Prompt - WiGLE Data Cleaning

Use this with Claude Code CLI to refine or re-process WiGLE data:

```
claude code "Process WiGLE WiFi scan CSV with these transformations:

INPUT: WiGLE_CSV_Export_7-2-24__1_.csv (123,047 records)

TRANSFORMATIONS REQUIRED:

1. SSID Cleaning
   - Strip leading AND trailing whitespace from all SSID values
   - Convert empty strings to NULL
   - Example: '  WiFi Name  ' → 'WiFi Name'
   - Example: '    ' → NULL

2. BSSID Normalization  
   - Convert all MAC addresses to UPPERCASE
   - Keep colon separators
   - Example: 'c0:94:35:1e:83:60' → 'C0:94:35:1E:83:60'

3. Network Deduplication
   - Deduplicate by BSSID (MAC address)
   - Keep the record with strongest RSSI (highest signal strength)
   - Sort by RSSI descending before deduplication
   - Expected result: ~46,507 unique networks from 123,047 records

4. Timestamp Conversion
   - Convert all 'FirstSeen' from datetime string to Unix epoch (seconds)
   - Format: '2024-03-19 21:58:35' → 1710885515
   - Use integer division: int(timestamp.timestamp())

5. Data Type Corrections
   - Frequency, Channel, RSSI: Convert to INTEGER
   - Lat/Lon/Altitude/Accuracy: Convert to FLOAT
   - MAC/SSID/Type: Keep as STRING

OUTPUT: Two CSV files

Networks CSV (46,507 rows):
  - source_id, bssid, ssid, frequency, capabilities, lasttime
  - lastlat, lastlon, type, bestlevel, bestlat, bestlon
  - rcois, mfgrid, service, sqlite_filename
  - sorted by bssid for verification

Locations CSV (123,047 rows):
  - source_id, _id, bssid, level, lat, lon, altitude
  - accuracy, time, external, mfgrid, sqlite_filename
  - sequential _id from 1 to 123,047
  
SUMMARY STATISTICS:
- Print deduplication ratio
- Print SSID cleaning stats
- Print timestamp conversion samples
- Print BSSID case correction count
- Show 5-row samples of both output files

Use pandas for data manipulation.
"
```

---

## Detailed Specifications

### Column Mapping for Networks CSV

| CSV Source | Output Column | Type | Notes |
|-----------|---------------|------|-------|
| MAC | bssid | TEXT | UPPERCASE |
| SSID | ssid | TEXT | CLEANED |
| Frequency | frequency | INTEGER | |
| AuthMode | capabilities | TEXT | |
| FirstSeen | lasttime | BIGINT | Unix epoch |
| CurrentLatitude | lastlat | FLOAT | |
| CurrentLongitude | lastlon | FLOAT | |
| Type | type | TEXT | |
| RSSI | bestlevel | INTEGER | Keep strongest |
| CurrentLatitude | bestlat | FLOAT | Same as lastlat |
| CurrentLongitude | bestlon | FLOAT | Same as lastlon |
| RCOIs | rcois | TEXT | |
| MfgrId | mfgrid | INTEGER | |
| N/A | source_id | NULL | Set to NULL |
| N/A | service | NULL | Set to NULL |
| N/A | sqlite_filename | TEXT | "WiGLE_CSV_Export_7-2-24.csv" |

### Column Mapping for Locations CSV

| CSV Source | Output Column | Type | Notes |
|-----------|---------------|------|-------|
| MAC | bssid | TEXT | UPPERCASE |
| RSSI | level | INTEGER | |
| CurrentLatitude | lat | FLOAT | |
| CurrentLongitude | lon | FLOAT | |
| AltitudeMeters | altitude | FLOAT | |
| AccuracyMeters | accuracy | FLOAT | |
| FirstSeen | time | BIGINT | Unix epoch |
| N/A | source_id | NULL | Set to NULL |
| Generated | _id | BIGINT | Sequential 1-N |
| N/A | external | INTEGER | Set to 0 |
| MfgrId | mfgrid | INTEGER | |
| N/A | sqlite_filename | TEXT | "WiGLE_CSV_Export_7-2-24.csv" |

### Implementation Notes

```python
# SSID Cleaning Example
def clean_ssid(x):
    if pd.isna(x):
        return None
    cleaned = str(x).strip()
    return cleaned if cleaned else None

df['ssid'] = df['SSID'].apply(clean_ssid)

# BSSID Uppercase
df['bssid'] = df['MAC'].str.upper()

# Timestamp to Unix Epoch
df['epoch'] = pd.to_datetime(df['FirstSeen']).astype('int64') // 10**9

# Networks Deduplication
networks = df.sort_values('RSSI', ascending=False).drop_duplicates('MAC', keep='first')
```

### Expected Output Statistics

After running the script, you should see:
```
Original Records: 123,047
Unique Networks (after dedup): 46,507
Networks Removed: 76,540 (62% reduction)
SSIDs with Names: ~9,090
SSIDs Cleaned: ~41,230
BSSID Case Conversions: 46,507 (all to uppercase)
Timestamps Converted: 123,047
```

### Quality Checks

Verify the output:
- No leading/trailing spaces in SSID column
- All BSSIDs are uppercase (check first 10 rows)
- All timestamps are 10-digit Unix epoch integers
- Networks CSV has ~46,507 rows
- Locations CSV has ~123,047 rows
- Both CSVs have proper headers
- CSV escaping is correct (quote non-numeric fields)
