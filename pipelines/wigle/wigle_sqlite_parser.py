#!/usr/bin/env python3
"""
WiGLE SQLite Database Parser for ShadowCheck (OPTIMIZED VERSION)
Extracts data from WiGLE Android app SQLite database backups (supports .zip files)
and loads it into staging tables using BATCH INSERTS for massive speed improvement.
"""

import sqlite3
import sys
import os
import zipfile
import tempfile
import psycopg2
import psycopg2.extras
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

def sanitize_string(s):
    """Remove NULL bytes from strings (PostgreSQL rejects them)"""
    if s is None:
        return None
    if isinstance(s, str):
        return s.replace('\x00', '')
    return s

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
        cur.execute("SELECT bssid, ssid, frequency, capabilities, type, lasttime, lastlat, lastlon, bestlat, bestlon, bestlevel, rcois, mfgrid, service FROM network WHERE bssid IS NOT NULL")
        for row in cur.fetchall():
            networks.append({
                'bssid': sanitize_string(row['bssid']).upper(),
                'ssid': sanitize_string(row['ssid']) or None,
                'frequency': row['frequency'] or None,
                'capabilities': sanitize_string(row['capabilities']),
                'network_type': sanitize_string(row['type']) if 'type' in row.keys() else 'W',
                'last_seen': row['lasttime'] or None,
                'last_lat': row['lastlat'] if 'lastlat' in row.keys() else None,
                'last_lon': row['lastlon'] if 'lastlon' in row.keys() else None,
                'bestlevel': row['bestlevel'] if 'bestlevel' in row.keys() else None,
                'bestlat': row['bestlat'] if 'bestlat' in row.keys() else None,
                'bestlon': row['bestlon'] if 'bestlon' in row.keys() else None,
                'rcois': sanitize_string(row['rcois']) if 'rcois' in row.keys() and row['rcois'] else None,
                'mfgrid': row['mfgrid'] if 'mfgrid' in row.keys() and row['mfgrid'] != 0 else None,
                'service': sanitize_string(row['service']) if 'service' in row.keys() and row['service'] else None,
            })

    if 'location' in tables:
        print("Parsing location table...", file=sys.stderr)
        cur.execute("SELECT bssid, level, lat, lon, altitude, accuracy, time FROM location WHERE bssid IS NOT NULL AND lat IS NOT NULL AND lon IS NOT NULL AND lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180 AND NOT (lat = 0 AND lon = 0) LIMIT 1000000")
        for row in cur.fetchall():
            locations.append({
                'bssid': sanitize_string(row['bssid']).upper(),
                'level': row['level'] or None,
                'lat': row['lat'],
                'lon': row['lon'],
                'altitude': row['altitude'] or 0.0,
                'accuracy': row['accuracy'] or None,
                'time': row['time'] or None,
            })

    if 'route' in tables:
        print("Parsing route table...", file=sys.stderr)
        cur.execute("SELECT run_id, wifi_visible, cell_visible, bt_visible, lat, lon, altitude, accuracy, time FROM route WHERE lat IS NOT NULL AND lon IS NOT NULL AND lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180")
        for row in cur.fetchall():
            routes.append({
                'run_id': row['run_id'],
                'wifi_visible': row['wifi_visible'] or 0,
                'cell_visible': row['cell_visible'] or 0,
                'bt_visible': row['bt_visible'] or 0,
                'lat': row['lat'],
                'lon': row['lon'],
                'altitude': row['altitude'] or 0.0,
                'accuracy': row['accuracy'] or 0.0,
                'time': row['time'],
            })

    conn.close()
    return networks, locations, routes

def load_to_database(source_filename, networks, locations, routes, db_config):
    """Load parsed data into staging tables using BATCH INSERTS"""
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()
    now = datetime.utcnow()
    networks_inserted, locations_inserted, routes_inserted = 0, 0, 0

    try:
        # BATCH INSERT NETWORKS (much faster!)
        if networks:
            print(f"Loading {len(networks)} networks into staging (BATCH MODE)...", file=sys.stderr)
            network_values = [
                (
                    network['bssid'], network.get('ssid'), network.get('frequency'), network.get('capabilities'),
                    network.get('network_type', 'W'), network.get('last_seen'), network.get('last_lat'), network.get('last_lon'),
                    network.get('bestlevel'), network.get('bestlat'), network.get('bestlon'),
                    network.get('rcois'), network.get('mfgrid'), network.get('service'),
                    source_filename, now
                )
                for network in networks
            ]

            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO app.wigle_sqlite_networks_staging
                (bssid, ssid, frequency, capabilities, type, lasttime, lastlat, lastlon, bestlevel, bestlat, bestlon, rcois, mfgrid, service, sqlite_filename, imported_at)
                VALUES %s
                """,
                network_values,
                page_size=1000
            )
            networks_inserted = len(networks)
            print(f"✓ Inserted {networks_inserted} networks", file=sys.stderr)

        # BATCH INSERT LOCATIONS (much faster!)
        if locations:
            print(f"Loading {len(locations)} locations into staging (BATCH MODE)...", file=sys.stderr)
            location_values = [
                (
                    location['bssid'], location.get('level'), location['lat'], location['lon'],
                    location.get('altitude', 0.0), location.get('accuracy'), location.get('time'),
                    source_filename, now
                )
                for location in locations
            ]

            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO app.wigle_sqlite_locations_staging
                (bssid, level, lat, lon, altitude, accuracy, time, sqlite_filename, imported_at)
                VALUES %s
                ON CONFLICT (bssid, level, lat, lon, altitude, accuracy, "time") DO NOTHING
                """,
                location_values,
                page_size=1000
            )
            locations_inserted = len(locations)
            print(f"✓ Inserted {locations_inserted} locations", file=sys.stderr)

        # BATCH INSERT ROUTES
        if routes:
            print(f"Loading {len(routes)} route points into staging (BATCH MODE)...", file=sys.stderr)
            route_values = [
                (
                    route['run_id'], route.get('wifi_visible', 0), route.get('cell_visible', 0), route.get('bt_visible', 0),
                    route['lat'], route['lon'], route.get('altitude', 0.0), route.get('accuracy', 0.0), route['time'],
                    source_filename, now
                )
                for route in routes
            ]

            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO app.wigle_sqlite_routes_staging
                (run_id, wifi_visible, cell_visible, bt_visible, lat, lon, altitude, accuracy, time, sqlite_filename, imported_at)
                VALUES %s
                """,
                route_values,
                page_size=1000
            )
            routes_inserted = len(routes)
            print(f"✓ Inserted {routes_inserted} route points", file=sys.stderr)

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
        print("Usage: wigle_sqlite_parser_fast.py <wigle_db.zip or wigle_db.sqlite>")
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
