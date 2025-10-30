#!/usr/bin/env python3
"""
Kismet SQLite Database Parser for ShadowCheck
Extracts data from Kismet .kismet database files
"""

import sqlite3
import sys
import os
import json
import psycopg2
from datetime import datetime

def parse_kismet_database(db_path, include_packets=False):
    """Parse Kismet SQLite database and extract devices, datasources, and optionally packets"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get table names
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cur.fetchall()]
    print(f"Found Kismet tables: {', '.join(tables)}", file=sys.stderr)

    devices = []
    datasources = []
    packets = []
    alerts = []
    snapshots = []

    # Parse devices table
    if 'devices' in tables:
        print(f"Parsing devices table...", file=sys.stderr)
        try:
            cur.execute("""
                SELECT devkey, phyname, devmac, strongest_signal,
                       min_lat, min_lon, max_lat, max_lon, avg_lat, avg_lon,
                       device
                FROM devices
                WHERE devkey IS NOT NULL
            """)

            for row in cur.fetchall():
                # Parse the device JSON blob
                device_json = None
                type_string = None
                basic_type = None
                manuf = None
                first_time = None
                last_time = None

                try:
                    if row['device']:
                        # Handle BLOB data - decode if it's bytes
                        device_data = row['device']
                        if isinstance(device_data, bytes):
                            device_data = device_data.decode('utf-8', errors='replace')

                        # Sanitize JSON: remove null bytes and invalid Unicode sequences
                        device_data = device_data.replace('\x00', '')  # Remove null bytes
                        device_data = device_data.replace('\\u0000', '')  # Remove \u0000 escape sequences

                        device_json = json.loads(device_data)
                        type_string = device_json.get('kismet.device.base.type')
                        basic_type = device_json.get('kismet.device.base.basic_type_set')
                        manuf = device_json.get('kismet.device.base.manuf')
                        first_time = device_json.get('kismet.device.base.first_time')
                        last_time = device_json.get('kismet.device.base.last_time')
                except Exception as e:
                    print(f"Warning: Could not parse device JSON for {row['devkey']}: {e}", file=sys.stderr)

                device = {
                    'devkey': row['devkey'],
                    'phyname': row['phyname'],
                    'devmac': row['devmac'],
                    'strongest_signal': row['strongest_signal'],
                    'min_lat': row['min_lat'] if row['min_lat'] else None,
                    'min_lon': row['min_lon'] if row['min_lon'] else None,
                    'max_lat': row['max_lat'] if row['max_lat'] else None,
                    'max_lon': row['max_lon'] if row['max_lon'] else None,
                    'avg_lat': row['avg_lat'] if row['avg_lat'] else None,
                    'avg_lon': row['avg_lon'] if row['avg_lon'] else None,
                    'device_json': json.dumps(device_json) if device_json else None,
                    'type_string': type_string,
                    'basic_type_string': str(basic_type) if basic_type else None,
                    'manuf': manuf,
                    'first_time': first_time,
                    'last_time': last_time
                }
                devices.append(device)

        except Exception as e:
            print(f"Error parsing devices: {e}", file=sys.stderr)

    # Parse datasources table
    if 'datasources' in tables:
        print(f"Parsing datasources table...", file=sys.stderr)
        try:
            cur.execute("""
                SELECT uuid, typestring, definition, name, interface
                FROM datasources
                WHERE uuid IS NOT NULL
            """)

            for row in cur.fetchall():
                datasource = {
                    'uuid': row['uuid'],
                    'typestring': row['typestring'],
                    'definition': row['definition'],
                    'name': row['name'],
                    'interface': row['interface']
                }
                datasources.append(datasource)

        except Exception as e:
            print(f"Error parsing datasources: {e}", file=sys.stderr)

    # Parse packets table (optional - high volume)
    if include_packets and 'packets' in tables:
        # Get total packet count first
        cur.execute("SELECT COUNT(*) FROM packets WHERE ts_sec IS NOT NULL")
        total_packets = cur.fetchone()[0]
        print(f"Parsing packets table: {total_packets:,} packets (this may take a while)...", file=sys.stderr)

        try:
            # Remove limit - process all packets
            cur.execute("""
                SELECT ts_sec, ts_usec, phyname, sourcemac, destmac, transmac,
                       frequency, devkey, lat, lon, alt, speed, heading,
                       packet_len, signal, datasource
                FROM packets
                WHERE ts_sec IS NOT NULL
            """)

            for row in cur.fetchall():
                packet = {
                    'ts_sec': row['ts_sec'],
                    'ts_usec': row['ts_usec'],
                    'phyname': row['phyname'],
                    'sourcemac': row['sourcemac'],
                    'destmac': row['destmac'],
                    'transmac': row['transmac'],
                    'frequency': row['frequency'],
                    'devkey': row['devkey'],
                    'lat': row['lat'] if row['lat'] else None,
                    'lon': row['lon'] if row['lon'] else None,
                    'alt': row['alt'] if row['alt'] else None,
                    'speed': row['speed'] if row['speed'] else None,
                    'heading': row['heading'] if row['heading'] else None,
                    'packet_len': row['packet_len'],
                    'signal': row['signal'],
                    'datasource': row['datasource']
                }
                packets.append(packet)

        except Exception as e:
            print(f"Error parsing packets: {e}", file=sys.stderr)

    # Parse alerts table
    if 'alerts' in tables:
        print(f"Parsing alerts table...", file=sys.stderr)
        try:
            cur.execute("""
                SELECT ts_sec, ts_usec, phyname, devmac, lat, lon, header, json
                FROM alerts
                WHERE ts_sec IS NOT NULL
            """)

            for row in cur.fetchall():
                # Handle BLOB JSON data
                json_data = None
                if row['json']:
                    try:
                        json_blob = row['json']
                        if isinstance(json_blob, bytes):
                            json_blob = json_blob.decode('utf-8', errors='replace')

                        # Sanitize JSON: remove null bytes and invalid Unicode sequences
                        json_blob = json_blob.replace('\x00', '')
                        json_blob = json_blob.replace('\\u0000', '')

                        json_data = json_blob
                    except Exception as e:
                        print(f"Warning: Could not decode alert JSON: {e}", file=sys.stderr)

                alert = {
                    'ts_sec': row['ts_sec'],
                    'ts_usec': row['ts_usec'],
                    'phyname': row['phyname'],
                    'devmac': row['devmac'],
                    'lat': row['lat'] if row['lat'] else None,
                    'lon': row['lon'] if row['lon'] else None,
                    'header': row['header'],
                    'json_data': json_data
                }
                alerts.append(alert)

        except Exception as e:
            print(f"Error parsing alerts: {e}", file=sys.stderr)

    # Parse snapshots table
    if 'snapshots' in tables:
        print(f"Parsing snapshots table...", file=sys.stderr)
        try:
            cur.execute("""
                SELECT ts_sec, ts_usec, snaptype, json
                FROM snapshots
                WHERE ts_sec IS NOT NULL
            """)

            for row in cur.fetchall():
                # Handle BLOB JSON data
                json_data = None
                if row['json']:
                    try:
                        json_blob = row['json']
                        if isinstance(json_blob, bytes):
                            json_blob = json_blob.decode('utf-8', errors='replace')

                        # Sanitize JSON: remove null bytes and invalid Unicode sequences
                        json_blob = json_blob.replace('\x00', '')
                        json_blob = json_blob.replace('\\u0000', '')

                        json_data = json_blob
                    except Exception as e:
                        print(f"Warning: Could not decode snapshot JSON: {e}", file=sys.stderr)

                snapshot = {
                    'ts_sec': row['ts_sec'],
                    'ts_usec': row['ts_usec'],
                    'snaptype': row['snaptype'],
                    'json_data': json_data
                }
                snapshots.append(snapshot)

        except Exception as e:
            print(f"Error parsing snapshots: {e}", file=sys.stderr)

    conn.close()

    return {
        'devices': devices,
        'datasources': datasources,
        'packets': packets,
        'alerts': alerts,
        'snapshots': snapshots
    }

def load_to_database(filename, data, db_config):
    """Load parsed Kismet data into PostgreSQL staging tables"""
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()

    stats = {
        'devices': 0,
        'datasources': 0,
        'packets': 0,
        'alerts': 0,
        'snapshots': 0
    }

    try:
        # Insert devices
        print(f"Loading {len(data['devices'])} devices...", file=sys.stderr)
        for device in data['devices']:
            try:
                cur.execute("""
                    INSERT INTO app.kismet_devices_staging
                    (devkey, phyname, devmac, strongest_signal, min_lat, min_lon, max_lat, max_lon,
                     avg_lat, avg_lon, device_json, kismet_filename, type_string, basic_type_string,
                     manuf, first_time, last_time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (devkey, kismet_filename) DO UPDATE SET
                        strongest_signal = GREATEST(EXCLUDED.strongest_signal, app.kismet_devices_staging.strongest_signal),
                        last_time = GREATEST(EXCLUDED.last_time, app.kismet_devices_staging.last_time)
                """, (
                    device['devkey'],
                    device['phyname'],
                    device['devmac'],
                    device['strongest_signal'],
                    device['min_lat'],
                    device['min_lon'],
                    device['max_lat'],
                    device['max_lon'],
                    device['avg_lat'],
                    device['avg_lon'],
                    device['device_json'],
                    filename,
                    device['type_string'],
                    device['basic_type_string'],
                    device['manuf'],
                    device['first_time'],
                    device['last_time']
                ))
                stats['devices'] += 1
            except Exception as e:
                print(f"Error inserting device {device['devkey']}: {e}", file=sys.stderr)
                continue

        # Insert datasources
        print(f"Loading {len(data['datasources'])} datasources...", file=sys.stderr)
        for ds in data['datasources']:
            try:
                cur.execute("""
                    INSERT INTO app.kismet_datasources_staging
                    (uuid, typestring, definition, name, interface, kismet_filename)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (uuid, kismet_filename) DO NOTHING
                """, (
                    ds['uuid'],
                    ds['typestring'],
                    ds['definition'],
                    ds['name'],
                    ds['interface'],
                    filename
                ))
                stats['datasources'] += 1
            except Exception as e:
                print(f"Error inserting datasource: {e}", file=sys.stderr)
                continue

        # Insert packets (if any)
        if data['packets']:
            total_packets = len(data['packets'])
            print(f"Loading {total_packets:,} packets...", file=sys.stderr)

            for i, pkt in enumerate(data['packets'], 1):
                try:
                    cur.execute("""
                        INSERT INTO app.kismet_packets_staging
                        (ts_sec, ts_usec, phyname, sourcemac, destmac, transmac, frequency,
                         devkey, lat, lon, alt, speed, heading, packet_len, signal, datasource, kismet_filename)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        pkt['ts_sec'],
                        pkt['ts_usec'],
                        pkt['phyname'],
                        pkt['sourcemac'],
                        pkt['destmac'],
                        pkt['transmac'],
                        pkt['frequency'],
                        pkt['devkey'],
                        pkt['lat'],
                        pkt['lon'],
                        pkt['alt'],
                        pkt['speed'],
                        pkt['heading'],
                        pkt['packet_len'],
                        pkt['signal'],
                        pkt['datasource'],
                        filename
                    ))
                    stats['packets'] += 1

                    # Commit every 10,000 packets and show progress
                    if i % 10000 == 0:
                        conn.commit()
                        progress = (i / total_packets) * 100
                        print(f"  {i:,}/{total_packets:,} packets processed ({progress:.1f}%)...", file=sys.stderr)

                except Exception as e:
                    print(f"Error inserting packet {i}: {e}", file=sys.stderr)
                    continue

        # Insert alerts
        if data['alerts']:
            print(f"Loading {len(data['alerts'])} alerts...", file=sys.stderr)
            for alert in data['alerts']:
                try:
                    cur.execute("""
                        INSERT INTO app.kismet_alerts_staging
                        (ts_sec, ts_usec, phyname, devmac, lat, lon, header, json_data, kismet_filename)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
                    """, (
                        alert['ts_sec'],
                        alert['ts_usec'],
                        alert['phyname'],
                        alert['devmac'],
                        alert['lat'],
                        alert['lon'],
                        alert['header'],
                        alert['json_data'],
                        filename
                    ))
                    stats['alerts'] += 1
                except Exception as e:
                    print(f"Error inserting alert: {e}", file=sys.stderr)
                    continue

        # Insert snapshots
        if data['snapshots']:
            print(f"Loading {len(data['snapshots'])} snapshots...", file=sys.stderr)
            for snap in data['snapshots']:
                try:
                    cur.execute("""
                        INSERT INTO app.kismet_snapshots_staging
                        (ts_sec, ts_usec, snaptype, json_data, kismet_filename)
                        VALUES (%s, %s, %s, %s::jsonb, %s)
                    """, (
                        snap['ts_sec'],
                        snap['ts_usec'],
                        snap['snaptype'],
                        snap['json_data'],
                        filename
                    ))
                    stats['snapshots'] += 1
                except Exception as e:
                    print(f"Error inserting snapshot: {e}", file=sys.stderr)
                    continue

        conn.commit()
        print(f"✓ Loaded {filename}: {stats}", file=sys.stderr)

    except Exception as e:
        conn.rollback()
        print(f"✗ Error loading {filename}: {e}", file=sys.stderr)
        raise
    finally:
        cur.close()
        conn.close()

    return stats

def main():
    if len(sys.argv) < 2:
        print("Usage: kismet_parser.py <kismet_database.kismet> [--include-packets]")
        sys.exit(1)

    kismet_file = sys.argv[1]
    include_packets = '--include-packets' in sys.argv

    if not os.path.exists(kismet_file):
        print(f"Error: File {kismet_file} not found")
        sys.exit(1)

    # Database configuration from environment
    db_config = {
        'host': os.getenv('DB_HOST', '127.0.0.1'),
        'port': int(os.getenv('DB_PORT', '5432')),
        'database': os.getenv('DB_NAME', 'shadowcheck'),
        'user': os.getenv('DB_USER', 'shadowcheck_user'),
        'password': os.getenv('DB_PASSWORD', 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=')
    }

    print(f"Parsing Kismet database: {kismet_file}...", file=sys.stderr)
    print(f"Include packets: {include_packets}", file=sys.stderr)

    data = parse_kismet_database(kismet_file, include_packets=include_packets)

    print(f"Found {len(data['devices'])} devices, {len(data['datasources'])} datasources, "
          f"{len(data['packets'])} packets, {len(data['alerts'])} alerts, {len(data['snapshots'])} snapshots",
          file=sys.stderr)

    filename = os.path.basename(kismet_file)
    stats = load_to_database(filename, data, db_config)

    # Output JSON for API response
    print(json.dumps({
        'ok': True,
        'file': filename,
        'stats': stats
    }))

if __name__ == '__main__':
    main()
