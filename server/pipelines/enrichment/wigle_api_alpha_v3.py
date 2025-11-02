#!/usr/bin/env python3
"""
Import WiGLE Alpha v3 Network Detail Data

This script imports detailed network information from WiGLE API's Alpha v3 network detail endpoint
using the simplified schema with raw observations (no pre-clustering).

Usage:
    # From JSON file
    python3 wigle_api_alpha_v3.py <json_file>

    # From stdin (for pipeline integration)
    curl "https://api.wigle.net/api/v3/detail/wifi/CA:99:B2:1E:55:13" | python3 wigle_api_alpha_v3.py -

    # Tag and fetch workflow
    curl -X POST http://localhost:5000/api/v1/wigle/tag -d '{"bssids": ["CA:99:B2:1E:55:13"]}'
    # Then this script processes the queue and calls Alpha v3 API

Examples:
    # Import existing JSON
    python3 wigle_api_alpha_v3.py /home/nunya/shadowcheck/response_1762039938542.json

    # Process enrichment queue (fetch from WiGLE API for tagged BSSIDs)
    python3 wigle_api_alpha_v3.py --process-queue --limit 10
"""

import json
import sys
import os
import psycopg2
from psycopg2.extras import execute_values, Json
from datetime import datetime
import argparse

# Database configuration from environment
DB_CONFIG = {
    'host': os.getenv('PGHOST', 'postgres'),  # Docker: postgres, local: 127.0.0.1
    'port': int(os.getenv('PGPORT', '5432')),
    'database': os.getenv('PGDATABASE', 'shadowcheck'),
    'user': os.getenv('PGUSER', 'shadowcheck_user'),
    'password': os.getenv('PGPASSWORD', 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=')
}

def import_alpha_v3_response(bssid: str, alpha_v3_json: dict, conn=None) -> tuple[int, int]:
    """
    Import WiGLE Alpha v3 JSON response using PostgreSQL function

    Args:
        bssid: MAC address (e.g., 'CA:99:B2:1E:55:13')
        alpha_v3_json: Complete Alpha v3 API response as dict
        conn: Optional existing database connection

    Returns:
        Tuple of (networks_imported, observations_imported)
    """
    close_conn = False
    if conn is None:
        conn = psycopg2.connect(**DB_CONFIG)
        close_conn = True

    cur = conn.cursor()

    try:
        # Use the PostgreSQL function to import
        cur.execute("""
            SELECT * FROM app.import_wigle_alpha_v3_response(
                %s::TEXT,
                %s::JSONB
            )
        """, (bssid, Json(alpha_v3_json)))

        networks_imported, observations_imported = cur.fetchone()

        conn.commit()

        print(f"✓ Imported network: {bssid}")
        print(f"  - Networks: {networks_imported}")
        print(f"  - Observations: {observations_imported}")

        # Check SSID clustering
        cur.execute("""
            SELECT
                ssid,
                observation_count,
                days_observed,
                max_distance_from_home_km::NUMERIC(10,2),
                mobility_pattern,
                threat_level
            FROM app.wigle_alpha_v3_ssid_clusters
            WHERE bssid = %s
            ORDER BY observation_count DESC
        """, (bssid,))

        clusters = cur.fetchall()
        if clusters:
            print(f"\n  SSID Clusters (dynamic analysis):")
            for ssid, obs_count, days, distance, pattern, threat in clusters:
                print(f"  - {ssid or '<hidden>'}: {obs_count} obs, {days} days, {distance}km from home")
                print(f"    Pattern: {pattern}, Threat: {threat}")

        return networks_imported, observations_imported

    except Exception as e:
        conn.rollback()
        print(f"✗ Error importing {bssid}: {e}", file=sys.stderr)
        raise
    finally:
        if close_conn:
            conn.close()


def fetch_from_wigle_api(bssid: str, api_key: str) -> dict:
    """
    Fetch network detail from WiGLE Alpha v3 API

    Args:
        bssid: MAC address to fetch
        api_key: WiGLE API key in format "name:token" or pre-encoded base64

    Returns:
        Alpha v3 JSON response
    """
    import requests
    import base64

    url = f"https://api.wigle.net/api/v3/detail/wifi/{bssid}"

    # Encode API key if it's in name:token format (not already base64)
    if ':' in api_key and len(api_key) < 100:  # name:token format
        encoded_key = base64.b64encode(api_key.encode('utf-8')).decode('utf-8')
    else:  # Assume already base64 encoded
        encoded_key = api_key

    headers = {
        'Authorization': f'Basic {encoded_key}',
        'Accept': 'application/json'
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()


def process_enrichment_queue(limit: int = 100, api_key: str = None):
    """
    Process pending BSSIDs from enrichment queue

    Fetches from WiGLE Alpha v3 API and imports into database

    Args:
        limit: Maximum number of BSSIDs to process
        api_key: WiGLE API key (if None, reads from WIGLE_API_KEY env var)
    """
    if api_key is None:
        api_key = os.getenv('WIGLE_API_KEY')
        if not api_key:
            raise ValueError("WIGLE_API_KEY environment variable not set")

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Get pending BSSIDs from queue
        cur.execute("""
            SELECT tag_id, bssid
            FROM app.bssid_enrichment_queue
            WHERE status = 'pending'
            ORDER BY priority DESC, tagged_at ASC
            LIMIT %s
        """, (limit,))

        queue_items = cur.fetchall()

        if not queue_items:
            print("No pending BSSIDs in enrichment queue")
            return

        print(f"Processing {len(queue_items)} BSSIDs from enrichment queue...\n")

        success_count = 0
        error_count = 0

        for tag_id, bssid in queue_items:
            try:
                # Mark as processing
                cur.execute("""
                    UPDATE app.bssid_enrichment_queue
                    SET status = 'processing'
                    WHERE tag_id = %s
                """, (tag_id,))
                conn.commit()

                print(f"Fetching {bssid} from WiGLE Alpha v3 API...")

                # Fetch from WiGLE API
                alpha_v3_json = fetch_from_wigle_api(bssid, api_key)

                # Import to database
                networks, observations = import_alpha_v3_response(bssid, alpha_v3_json, conn)

                success_count += 1
                print(f"✓ Successfully processed {bssid}\n")

            except Exception as e:
                error_count += 1
                print(f"✗ Error processing {bssid}: {e}\n", file=sys.stderr)

                # Mark as failed
                cur.execute("""
                    UPDATE app.bssid_enrichment_queue
                    SET status = 'failed',
                        error_message = %s
                    WHERE tag_id = %s
                """, (str(e), tag_id))
                conn.commit()

        print(f"\nQueue processing complete:")
        print(f"  - Success: {success_count}")
        print(f"  - Errors: {error_count}")

    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(
        description='Import WiGLE Alpha v3 network detail data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    parser.add_argument(
        'json_file',
        nargs='?',
        help='JSON file to import (or - for stdin, or omit for --process-queue)'
    )

    parser.add_argument(
        '--process-queue',
        action='store_true',
        help='Process pending BSSIDs from enrichment queue (fetches from WiGLE API)'
    )

    parser.add_argument(
        '--limit',
        type=int,
        default=100,
        help='Maximum number of BSSIDs to process from queue (default: 100)'
    )

    parser.add_argument(
        '--api-key',
        help='WiGLE API key (or set WIGLE_API_KEY env var)'
    )

    args = parser.parse_args()

    # Mode 1: Process enrichment queue (fetch from WiGLE API)
    if args.process_queue:
        process_enrichment_queue(limit=args.limit, api_key=args.api_key)
        return

    # Mode 2: Import from JSON file
    if not args.json_file:
        parser.error("Either provide json_file or use --process-queue")

    # Read JSON
    if args.json_file == '-':
        print("Reading from stdin...")
        data = json.load(sys.stdin)
    else:
        print(f"Reading from {args.json_file}...")
        with open(args.json_file, 'r') as f:
            data = json.load(f)

    # Extract BSSID
    bssid = data.get('networkId')
    if not bssid:
        print("Error: No 'networkId' field in JSON", file=sys.stderr)
        sys.exit(1)

    # Import
    try:
        import_alpha_v3_response(bssid, data)
        print("\n✓ Import complete!")
    except Exception as e:
        print(f"\n✗ Import failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
