#!/usr/bin/env python3
"""
WiGLE SQLite Database Parser for ShadowCheck
Extracts data from WiGLE Android app SQLite database backups (supports .zip files)
"""

import sqlite3
import sys
import os
import zipfile
import tempfile
import psycopg2
import json
from datetime import datetime

def extract_sqlite_from_zip(zip_path):
    """Extract SQLite database from zip file"""
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Find the SQLite database file
            db_files = [f for f in zip_ref.namelist() if f.endswith('.sqlite') or f.endswith('.db')]

            if not db_files:
                # Try to find any file that might be a database
                db_files = [f for f in zip_ref.namelist() if not f.endswith('/')]

            if not db_files:
                raise Exception("No database file found in zip archive")

            db_file = db_files[0]
            zip_ref.extract(db_file, tmpdir)
            extracted_path = os.path.join(tmpdir, db_file)

            # Copy to a temporary file that will persist
            temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.sqlite')
            with open(extracted_path, 'rb') as src:
                temp_db.write(src.read())
            temp_db.close()

            return temp_db.name

def parse_wigle_database(db_path):
    """Parse WiGLE SQLite database and extract networks and locations"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get table names
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cur.fetchall()]
    print(f"Found tables: {', '.join(tables)}", file=sys.stderr)

    networks = []
    locations = []

    # Parse networks table (if exists)
    if 'network' in tables:
        print(f"Parsing networks table...", file=sys.stderr)
        cur.execute("""
            SELECT bssid, ssid, frequency, capabilities, type,
                   lasttime, lastlat, lastlon, bestlat, bestlon, bestlevel
            FROM network
            WHERE bssid IS NOT NULL
        """)

        for row in cur.fetchall():
            network = {
                'bssid': row['bssid'],
                'ssid': row['ssid'] if row['ssid'] else None,
                'frequency': row['frequency'] if row['frequency'] else None,
                'capabilities': row['capabilities'],
                'network_type': row['type'] if 'type' in row.keys() else 'W',
                'last_seen': row['lasttime'] if row['lasttime'] else None,
                'last_lat': row['lastlat'] if 'lastlat' in row.keys() else None,
                'last_lon': row['lastlon'] if 'lastlon' in row.keys() else None,
            }
            networks.append(network)

    # Parse location table (if exists)
    if 'location' in tables:
        print(f"Parsing location table...", file=sys.stderr)
        cur.execute("""
            SELECT bssid, level, lat, lon, altitude, accuracy, time
            FROM location
            WHERE bssid IS NOT NULL
              AND lat IS NOT NULL
              AND lon IS NOT NULL
              AND lat BETWEEN -90 AND 90
              AND lon BETWEEN -180 AND 180
              AND NOT (lat = 0 AND lon = 0)
            LIMIT 1000000
        """)

        for row in cur.fetchall():
            location = {
                'bssid': row['bssid'],
                'level': row['level'] if row['level'] else None,
                'lat': row['lat'],
                'lon': row['lon'],
                'altitude': row['altitude'] if row['altitude'] else 0.0,
                'accuracy': row['accuracy'] if row['accuracy'] else None,
                'time': row['time'] if row['time'] else None,
            }
            locations.append(location)

    conn.close()

    return networks, locations

def load_to_database(source_filename, networks, locations, db_config):
    """Load parsed data directly into production tables"""
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()

    networks_inserted = 0
    locations_inserted = 0

    try:
        print(f"Loading {len(networks)} networks into production...", file=sys.stderr)

        # Insert networks directly into networks_legacy
        for network in networks:
            try:
                cur.execute("""
                    INSERT INTO app.networks_legacy
                    (bssid, ssid, frequency, capabilities, type, lasttime, lastlat, lastlon)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (bssid) DO UPDATE SET
                        ssid = COALESCE(EXCLUDED.ssid, app.networks_legacy.ssid),
                        frequency = COALESCE(EXCLUDED.frequency, app.networks_legacy.frequency),
                        capabilities = COALESCE(EXCLUDED.capabilities, app.networks_legacy.capabilities),
                        lasttime = GREATEST(EXCLUDED.lasttime, app.networks_legacy.lasttime),
                        lastlat = COALESCE(EXCLUDED.lastlat, app.networks_legacy.lastlat),
                        lastlon = COALESCE(EXCLUDED.lastlon, app.networks_legacy.lastlon)
                """, (
                    network['bssid'],
                    network.get('ssid'),
                    network.get('frequency'),
                    network.get('capabilities'),
                    network.get('network_type', 'W'),
                    network.get('last_seen'),
                    network.get('last_lat'),
                    network.get('last_lon')
                ))
                networks_inserted += 1

                if networks_inserted % 1000 == 0:
                    print(f"  {networks_inserted} networks processed...", file=sys.stderr)

            except Exception as e:
                print(f"Error inserting network {network['bssid']}: {e}", file=sys.stderr)
                continue

        print(f"Loading {len(locations)} locations into production...", file=sys.stderr)

        # Insert locations directly into locations_legacy
        for location in locations:
            try:
                cur.execute("""
                    INSERT INTO app.locations_legacy
                    (bssid, level, lat, lon, altitude, accuracy, time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    location['bssid'],
                    location.get('level'),
                    location['lat'],
                    location['lon'],
                    location.get('altitude', 0.0),
                    location.get('accuracy'),
                    location.get('time')
                ))
                locations_inserted += 1

                if locations_inserted % 10000 == 0:
                    print(f"  {locations_inserted} locations processed...", file=sys.stderr)

            except Exception as e:
                print(f"Error inserting location for {location['bssid']}: {e}", file=sys.stderr)
                continue

        conn.commit()
        print(f"✓ Loaded {source_filename}: {networks_inserted} networks, {locations_inserted} locations", file=sys.stderr)

    except Exception as e:
        conn.rollback()
        print(f"✗ Error loading {source_filename}: {e}", file=sys.stderr)
        raise
    finally:
        cur.close()
        conn.close()

    return {'networks': networks_inserted, 'locations': locations_inserted}

def main():
    if len(sys.argv) < 2:
        print("Usage: wigle_sqlite_parser.py <wigle_db.zip or wigle_db.sqlite>")
        sys.exit(1)

    input_file = sys.argv[1]

    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found")
        sys.exit(1)

    # Database configuration from environment
    db_config = {
        'host': os.getenv('DB_HOST', '127.0.0.1'),
        'port': int(os.getenv('DB_PORT', '5432')),
        'database': os.getenv('DB_NAME', 'shadowcheck'),
        'user': os.getenv('DB_USER', 'shadowcheck_user'),
        'password': os.getenv('DB_PASSWORD', 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=')
    }

    # Extract if it's a zip file
    db_path = input_file
    temp_db = None

    if input_file.endswith('.zip'):
        print(f"Extracting SQLite database from {input_file}...", file=sys.stderr)
        temp_db = extract_sqlite_from_zip(input_file)
        db_path = temp_db

    try:
        print(f"Parsing WiGLE database...", file=sys.stderr)
        networks, locations = parse_wigle_database(db_path)

        print(f"Found {len(networks)} networks, {len(locations)} location observations", file=sys.stderr)

        source_filename = os.path.basename(input_file)
        result = load_to_database(source_filename, networks, locations, db_config)

        # Output JSON for API response
        print(json.dumps({
            'ok': True,
            'file': source_filename,
            'stats': result
        }))

    finally:
        # Clean up temporary database file
        if temp_db and os.path.exists(temp_db):
            os.unlink(temp_db)

if __name__ == '__main__':
    main()
