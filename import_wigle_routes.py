#!/usr/bin/env python3
"""
Import WiGLE SQLite route data into wigle_alpha_v3_observations staging table
Routes contain GPS waypoints from wardriving sessions
"""
import sqlite3
import psycopg2
from datetime import datetime
import sys

SQLITE_DB = './pipelines/wigle/backup-1761824754281.sqlite'
PG_CONN = {
    'host': '127.0.0.1',
    'port': 5432,
    'database': 'shadowcheck',
    'user': 'shadowcheck_user',
    'password': 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8='
}

def import_routes():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(SQLITE_DB)
    sqlite_cur = sqlite_conn.cursor()

    # Connect to PostgreSQL
    pg_conn = psycopg2.connect(**PG_CONN)
    pg_cur = pg_conn.cursor()

    # Get route count
    sqlite_cur.execute("SELECT COUNT(*) FROM route")
    total = sqlite_cur.fetchone()[0]
    print(f"Found {total:,} routes in SQLite")

    # Fetch all routes
    sqlite_cur.execute("""
        SELECT _id, run_id, wifi_visible, lat, lon, altitude, accuracy, time
        FROM route
        WHERE lat IS NOT NULL AND lon IS NOT NULL
          AND lat BETWEEN -90 AND 90
          AND lon BETWEEN -180 AND 180
          AND NOT (lat = 0 AND lon = 0)
        ORDER BY time
    """)

    imported = 0
    skipped = 0
    batch = []
    batch_size = 1000

    for row in sqlite_cur:
        route_id, run_id, wifi_count, lat, lon, alt, acc, timestamp_ms = row

        # Convert millisecond timestamp to datetime
        try:
            observation_time = datetime.fromtimestamp(timestamp_ms / 1000.0)
        except:
            observation_time = None

        # Use a synthetic BSSID for route waypoints
        bssid = f"ROUTE_{run_id:06d}"
        ssid = f"Route {run_id} ({wifi_count} WiFi)"

        batch.append((
            bssid,           # bssid
            lat,             # lat
            lon,             # lon
            alt,             # altitude
            acc,             # accuracy
            observation_time,# observation_time
            None,            # signal_dbm
            ssid,            # ssid
            None,            # frequency
            None,            # channel
            f"Route waypoint (ID: {route_id})"  # encryption_value (used as note)
        ))

        if len(batch) >= batch_size:
            try:
                pg_cur.executemany("""
                    INSERT INTO app.wigle_alpha_v3_observations
                    (bssid, lat, lon, altitude, accuracy, observation_time, signal_dbm, ssid, frequency, channel, encryption_value)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, batch)
                pg_conn.commit()
                imported += len(batch)
                print(f"Imported {imported:,} / {total:,} routes ({imported*100//total}%)", end='\r')
            except Exception as e:
                print(f"\nError importing batch: {e}")
                pg_conn.rollback()
                skipped += len(batch)
            batch = []

    # Import remaining batch
    if batch:
        try:
            pg_cur.executemany("""
                INSERT INTO app.wigle_alpha_v3_observations
                (bssid, lat, lon, altitude, accuracy, observation_time, signal_dbm, ssid, frequency, channel, encryption_value)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, batch)
            pg_conn.commit()
            imported += len(batch)
        except Exception as e:
            print(f"\nError importing final batch: {e}")
            skipped += len(batch)

    print(f"\n\nImport complete!")
    print(f"  Imported: {imported:,} route waypoints")
    print(f"  Skipped:  {skipped:,}")

    # Show summary
    pg_cur.execute("SELECT COUNT(*) FROM app.wigle_alpha_v3_observations")
    total_obs = pg_cur.fetchone()[0]
    print(f"  Total observations in staging: {total_obs:,}")

    sqlite_conn.close()
    pg_conn.close()

if __name__ == '__main__':
    try:
        import_routes()
    except KeyboardInterrupt:
        print("\n\nImport cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nFatal error: {e}")
        sys.exit(1)
