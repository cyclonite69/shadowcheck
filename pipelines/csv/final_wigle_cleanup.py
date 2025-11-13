#!/usr/bin/env python3
"""
WiGLE CSV Final Cleanup & Preparation
- Clean SSID whitespace (strip leading/trailing)
- Uppercase all BSSIDs
- Deduplicate networks by BSSID (keep strongest RSSI)
- Convert timestamps to Unix epoch
- Generate import-ready CSVs
"""

import pandas as pd
import csv
from datetime import datetime

# Read original CSV
print("Reading original CSV...")
df = pd.read_csv('/mnt/user-data/uploads/WiGLE_CSV_Export_7-2-24__1_.csv', skiprows=1)
print(f"  Original records: {len(df):,}\n")

# === Data Cleaning ===
print("Cleaning data...")

# 1. Clean SSID: strip whitespace and convert empty to None
df['ssid_clean'] = df['SSID'].apply(
    lambda x: str(x).strip() if pd.notna(x) and str(x).strip() else None
)

ssid_before = df['SSID'].notna().sum()
ssid_after = df['ssid_clean'].notna().sum()
print(f"  SSID: {ssid_before:,} → {ssid_after:,} (removed {ssid_before - ssid_after} empty)")

# 2. Uppercase BSSIDs
df['bssid_upper'] = df['MAC'].str.upper()
print(f"  BSSID: All MAC addresses converted to uppercase")

# 3. Convert timestamps to Unix epoch
df['epoch_time'] = pd.to_datetime(df['FirstSeen']).astype('int64') // 10**9
print(f"  Timestamps: Converted to Unix epoch\n")

# === Networks Table (Deduplicated) ===
print("Creating networks table (deduplicated)...")
df_sorted = df.sort_values('RSSI', ascending=False)
networks = df_sorted.drop_duplicates(subset='MAC', keep='first').copy()

networks_df = pd.DataFrame({
    'source_id': None,
    'bssid': networks['bssid_upper'],
    'ssid': networks['ssid_clean'],
    'frequency': networks['Frequency'].fillna(0).astype('int64'),
    'capabilities': networks['AuthMode'],
    'lasttime': networks['epoch_time'],
    'lastlat': networks['CurrentLatitude'],
    'lastlon': networks['CurrentLongitude'],
    'type': networks['Type'],
    'bestlevel': networks['RSSI'].astype('int64'),
    'bestlat': networks['CurrentLatitude'],
    'bestlon': networks['CurrentLongitude'],
    'rcois': networks['RCOIs'],
    'mfgrid': networks['MfgrId'],
    'service': None,
    'sqlite_filename': 'WiGLE_CSV_Export_7-2-24.csv'
})

print(f"  Total networks: {len(networks_df):,}")
print(f"  Deduplication removed: {len(df) - len(networks_df):,} records")
print(f"  Networks with SSID: {networks_df['ssid'].notna().sum():,}")

# === Locations Table (All observations) ===
print(f"\nCreating locations table (all observations)...")
locations_df = pd.DataFrame({
    'source_id': None,
    '_id': range(1, len(df) + 1),
    'bssid': df['bssid_upper'],
    'level': df['RSSI'].astype('int64'),
    'lat': df['CurrentLatitude'],
    'lon': df['CurrentLongitude'],
    'altitude': df['AltitudeMeters'],
    'accuracy': df['AccuracyMeters'],
    'time': df['epoch_time'],
    'external': 0,
    'mfgrid': df['MfgrId'],
    'sqlite_filename': 'WiGLE_CSV_Export_7-2-24.csv'
})

print(f"  Total observations: {len(locations_df):,}")

# === Export CSVs ===
print(f"\nExporting to CSV...")
networks_df.to_csv('/home/claude/wigle_csv_networks_final.csv', index=False, quoting=csv.QUOTE_NONNUMERIC)
locations_df.to_csv('/home/claude/wigle_csv_locations_final.csv', index=False, quoting=csv.QUOTE_NONNUMERIC)

print(f"  ✓ wigle_csv_networks_final.csv: {len(networks_df):,} rows")
print(f"  ✓ wigle_csv_locations_final.csv: {len(locations_df):,} rows")

# === Verification ===
print(f"\nVerification:")
print(f"  Networks CSV size: {pd.read_csv('/home/claude/wigle_csv_networks_final.csv').shape}")
print(f"  Locations CSV size: {pd.read_csv('/home/claude/wigle_csv_locations_final.csv').shape}")

# Show samples
print(f"\nSample Networks:")
print(networks_df[['bssid', 'ssid', 'bestlevel', 'type']].head(5))

print(f"\nSample Locations:")
print(locations_df[['bssid', 'level', 'lat', 'lon', 'time']].head(5))

print(f"\n✓ Cleanup complete!")
