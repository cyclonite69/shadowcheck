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
        # Extract name (usually SSID or BSSID)
        name_elem = pm.find('kml:name', NS)
        name = name_elem.text if name_elem is not None else None

        # Extract description (contains metadata)
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

                # Parse description for metadata
                metadata = parse_description(description)

                # Create location entry
                location = {
                    'bssid': metadata.get('bssid', name),
                    'ssid': metadata.get('ssid'),
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
                    'bssid': metadata.get('bssid', name),
                    'ssid': metadata.get('ssid'),
                    'frequency': metadata.get('frequency'),
                    'capabilities': metadata.get('capabilities'),
                    'first_seen': metadata.get('first_seen'),
                    'last_seen': metadata.get('last_seen'),
                    'network_type': metadata.get('type')
                }

                # Only add unique networks
                if not any(n['bssid'] == network['bssid'] for n in networks):
                    networks.append(network)

    return networks, locations

def parse_description(desc):
    """Parse KML description field for network metadata"""
    metadata = {}

    if not desc:
        return metadata

    # WiGLE KML format usually has key-value pairs
    lines = desc.split('\n')
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip().lower()
            value = value.strip()

            if key in ['bssid', 'mac', 'netid', 'network id']:
                metadata['bssid'] = value
            elif key == 'ssid':
                metadata['ssid'] = value if value and value != '<hidden>' else None
            elif key in ['signal', 'level', 'rssi']:
                try:
                    metadata['level'] = int(float(value.replace('dBm', '').strip()))
                except:
                    pass
            elif key == 'frequency':
                try:
                    metadata['frequency'] = int(value.replace('MHz', '').strip())
                except:
                    pass
            elif key in ['type', 'network_type']:
                metadata['type'] = value
            elif key in ['encryption', 'capabilities', 'security']:
                metadata['encryption'] = value
                metadata['capabilities'] = value
            elif key == 'time':
                try:
                    # Try to parse ISO 8601 timestamp first
                    from dateutil import parser as date_parser
                    dt = date_parser.parse(value)
                    metadata['time'] = int(dt.timestamp() * 1000)  # Convert to Unix milliseconds
                except:
                    try:
                        # Fallback: try Unix milliseconds
                        metadata['time'] = int(value)
                    except:
                        pass
            elif key == 'accuracy':
                try:
                    metadata['accuracy'] = float(value.replace('m', '').strip())
                except:
                    pass
            elif key == 'attributes':
                # Store Bluetooth attributes
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
