#!/bin/bash
# Load WiGLE API orphan recovery data into database

set -e

JSONL_FILE="/home/nunya/shadowcheck/pipelines/wigle_api/orphan_recovery.jsonl"

echo "Loading orphan recovery data from WiGLE API..."

# Use Python locally to process and send to database
python3 <<'PYTHON_SCRIPT'
import json
import sys
import subprocess

networks = []
observations = []

with open('/home/nunya/shadowcheck/pipelines/wigle_api/orphan_recovery.jsonl', 'r') as f:
    for line_num, line in enumerate(f, 1):
        try:
            record = json.loads(line.strip())
            bssid = record.get('networkId')
            if not bssid:
                continue

            # Network SQL
            network_sql = f"""
INSERT INTO app.wigle_alpha_v3_networks (
    bssid, ssid, name, type, encryption, channel, bcninterval,
    trilaterated_lat, trilaterated_lon, best_cluster_qos,
    first_seen, last_seen, last_update, street_address,
    freenet, dhcp, paynet, comment, query_timestamp
) VALUES (
    '{bssid}',
    {f"'{record.get('name', '').replace("'", "''")}'" if record.get('name') else 'NULL'},
    {f"'{record.get('name', '').replace("'", "''")}'" if record.get('name') else 'NULL'},
    {f"'{record.get('type')}'" if record.get('type') else 'NULL'},
    {f"'{record.get('encryption')}'" if record.get('encryption') else 'NULL'},
    {record.get('channel') if record.get('channel') else 'NULL'},
    {record.get('bcninterval', 0)},
    {record.get('trilateratedLatitude') if record.get('trilateratedLatitude') else 'NULL'},
    {record.get('trilateratedLongitude') if record.get('trilateratedLongitude') else 'NULL'},
    {record.get('bestClusterWiGLEQoS', 0)},
    {f"'{record.get('firstSeen')}'" if record.get('firstSeen') else 'NULL'},
    {f"'{record.get('lastSeen')}'" if record.get('lastSeen') else 'NULL'},
    {f"'{record.get('lastUpdate')}'" if record.get('lastUpdate') else 'NULL'},
    {f"'{json.dumps(record.get('streetAddress')).replace("'", "''")}'" if record.get('streetAddress') else 'NULL'},
    {f"'{record.get('freenet')}'" if record.get('freenet') else 'NULL'},
    {f"'{record.get('dhcp')}'" if record.get('dhcp') else 'NULL'},
    {f"'{record.get('paynet')}'" if record.get('paynet') else 'NULL'},
    {f"'{record.get('comment', '').replace("'", "''")}'" if record.get('comment') else 'NULL'},
    NOW()
) ON CONFLICT (bssid) DO NOTHING;
"""
            networks.append(network_sql)

            # Observation SQL for each location
            for cluster in record.get('locationClusters', []):
                for location in cluster.get('locations', []):
                    if not location.get('latitude') or not location.get('longitude'):
                        continue

                    obs_sql = f"""
INSERT INTO app.wigle_alpha_v3_observations (
    bssid, lat, lon, altitude, accuracy, observation_time, last_update,
    month_bucket, ssid, name, signal_dbm, noise, snr, channel, frequency,
    encryption_value, wep, wigle_net_id, query_timestamp
) VALUES (
    '{bssid}',
    {location.get('latitude')},
    {location.get('longitude')},
    {location.get('alt') if location.get('alt') else 'NULL'},
    {location.get('accuracy') if location.get('accuracy') else 'NULL'},
    {f"'{location.get('time')}'" if location.get('time') else 'NULL'},
    {f"'{location.get('lastupdt')}'" if location.get('lastupdt') else 'NULL'},
    {f"'{location.get('month')}'" if location.get('month') else 'NULL'},
    {f"'{location.get('ssid', '').replace("'", "''")}'" if location.get('ssid') else 'NULL'},
    {f"'{location.get('name', '').replace("'", "''")}'" if location.get('name') else 'NULL'},
    {location.get('signal') if location.get('signal') else 'NULL'},
    {location.get('noise', 0)},
    {location.get('snr', 0)},
    {location.get('channel', 0)},
    {location.get('frequency') if location.get('frequency') else 'NULL'},
    {f"'{location.get('wep')}'" if location.get('wep') else 'NULL'},
    {f"'{location.get('wep')}'" if location.get('wep') else 'NULL'},
    {f"'{location.get('netId')}'" if location.get('netId') else 'NULL'},
    NOW()
) ON CONFLICT (bssid, lat, lon, observation_time) DO NOTHING;
"""
                    observations.append(obs_sql)

            if line_num % 100 == 0:
                print(f"Processed {line_num} records...", file=sys.stderr)

        except Exception as e:
            print(f"Error on line {line_num}: {e}", file=sys.stderr)
            continue

# Write SQL to temp file
with open('/tmp/wigle_import.sql', 'w') as f:
    f.write('\n'.join(networks))
    f.write('\n')
    f.write('\n'.join(observations))

print(f"\n{len(networks)} networks, {len(observations)} observations", file=sys.stderr)
PYTHON_SCRIPT

# Execute SQL
echo "Executing SQL..."
docker exec -i shadowcheck_postgres_18 psql -U postgres -d shadowcheck < /tmp/wigle_import.sql 2>&1 | grep -E '(INSERT|ERROR)' | tail -20

echo "✅ Import complete!"
