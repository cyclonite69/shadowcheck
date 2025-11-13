#!/usr/bin/env python3
"""
Load WiGLE API orphan recovery data into wigle_alpha_v3_networks and wigle_alpha_v3_observations tables.
"""

import json
import sys
import psycopg2
import psycopg2.extras
from datetime import datetime

# Database connection - running inside container, use localhost
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="shadowcheck",
    user="postgres"
)
cur = conn.cursor()

def parse_timestamp(ts_str):
    """Parse ISO timestamp string to datetime object."""
    if not ts_str:
        return None
    try:
        return datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
    except:
        return None

networks_batch = []
observations_batch = []

print("Processing orphan_recovery.jsonl...", file=sys.stderr)

with open('/tmp/orphan_recovery.jsonl', 'r') as f:
    for line_num, line in enumerate(f, 1):
        try:
            record = json.loads(line.strip())

            # Extract network data
            bssid = record.get('networkId')
            if not bssid:
                continue

            # Check if network already exists
            cur.execute("SELECT 1 FROM app.wigle_alpha_v3_networks WHERE bssid = %s", (bssid,))
            if cur.fetchone():
                print(f"Skipping {bssid} - already exists", file=sys.stderr)
                continue

            network_data = {
                'bssid': bssid,
                'ssid': record.get('name'),
                'name': record.get('name'),
                'type': record.get('type'),
                'encryption': record.get('encryption'),
                'channel': record.get('channel'),
                'frequency': None,  # Will get from observations
                'bcninterval': record.get('bcninterval'),
                'trilaterated_lat': record.get('trilateratedLatitude'),
                'trilaterated_lon': record.get('trilateratedLongitude'),
                'best_cluster_qos': record.get('bestClusterWiGLEQoS'),
                'first_seen': parse_timestamp(record.get('firstSeen')),
                'last_seen': parse_timestamp(record.get('lastSeen')),
                'last_update': parse_timestamp(record.get('lastUpdate')),
                'street_address': json.dumps(record.get('streetAddress')) if record.get('streetAddress') else None,
                'freenet': record.get('freenet'),
                'dhcp': record.get('dhcp'),
                'paynet': record.get('paynet'),
                'comment': record.get('comment'),
                'query_timestamp': datetime.now()
            }

            networks_batch.append(network_data)

            # Extract observation data from locationClusters
            for cluster in record.get('locationClusters', []):
                for location in cluster.get('locations', []):
                    obs_data = {
                        'bssid': bssid,
                        'lat': location.get('latitude'),
                        'lon': location.get('longitude'),
                        'altitude': location.get('alt'),
                        'accuracy': location.get('accuracy'),
                        'observation_time': parse_timestamp(location.get('time')),
                        'last_update': parse_timestamp(location.get('lastupdt')),
                        'month_bucket': location.get('month'),
                        'ssid': location.get('ssid'),
                        'name': location.get('name'),
                        'signal_dbm': location.get('signal'),
                        'noise': location.get('noise'),
                        'snr': location.get('snr'),
                        'channel': location.get('channel'),
                        'frequency': location.get('frequency'),
                        'encryption_value': location.get('wep'),
                        'wep': location.get('wep'),
                        'wigle_net_id': location.get('netId'),
                        'query_timestamp': datetime.now()
                    }

                    # Skip observations with invalid coordinates
                    if obs_data['lat'] and obs_data['lon']:
                        observations_batch.append(obs_data)

            if line_num % 100 == 0:
                print(f"Processed {line_num} records...", file=sys.stderr)

        except json.JSONDecodeError as e:
            print(f"JSON error on line {line_num}: {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"Error on line {line_num}: {e}", file=sys.stderr)
            continue

print(f"\nInserting {len(networks_batch)} networks...", file=sys.stderr)

# Insert networks
if networks_batch:
    psycopg2.extras.execute_values(
        cur,
        """
        INSERT INTO app.wigle_alpha_v3_networks (
            bssid, ssid, name, type, encryption, channel, frequency, bcninterval,
            trilaterated_lat, trilaterated_lon, best_cluster_qos,
            first_seen, last_seen, last_update, street_address,
            freenet, dhcp, paynet, comment, query_timestamp
        ) VALUES %s
        ON CONFLICT (bssid) DO NOTHING
        """,
        [
            (
                n['bssid'], n['ssid'], n['name'], n['type'], n['encryption'],
                n['channel'], n['frequency'], n['bcninterval'],
                n['trilaterated_lat'], n['trilaterated_lon'], n['best_cluster_qos'],
                n['first_seen'], n['last_seen'], n['last_update'], n['street_address'],
                n['freenet'], n['dhcp'], n['paynet'], n['comment'], n['query_timestamp']
            )
            for n in networks_batch
        ],
        page_size=100
    )

print(f"Inserting {len(observations_batch)} observations...", file=sys.stderr)

# Insert observations
if observations_batch:
    psycopg2.extras.execute_values(
        cur,
        """
        INSERT INTO app.wigle_alpha_v3_observations (
            bssid, lat, lon, altitude, accuracy, observation_time, last_update,
            month_bucket, ssid, name, signal_dbm, noise, snr, channel, frequency,
            encryption_value, wep, wigle_net_id, query_timestamp
        ) VALUES %s
        ON CONFLICT (bssid, lat, lon, observation_time) DO NOTHING
        """,
        [
            (
                o['bssid'], o['lat'], o['lon'], o['altitude'], o['accuracy'],
                o['observation_time'], o['last_update'], o['month_bucket'],
                o['ssid'], o['name'], o['signal_dbm'], o['noise'], o['snr'],
                o['channel'], o['frequency'], o['encryption_value'], o['wep'],
                o['wigle_net_id'], o['query_timestamp']
            )
            for o in observations_batch
        ],
        page_size=500
    )

conn.commit()
cur.close()
conn.close()

print(f"\n✅ Import complete!", file=sys.stderr)
print(f"Networks inserted: {len(networks_batch)}", file=sys.stderr)
print(f"Observations inserted: {len(observations_batch)}", file=sys.stderr)
