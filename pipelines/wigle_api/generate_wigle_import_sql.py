#!/usr/bin/env python3
"""
Generate SQL from WiGLE API orphan recovery JSONL data.
Output goes to stdout, pipe to psql.
"""

import json
import sys

def escape_sql(value):
    """Escape single quotes for SQL"""
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

networks_count = 0
observations_count = 0

for line_num, line in enumerate(sys.stdin, 1):
        try:
            record = json.loads(line.strip())
            bssid = record.get('networkId')
            if not bssid:
                continue

            # Generate network INSERT
            print(f"""
INSERT INTO app.wigle_alpha_v3_networks (
    bssid, ssid, name, type, encryption, channel, bcninterval,
    trilaterated_lat, trilaterated_lon, best_cluster_qos,
    first_seen, last_seen, last_update, street_address,
    freenet, dhcp, paynet, comment, query_timestamp
) VALUES (
    '{escape_sql(bssid)}',
    {'NULL' if not record.get('name') else f"'{escape_sql(record.get('name'))}'"},
    {'NULL' if not record.get('name') else f"'{escape_sql(record.get('name'))}'"},
    {'NULL' if not record.get('type') else f"'{escape_sql(record.get('type'))}'"},
    {'NULL' if not record.get('encryption') else f"'{escape_sql(record.get('encryption'))}'"},
    {record.get('channel') if record.get('channel') else 'NULL'},
    {record.get('bcninterval', 0)},
    {record.get('trilateratedLatitude') if record.get('trilateratedLatitude') else 'NULL'},
    {record.get('trilateratedLongitude') if record.get('trilateratedLongitude') else 'NULL'},
    {record.get('bestClusterWiGLEQoS', 0)},
    {'NULL' if not record.get('firstSeen') else f"'{record.get('firstSeen')}'"},
    {'NULL' if not record.get('lastSeen') else f"'{record.get('lastSeen')}'"},
    {'NULL' if not record.get('lastUpdate') else f"'{record.get('lastUpdate')}'"},
    {'NULL' if not record.get('streetAddress') else f"'{escape_sql(json.dumps(record.get('streetAddress')))}'"},
    {'NULL' if not record.get('freenet') else f"'{escape_sql(record.get('freenet'))}'"},
    {'NULL' if not record.get('dhcp') else f"'{escape_sql(record.get('dhcp'))}'"},
    {'NULL' if not record.get('paynet') else f"'{escape_sql(record.get('paynet'))}'"},
    {'NULL' if not record.get('comment') else f"'{escape_sql(record.get('comment'))}'"},
    NOW()
);
""")
            networks_count += 1

            # Generate observation INSERTs for each location
            for cluster in record.get('locationClusters', []):
                for location in cluster.get('locations', []):
                    if not location.get('latitude') or not location.get('longitude'):
                        continue

                    print(f"""
INSERT INTO app.wigle_alpha_v3_observations (
    bssid, lat, lon, altitude, accuracy, observation_time, last_update,
    month_bucket, ssid, name, signal_dbm, noise, snr, channel, frequency,
    encryption_value, wep, wigle_net_id, query_timestamp
) VALUES (
    '{escape_sql(bssid)}',
    {location.get('latitude')},
    {location.get('longitude')},
    {location.get('alt') if location.get('alt') else 'NULL'},
    {location.get('accuracy') if location.get('accuracy') else 'NULL'},
    {'NULL' if not location.get('time') else f"'{location.get('time')}'"},
    {'NULL' if not location.get('lastupdt') else f"'{location.get('lastupdt')}'"},
    {'NULL' if not location.get('month') else f"'{location.get('month')}'"},
    {'NULL' if not location.get('ssid') else f"'{escape_sql(location.get('ssid'))}'"},
    {'NULL' if not location.get('name') else f"'{escape_sql(location.get('name'))}'"},
    {location.get('signal') if location.get('signal') else 'NULL'},
    {location.get('noise', 0)},
    {location.get('snr', 0)},
    {location.get('channel', 0)},
    {location.get('frequency') if location.get('frequency') else 'NULL'},
    {'NULL' if not location.get('wep') else f"'{escape_sql(location.get('wep'))}'"},
    {'NULL' if not location.get('wep') else f"'{escape_sql(location.get('wep'))}'"},
    {'NULL' if not location.get('netId') else f"'{escape_sql(location.get('netId'))}'"},
    NOW()
);
""")
                    observations_count += 1

            if line_num % 100 == 0:
                print(f"-- Processed {line_num} records...", file=sys.stderr)

        except Exception as e:
            print(f"-- Error on line {line_num}: {e}", file=sys.stderr)
            continue

print(f"-- Total: {networks_count} networks, {observations_count} observations", file=sys.stderr)
