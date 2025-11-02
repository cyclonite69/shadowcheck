#!/usr/bin/env python3
"""
KML Parser for ShadowCheck
Parses WiGLE KML exports and loads them into PostgreSQL staging tables
"""

import xml.etree.ElementTree as ET
import sys
import psycopg2
import os
from datetime import datetime

# KML namespace
NS = {'kml': 'http://www.opengis.net/kml/2.2'}

def parse_kml_file(kml_path):
    """Parse a KML file and extract network placemarks"""
    tree = ET.parse(kml_path)
    root = tree.getroot()

    networks = []
    locations = []

    # Find all Placemark elements
    placemarks = root.findall('.//kml:Placemark', NS)

    for pm in placemarks:
        # Extract name (usually SSID - may be "(no SSID)")
        name_elem = pm.find('kml:name', NS)
        name = name_elem.text if name_elem is not None else None

        # Extract description (contains metadata including BSSID as "Network ID:")
        desc_elem = pm.find('kml:description', NS)
        description = desc_elem.text if desc_elem is not None else ''

        # Extract coordinates
        point = pm.find('.//kml:Point/kml:coordinates', NS)
        if point is not None and point.text:
            coords = point.text.strip().split(',')
            if len(coords) >= 2:
                lon = float(coords[0])
                lat = float(coords[1])
                altitude = float(coords[2]) if len(coords) > 2 else 0.0

                # Parse description for metadata (including BSSID)
                metadata = parse_description(description)

                # Use Network ID from description as BSSID
                bssid = metadata.get('bssid')
                if not bssid:
                    continue  # Skip if no BSSID found

                # Use name as SSID (unless it's "(no SSID)")
                ssid = None
                if name and name not in ['(no SSID)', '(no_SSID)', '<hidden>', '']:
                    ssid = name

                # Create location entry
                location = {
                    'bssid': bssid.upper(),  # Normalize to uppercase
                    'ssid': ssid,
                    'lat': lat,
                    'lon': lon,
                    'altitude': altitude,
                    'level': metadata.get('level'),
                    'accuracy': metadata.get('accuracy'),
                    'time': metadata.get('time'),
                    'network_type': metadata.get('type'),
                    'encryption_type': metadata.get('encryption')
                }
                locations.append(location)

                # Create network entry (unique by BSSID)
                network = {
                    'bssid': bssid.upper(),  # Normalize to uppercase
                    'ssid': ssid,
                    'frequency': metadata.get('frequency'),
                    'capabilities': metadata.get('capabilities'),
                    'first_seen': metadata.get('time'),  # Will be updated to min time
                    'last_seen': metadata.get('time'),   # Will be updated to max time
                    'network_type': metadata.get('type')
                }

                # Only add unique networks (will compute first/last seen later)
                if not any(n['bssid'] == network['bssid'] for n in networks):
                    networks.append(network)

    # Compute first_seen/last_seen for each network from location timestamps
    if locations:
        # Group locations by BSSID
        bssid_times = {}
        for loc in locations:
            bssid = loc['bssid']
            time_val = loc.get('time')
            if time_val:
                if bssid not in bssid_times:
                    bssid_times[bssid] = []
                bssid_times[bssid].append(time_val)

        # Update networks with computed first/last seen
        for network in networks:
            bssid = network['bssid']
            if bssid in bssid_times and bssid_times[bssid]:
                times = bssid_times[bssid]
                network['first_seen'] = min(times)
                network['last_seen'] = max(times)

    return networks, locations

def parse_description(desc):
    """Parse KML description field for network metadata

    WiGLE KML format example:
    Network ID: AA:BB:CC:DD:EE:FF
    Time: 2025-06-17T01:07:05.000-07:00
    Signal: -88.0
    Accuracy: 3.79009
    Type: BLE
    """
    metadata = {}

    if not desc:
        return metadata

    # WiGLE KML format has key-value pairs separated by newlines
    lines = desc.split('\n')
    for line in lines:
        if ':' not in line:
            continue

        key, value = line.split(':', 1)
        key = key.strip().lower()
        value = value.strip()

        if key in ['network id', 'netid', 'bssid', 'mac']:
            metadata['bssid'] = value
        elif key == 'ssid':
            metadata['ssid'] = value if value and value not in ['<hidden>', '(no SSID)'] else None
        elif key in ['signal', 'level', 'rssi']:
            try:
                metadata['level'] = int(float(value))
            except:
                pass
        elif key == 'frequency':
            try:
                # Handle both "2437 MHz" and "2437" formats
                freq_str = value.replace('MHz', '').replace('mhz', '').strip()
                metadata['frequency'] = int(float(freq_str))
            except:
                pass
        elif key in ['type', 'network_type']:
            metadata['type'] = value
        elif key in ['encryption', 'capabilities', 'security']:
            metadata['encryption'] = value
            metadata['capabilities'] = value
        elif key == 'time':
            try:
                # Parse ISO 8601 timestamp (e.g., "2025-06-17T01:07:05.000-07:00")
                from datetime import datetime
                # Remove timezone for simpler parsing, then parse
                if 'T' in value:
                    # Handle ISO format with timezone offset
                    dt_str = value.split('.')[0]  # Remove milliseconds
                    dt_str = dt_str.split('+')[0].split('-')[0:-1]  # Remove timezone
                    dt_str = 'T'.join(dt_str) if len(dt_str) > 1 else dt_str[0]

                    # Try parsing with dateutil if available, else use basic parsing
                    try:
                        from dateutil import parser as date_parser
                        dt = date_parser.parse(value)
                    except:
                        # Fallback: manual parse
                        dt = datetime.fromisoformat(value.replace('Z', '+00:00'))

                    metadata['time'] = int(dt.timestamp() * 1000)  # Convert to Unix milliseconds
            except:
                try:
                    # Fallback: try Unix milliseconds
                    metadata['time'] = int(value)
                except:
                    pass
        elif key == 'accuracy':
            try:
                metadata['accuracy'] = float(value)
            except:
                pass
        elif key == 'attributes':
            metadata['attributes'] = value

    return metadata

def load_to_database(kml_filename, networks, locations, db_config):
    """Load parsed KML data into PostgreSQL staging tables"""
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()

    networks_inserted = 0
    locations_inserted = 0

    try:
        # Insert networks
        for network in networks:
            try:
                cur.execute("""
                    INSERT INTO app.kml_networks_staging
                    (bssid, ssid, frequency, capabilities, first_seen, last_seen, kml_filename, network_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (bssid, ssid) DO UPDATE SET
                        frequency = COALESCE(EXCLUDED.frequency, app.kml_networks_staging.frequency),
                        last_seen = GREATEST(EXCLUDED.last_seen, app.kml_networks_staging.last_seen)
                """, (
                    network['bssid'],
                    network.get('ssid'),
                    network.get('frequency'),
                    network.get('capabilities'),
                    network.get('first_seen'),
                    network.get('last_seen'),
                    kml_filename,
                    network.get('network_type')
                ))
                networks_inserted += 1
            except Exception as e:
                print(f"Error inserting network {network['bssid']}: {e}")
                continue

        # Insert locations
        for location in locations:
            try:
                cur.execute("""
                    INSERT INTO app.kml_locations_staging
                    (source_id, bssid, level, lat, lon, altitude, accuracy, time, kml_filename, ssid, network_type, encryption_type)
                    VALUES (1, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    location['bssid'],
                    location.get('level'),
                    location['lat'],
                    location['lon'],
                    location.get('altitude', 0.0),
                    location.get('accuracy'),
                    location.get('time'),
                    kml_filename,
                    location.get('ssid'),
                    location.get('network_type'),
                    location.get('encryption_type')
                ))
                locations_inserted += 1
            except Exception as e:
                print(f"Error inserting location for {location['bssid']}: {e}")
                continue

        conn.commit()
        print(f"✓ Loaded {kml_filename}: {networks_inserted} networks, {locations_inserted} locations")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error loading {kml_filename}: {e}")
        raise
    finally:
        cur.close()
        conn.close()

    return {'networks': networks_inserted, 'locations': locations_inserted}

def main():
    if len(sys.argv) < 2:
        print("Usage: kml_parser.py <kml_file>")
        sys.exit(1)

    kml_file = sys.argv[1]

    if not os.path.exists(kml_file):
        print(f"Error: File {kml_file} not found")
        sys.exit(1)

    # Database configuration from environment
    db_config = {
        'host': os.getenv('DB_HOST', '127.0.0.1'),
        'port': int(os.getenv('DB_PORT', '5432')),
        'database': os.getenv('DB_NAME', 'shadowcheck'),
        'user': os.getenv('DB_USER', 'shadowcheck_user'),
        'password': os.getenv('DB_PASSWORD', 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=')
    }

    print(f"Parsing {kml_file}...")
    networks, locations = parse_kml_file(kml_file)

    print(f"Found {len(networks)} unique networks, {len(locations)} location observations")

    kml_filename = os.path.basename(kml_file)
    result = load_to_database(kml_filename, networks, locations, db_config)

    # Output JSON for API response
    import json
    print(json.dumps({
        'ok': True,
        'file': kml_filename,
        'stats': result
    }))

if __name__ == '__main__':
    main()
