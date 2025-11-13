#!/usr/bin/env python3
"""
WiGLE SQLite Database Parser for ShadowCheck
Extracts data from WiGLE Android app SQLite database backups (supports .zip files)
and loads it into staging tables.
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
            db_files = [f for f in zip_ref.namelist() if f.endswith('.sqlite') or f.endswith('.db')]
            if not db_files:
                db_files = [f for f in zip_ref.namelist() if not f.endswith('/')]
            if not db_files:
                raise Exception("No database file found in zip archive")
            db_file = db_files[0]
            zip_ref.extract(db_file, tmpdir)
            extracted_path = os.path.join(tmpdir, db_file)
            temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.sqlite')
            with open(extracted_path, 'rb') as src:
                temp_db.write(src.read())
            temp_db.close()
            return temp_db.name

def parse_wigle_database(db_path):
    """Parse WiGLE SQLite database and extract networks, locations, and routes"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cur.fetchall()]
    print(f"Found tables: {', '.join(tables)}", file=sys.stderr)

    networks, locations, routes = [], [], []

    if 'network' in tables:
        print("Parsing networks table...", file=sys.stderr)
        cur.execute("SELECT bssid, ssid, frequency, capabilities, type, lasttime, lastlat, lastlon, bestlat, bestlon, bestlevel FROM network WHERE bssid IS NOT NULL")
        for row in cur.fetchall():
            networks.append({
                'bssid': row['bssid'].upper(),
                'ssid': row['ssid'] or None,
                'frequency': row['frequency'] or None,
                'capabilities': row['capabilities'],
                'network_type': row['type'] if 'type' in row.keys() else 'W',
                'last_seen': row['lasttime'] or None,
                'last_lat': row['lastlat'] if 'lastlat' in row.keys() else None,
                'last_lon': row['lastlon'] if 'lastlon' in row.keys() else None,
                'bestlevel': row['bestlevel'] if 'bestlevel' in row.keys() else None,
                'bestlat': row['bestlat'] if 'bestlat' in row.keys() else None,
                'bestlon': row['bestlon'] if 'bestlon' in row.keys() else None,
            })

    if 'location' in tables:
        print("Parsing location table...", file=sys.stderr)
        cur.execute("SELECT bssid, level, lat, lon, altitude, accuracy, time FROM location WHERE bssid IS NOT NULL AND lat IS NOT NULL AND lon IS NOT NULL AND lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180 AND NOT (lat = 0 AND lon = 0) LIMIT 1000000")
        for row in cur.fetchall():
            locations.append({
                'bssid': row['bssid'].upper(),
                'level': row['level'] or None,
                'lat': row['lat'],
                'lon': row['lon'],
                'altitude': row['altitude'] or 0.0,
                'accuracy': row['accuracy'] or None,
                'time': row['time'] or None,
            })

    if 'route' in tables:
        print("Parsing route table...", file=sys.stderr)
        cur.execute("SELECT * FROM route")
        route_columns = [d[0] for d in cur.description]
        for row in cur.fetchall():
            routes.append({col: row[col] for col in route_columns})

    conn.close()
    return networks, locations, routes

def load_to_database(source_filename, networks, locations, routes, db_config):
    """Load parsed data into staging tables"""
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()
    now = datetime.utcnow()
    networks_inserted, locations_inserted, routes_inserted = 0, 0, 0

    try:
        print(f"Loading {len(networks)} networks into staging...", file=sys.stderr)
        for network in networks:
            try:
                cur.execute("""
                    INSERT INTO app.wigle_sqlite_networks_staging
                    (bssid, ssid, frequency, capabilities, type, lasttime, lastlat, lastlon, bestlevel, bestlat, bestlon, sqlite_filename, imported_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    network['bssid'], network.get('ssid'), network.get('frequency'), network.get('capabilities'),
                    network.get('network_type', 'W'), network.get('last_seen'), network.get('last_lat'), network.get('last_lon'),
                    network.get('bestlevel'), network.get('bestlat'), network.get('bestlon'), source_filename, now
                ))
                networks_inserted += 1
            except Exception as e:
                print(f"Error inserting network {network['bssid']}: {e}", file=sys.stderr)

        print(f"Loading {len(locations)} locations into staging...", file=sys.stderr)
        for location in locations:
            try:
                cur.execute("""
                    INSERT INTO app.wigle_sqlite_locations_staging
                    (bssid, level, lat, lon, altitude, accuracy, time, sqlite_filename, imported_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (bssid, level, lat, lon, altitude, accuracy, "time") DO NOTHING
                """, (
                    location['bssid'], location.get('level'), location['lat'], location['lon'],
                    location.get('altitude', 0.0), location.get('accuracy'), location.get('time'),
                    source_filename, now
                ))
                locations_inserted += 1
            except Exception as e:
                print(f"Error inserting location for {location['bssid']}: {e}", file=sys.stderr)

        if routes:
            print(f"Loading {len(routes)} routes into staging...", file=sys.stderr)
            for route in routes:
                # Assuming route table has 'lat', 'lon', 'altitude', 'time'
                try:
                    cur.execute("""
                        INSERT INTO app.wigle_sqlite_routes_staging
                        (lat, lon, altitude, time, sqlite_filename, imported_at)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        route.get('lat'), route.get('lon'), route.get('altitude'), route.get('time'),
                        source_filename, now
                    ))
                    routes_inserted += 1
                except Exception as e:
                    print(f"Error inserting route point: {e}", file=sys.stderr)

        conn.commit()
        print(f"✓ Loaded {source_filename}: {networks_inserted} networks, {locations_inserted} locations, {routes_inserted} routes", file=sys.stderr)

    except Exception as e:
        conn.rollback()
        print(f"✗ Error loading {source_filename}: {e}", file=sys.stderr)
        raise
    finally:
        cur.close()
        conn.close()

    return {'networks': networks_inserted, 'locations': locations_inserted, 'routes': routes_inserted}

def main():
    if len(sys.argv) < 2:
        print("Usage: wigle_sqlite_parser.py <wigle_db.zip or wigle_db.sqlite>")
        sys.exit(1)

    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found")
        sys.exit(1)

    db_config = {
        'host': os.getenv('DB_HOST', '127.0.0.1'),
        'port': int(os.getenv('DB_PORT', '5432')),
        'database': os.getenv('DB_NAME', 'shadowcheck'),
        'user': os.getenv('DB_USER', 'shadowcheck_user'),
        'password': os.getenv('DB_PASSWORD', 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=')
    }

    db_path = input_file
    temp_db = None
    if input_file.endswith('.zip'):
        print(f"Extracting SQLite database from {input_file}...", file=sys.stderr)
        temp_db = extract_sqlite_from_zip(input_file)
        db_path = temp_db

    try:
        print("Parsing WiGLE database...", file=sys.stderr)
        networks, locations, routes = parse_wigle_database(db_path)
        print(f"Found {len(networks)} networks, {len(locations)} location observations, {len(routes)} route points", file=sys.stderr)

        source_filename = os.path.basename(input_file)
        result = load_to_database(source_filename, networks, locations, routes, db_config)

        print(json.dumps({
            'ok': True,
            'file': source_filename,
            'stats': result
        }))

    finally:
        if temp_db and os.path.exists(temp_db):
            os.unlink(temp_db)

if __name__ == '__main__':
    main()
