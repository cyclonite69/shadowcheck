#!/usr/bin/env python3
"""
Import WiGLE Network Detail Data

This script imports detailed network information from WiGLE API's network detail endpoint,
which includes comprehensive location history with GPS observations, signal strength, and timestamps.

Usage:
    python3 import_network_detail.py <json_file>
"""

import json
import sys
import os
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime

# Database configuration from environment
DB_CONFIG = {
    'host': os.getenv('PGHOST', '127.0.0.1'),
    'port': int(os.getenv('PGPORT', '5432')),
    'database': os.getenv('PGDATABASE', 'shadowcheck'),
    'user': os.getenv('PGUSER', 'shadowcheck_user'),
    'password': os.getenv('PGPASSWORD', 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=')
}

def parse_detail_response(data):
    """Parse WiGLE network detail response"""

    network_info = {
        'bssid': data.get('networkId'),
        'ssid': data.get('locationClusters', [{}])[0].get('clusterSsid') if data.get('locationClusters') else None,
        'encryption': data.get('encryption'),
        'channel': data.get('channel'),
        'first_seen': data.get('firstSeen'),
        'last_seen': data.get('lastSeen'),
        'last_update': data.get('lastUpdate'),
        'trilat': data.get('trilateratedLatitude'),
        'trilong': data.get('trilateratedLongitude'),
        'qos': data.get('bestClusterWiGLEQoS'),
        'type': data.get('type'),
        'street_address': data.get('streetAddress', {})
    }

    # Extract all location observations
    locations = []
    if 'locationClusters' in data:
        for cluster in data['locationClusters']:
            if 'locations' in cluster:
                for loc in cluster['locations']:
                    locations.append({
                        'bssid': network_info['bssid'],
                        'ssid': loc.get('ssid', network_info['ssid']),
                        'lat': loc.get('latitude'),
                        'lon': loc.get('longitude'),
                        'alt': loc.get('alt'),
                        'accuracy': loc.get('accuracy'),
                        'time': loc.get('time'),
                        'lastupdt': loc.get('lastupdt'),
                        'signal': loc.get('signal'),
                        'noise': loc.get('noise'),
                        'snr': loc.get('snr'),
                        'frequency': loc.get('frequency'),
                        'channel': loc.get('channel'),
                        'month': loc.get('month')
                    })

    return network_info, locations

def import_to_database(network_info, locations):
    """Import network and location data into database"""

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Insert or update network in wigle_api_networks_staging
        cur.execute("""
            INSERT INTO app.wigle_api_networks_staging
            (bssid, ssid, frequency, capabilities, type, lasttime,
             lastlat, lastlon, trilat, trilong, channel, qos,
             country, region, city, query_params, query_timestamp)
            VALUES (%(bssid)s, %(ssid)s, NULL, %(encryption)s, %(type)s, %(last_seen)s,
                    %(trilat)s, %(trilong)s, %(trilat)s, %(trilong)s,
                    %(channel)s, %(qos)s,
                    %(country)s, %(region)s, %(city)s,
                    %(query_params)s, NOW())
            ON CONFLICT (bssid, query_timestamp)
            DO UPDATE SET
                ssid = EXCLUDED.ssid,
                lasttime = EXCLUDED.lasttime,
                qos = EXCLUDED.qos
        """, {
            'bssid': network_info['bssid'],
            'ssid': network_info['ssid'],
            'encryption': network_info['encryption'],
            'type': network_info['type'],
            'last_seen': network_info['last_seen'],
            'trilat': network_info['trilat'],
            'trilong': network_info['trilong'],
            'channel': network_info['channel'],
            'qos': network_info['qos'],
            'country': network_info['street_address'].get('country'),
            'region': network_info['street_address'].get('region'),
            'city': network_info['street_address'].get('city'),
            'query_params': json.dumps({
                'source': 'network_detail',
                'street_address': network_info['street_address']
            })
        })

        print(f"✓ Inserted network: {network_info['bssid']} ({network_info['ssid']})")

        # Bulk insert locations
        if locations:
            location_values = [
                (
                    loc['bssid'],
                    loc['lat'],
                    loc['lon'],
                    loc['time'],
                    loc['signal'],
                    json.dumps({
                        'source': 'network_detail',
                        'altitude': loc['alt'],
                        'accuracy': loc['accuracy'],
                        'frequency': loc['frequency'],
                        'channel': loc['channel'],
                        'noise': loc['noise'],
                        'snr': loc['snr'],
                        'month': loc['month'],
                        'lastupdt': loc['lastupdt']
                    })
                )
                for loc in locations
                if loc['lat'] and loc['lon']  # Skip null island
            ]

            execute_values(cur, """
                INSERT INTO app.wigle_api_locations_staging
                (bssid, lat, lon, time, signal_level, query_params)
                VALUES %s
                ON CONFLICT DO NOTHING
            """, location_values)

            print(f"✓ Inserted {len(location_values)} location observations")

        conn.commit()

        # Print summary
        print(f"\nSummary:")
        print(f"  BSSID: {network_info['bssid']}")
        print(f"  SSID: {network_info['ssid']}")
        print(f"  First seen: {network_info['first_seen']}")
        print(f"  Last seen: {network_info['last_seen']}")
        print(f"  Location: {network_info['street_address'].get('road', 'N/A')}, "
              f"{network_info['street_address'].get('city', 'N/A')}, "
              f"{network_info['street_address'].get('region', 'N/A')}")
        print(f"  Total observations: {len(locations)}")
        print(f"  Valid GPS points: {len(location_values)}")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 import_network_detail.py <json_file>")
        sys.exit(1)

    json_file = sys.argv[1]

    if not os.path.exists(json_file):
        print(f"Error: File not found: {json_file}")
        sys.exit(1)

    print(f"Loading {json_file}...")
    with open(json_file, 'r') as f:
        data = json.load(f)

    network_info, locations = parse_detail_response(data)

    print(f"Importing network {network_info['bssid']} with {len(locations)} observations...")
    import_to_database(network_info, locations)

    print("\n✓ Import complete!")

if __name__ == '__main__':
    main()
