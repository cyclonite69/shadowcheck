#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import re
from datetime import datetime, timezone
import sys
import glob
import os

# --- CONFIGURATION ---
SOURCE_DIR = "raw_kml"  # Directory containing multiple KML files
OUTPUT_DIR = "new_kml_files"  # Directory for generated SQL files
TARGET_SOURCE_ID = 5  # Set your actual source_id here (e.g., 5)
DEBUG = True  # Set to True for debugging output
# --- END CONFIGURATION ---

# Regex for parsing description (from working script)
DESC_REGEX = re.compile(
    r"Network ID: ([\w:]{17})"       # 1. BSSID (exactly 17 chars)
    r".*?Time: ([\d\-T:\.\+Z]+)"     # 2. Time (ISO 8601)
    r".*?Signal: ([\-\d\.]+)"        # 3. Signal/Level (dBm)
    r".*?Accuracy: ([\d\.]+)"        # 4. Accuracy (meters)
    r".*?Type: ([\w]+)"              # 5. Network Type (WIFI, BLE, etc.)
, re.DOTALL | re.MULTILINE)

print("--- KML Parser starting FULL extraction from multiple files in raw_kml/ ---", file=sys.stderr)

# UPDATED TARGET TABLE AND COLUMNS
SQL_HEADER = (
    "INSERT INTO app.kml_locations_staging (source_id, bssid, level, lat, lon, accuracy, time, kml_filename, ssid, network_type) VALUES"
)

def parse_kml(kml_file):
    try:
        tree = ET.parse(kml_file)
    except FileNotFoundError:
        print(f"-- ERROR: KML file '{kml_file}' not found. Skipping.", file=sys.stderr)
        return None

    root = tree.getroot()
    ns = {'ns': 'http://www.opengis.net/kml/2.2'}
    inserts = []
    placemark_count = 0
    match_count = 0
    
    placemarks = root.findall('.//ns:Placemark', ns)
    if not placemarks:
        print(f"-- WARNING: No Placemarks found in {kml_file}.", file=sys.stderr)
    
    for placemark in placemarks:
        placemark_count += 1
        name_tag = placemark.find('ns:name', ns)
        desc_tag = placemark.find('ns:description', ns)
        coord_tag = placemark.find('ns:Point/ns:coordinates', ns)
        
        if desc_tag is None or coord_tag is None:
            if DEBUG:
                print(f"-- DEBUG: Skipping placemark in {kml_file} - missing description or coordinates.", file=sys.stderr)
            continue
            
        desc_text = desc_tag.text or ''
        match = DESC_REGEX.search(desc_text)
        if not match:
            if DEBUG:
                print(f"-- DEBUG: No regex match in {kml_file} for placemark description: {desc_text[:100]}...", file=sys.stderr)
            continue
        match_count += 1
            
        # Unpack the 5 captured groups from the Regex match
        bssid, time_iso, level, accuracy, network_type = match.groups()
        
        # 1. Extract SSID from <name> - Robustly check for tag text content to avoid NoneType.strip()
        if name_tag is not None and name_tag.text is not None:
            ssid = name_tag.text.strip()
        else:
            ssid = "(No Name)"
        
        # Clean and escape the SSID for SQL insertion
        if ssid in ('(no SSID)', 'Encryption:', 'Attributes: Misc', '(No Name)', 'WEP', 'WPA', 'WPA2'):
            ssid_sql = 'NULL'
        else:
            # Correctly perform string escaping outside of the f-string expression
            escaped_ssid = ssid.replace("'", "''")
            ssid_sql = f"'{escaped_ssid}'"
            
        # 2. Extract Lon and Lat
        try:
            # KML order is LON, LAT, ALT
            lon_str, lat_str, *alt_str = coord_tag.text.strip().split(',')
        except ValueError:
            # Handle cases where only Lon, Lat are present
            lon_str, lat_str = coord_tag.text.strip().split(',')
        
        # 3. Convert ISO 8601 Time to Epoch Milliseconds
        try:
            dt_obj = datetime.fromisoformat(time_iso)
            epoch_seconds = dt_obj.astimezone(timezone.utc).timestamp()
            epoch_milliseconds = int(epoch_seconds * 1000)
        except ValueError:
            print(f"-- WARNING: Could not parse time for BSSID {bssid} in {kml_file}", file=sys.stderr)
            continue
            
        # 4. Create the comprehensive SQL VALUES tuple string
        insert_line = (
            f"({TARGET_SOURCE_ID}, '{bssid}', {int(float(level))}, {float(lat_str)}, "
            f"{float(lon_str)}, {float(accuracy)}, {epoch_milliseconds}, '{os.path.basename(kml_file)}', {ssid_sql}, '{network_type}')"
        )
        inserts.append(insert_line)
    
    if DEBUG:
        print(f"-- DEBUG: {placemark_count} placemarks found, {match_count} matched in {kml_file}", file=sys.stderr)
    
    return inserts

if __name__ == '__main__':
    # Create output directory if not exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    kml_files = glob.glob(os.path.join(SOURCE_DIR, '*.kml'))
    if not kml_files:
        print(f"-- ERROR: No KML files found in {SOURCE_DIR}. Exiting.", file=sys.stderr)
        sys.exit(1)
    
    total_rows = 0
    for kml_file in kml_files:
        inserts = parse_kml(kml_file)
        if inserts is None:
            continue
        
        # Output SQL file per input KML
        base_name = os.path.basename(kml_file).rsplit('.', 1)[0]
        output_sql_file = os.path.join(OUTPUT_DIR, f"{base_name}.sql")
        
        with open(output_sql_file, 'w') as f:
            f.write(SQL_HEADER + "\n")
            for i, line in enumerate(inserts):
                f.write(line + (",\n" if i < len(inserts) - 1 else ";\n"))
        
        rows = len(inserts)
        total_rows += rows
        print(f"--- Generated SQL file: {output_sql_file} with {rows} rows ---", file=sys.stderr)
    
    print(f"--- Processed {len(kml_files)} files, {total_rows} total rows ---", file=sys.stderr)
