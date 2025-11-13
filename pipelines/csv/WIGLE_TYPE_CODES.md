# WiGLE Type Codes Reference

Your CSV files now use single-letter type codes as per WiGLE.net standard.

## Type Code Mapping

| Code | Full Name | Description | Count (Networks) | Count (Observations) |
|------|-----------|-------------|------------------|----------------------|
| **W** | WIFI | WiFi / IEEE 802.11 | 9,580 | 46,096 |
| **G** | GSM | Global System for Mobile (cellular) | 17 | 1,967 |
| **L** | LTE | Long-Term Evolution (4G/5G cellular) | 55 | 2,020 |
| **B** | BT | Bluetooth | 9,490 | 24,536 |
| **E** | BLE | Bluetooth Low Energy (LE) | 27,365 | 48,428 |
| | | **TOTAL** | **46,507** | **123,047** |

## Implementation Notes

### Database Column
The `type` column now contains single-letter codes:
- `W` instead of `WIFI`
- `G` instead of `GSM`
- `L` instead of `LTE`
- `B` instead of `BT`
- `E` instead of `BLE`

### Application Usage
When querying, use the letter codes:

```sql
-- Find all WiFi networks
SELECT * FROM app.wigle_csv_networks WHERE type = 'W';

-- Find all Bluetooth devices
SELECT * FROM app.wigle_csv_networks WHERE type IN ('B', 'E');

-- Count by type
SELECT type, COUNT(*) FROM app.wigle_csv_networks GROUP BY type;
```

### Type Distribution

**Networks (46,507 total):**
- Bluetooth LE (E): 27,365 (58.8%)
- WiFi (W): 9,580 (20.6%)
- Bluetooth (B): 9,490 (20.4%)
- LTE (L): 55 (0.1%)
- GSM (G): 17 (0.0%)

**Observations (123,047 total):**
- Bluetooth LE (E): 48,428 (39.4%)
- WiFi (W): 46,096 (37.5%)
- Bluetooth (B): 24,536 (20.0%)
- LTE (L): 2,020 (1.6%)
- GSM (G): 1,967 (1.6%)

## WiGLE.net Reference

These codes follow the WiGLE.net standard for network type classification:
- W = Wireless (WiFi)
- G = GSM/Cellular
- L = LTE/Mobile broadband
- B = Bluetooth
- E = Bluetooth LE (Low Energy)

For more information, see: https://wigle.net/

## Files Using Type Codes

- `wigle_csv_networks_final.csv` - Networks table with type codes
- `wigle_csv_locations_final.csv` - Locations table with type codes

The `type` column in both files uses single-letter codes as specified above.
