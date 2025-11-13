#!/usr/bin/env python3
"""
Merge WiGLE API Data to Staging Tables

Enriches staging tables with WiGLE API data (observations and network metadata).
Deduplication: Same BSSID + same DATE + close coords (10m) = duplicate, skip it.

Strategy:
1. Extend staging schema with API columns
2. Enrich network metadata (encryption, street address, trilateration)
3. Merge observations, skipping same-day duplicates (API time rounded by WiGLE)

Usage:
    python3 merge_api_to_staging.py [--dry-run]
"""

import os
import sys
import argparse
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': os.getenv('PGHOST', '127.0.0.1'),
    'port': int(os.getenv('PGPORT', '5432')),
    'database': os.getenv('PGDATABASE', 'shadowcheck'),
    'user': os.getenv('PGUSER', 'shadowcheck_user'),
    'password': os.getenv('PGPASSWORD', 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=')
}


def get_merge_batch_id() -> str:
    """Generate unique merge batch ID"""
    return f"wigle_api_merge_{datetime.now():%Y%m%d_%H%M%S}"


def check_schema_extended(conn) -> bool:
    """Check if staging tables have been extended with API columns"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'app'
                AND table_name = 'wigle_sqlite_networks_staging'
                AND column_name = 'api_enriched'
            ) AND EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'app'
                AND table_name = 'wigle_sqlite_locations_staging'
                AND column_name = 'observation_source'
            ) as schema_ready
        """)
        return cur.fetchone()[0]


def enrich_network_metadata(conn, batch_id: str, dry_run: bool = False) -> int:
    """Enrich staging network records with API metadata"""
    print("\n=== Phase 1: Enrich Network Metadata ===")

    with conn.cursor() as cur:
        # Count networks to enrich
        cur.execute("""
            SELECT COUNT(DISTINCT n.bssid) as network_count
            FROM app.wigle_sqlite_networks_staging n
            INNER JOIN app.wigle_alpha_v3_networks api ON n.bssid = api.bssid
            WHERE n.api_enriched IS FALSE OR n.api_enriched IS NULL
        """)
        count = cur.fetchone()[0]

        if count == 0:
            print("✓ No networks to enrich (already done or no matches)")
            return 0

        print(f"  Found {count} networks to enrich with API metadata")

        if dry_run:
            print(f"  [DRY RUN] Would update {count} network records")
            return count

        # Update networks with API enrichment
        cur.execute("""
            UPDATE app.wigle_sqlite_networks_staging n
            SET
                name = api.name,
                encryption = api.encryption,
                channel = COALESCE(n.frequency / 5 - 1000, api.channel),  -- Keep staging if exists
                bcninterval = api.bcninterval,
                trilaterated_lat = api.trilaterated_lat,
                trilaterated_lon = api.trilaterated_lon,
                best_cluster_qos = api.best_cluster_qos,
                first_seen = CASE
                    WHEN n.lasttime IS NOT NULL
                    THEN LEAST(api.first_seen, to_timestamp(n.lasttime / 1000))
                    ELSE api.first_seen
                END,
                last_seen = CASE
                    WHEN n.lasttime IS NOT NULL
                    THEN GREATEST(api.last_seen, to_timestamp(n.lasttime / 1000))
                    ELSE api.last_seen
                END,
                last_update = api.last_update,
                street_address = api.street_address,
                freenet = api.freenet,
                dhcp = api.dhcp,
                paynet = api.paynet,
                comment = api.comment,
                api_enriched = TRUE,
                observation_count_api = (
                    SELECT COUNT(*) FROM app.wigle_alpha_v3_observations o
                    WHERE o.bssid = n.bssid
                ),
                data_source_bitmask = 3,  -- Both sqlite and API
                merge_timestamp = NOW(),
                merge_batch_id = %s
            FROM app.wigle_alpha_v3_networks api
            WHERE n.bssid = api.bssid
            AND (n.api_enriched IS FALSE OR n.api_enriched IS NULL)
        """, (batch_id,))

        enriched = cur.rowcount
        conn.commit()

        print(f"✓ Enriched {enriched} network records with API metadata")

        # Show sample
        cur.execute("""
            SELECT bssid, ssid, encryption,
                   street_address->>'city' as city,
                   street_address->>'road' as road,
                   trilaterated_lat, trilaterated_lon,
                   observation_count_api
            FROM app.wigle_sqlite_networks_staging
            WHERE merge_batch_id = %s
            LIMIT 1
        """, (batch_id,))

        sample = cur.fetchone()
        if sample:
            print(f"\n  Sample enriched network:")
            print(f"    BSSID: {sample[0]}")
            print(f"    SSID: {sample[1]}")
            print(f"    Encryption: {sample[2]}")
            print(f"    Location: {sample[4]}, {sample[3]}")
            print(f"    Trilaterated: ({sample[5]:.6f}, {sample[6]:.6f})")
            print(f"    API observations: {sample[7]}")

        return enriched


def merge_observations(conn, batch_id: str, dry_run: bool = False):
    """Merge API observations, skipping same-day duplicates"""
    print(f"\n=== Phase 2: Merge Observations ===")
    print(f"  Deduplication: Same BSSID + same DATE + within 10m = skip as duplicate")

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Count total API observations
        cur.execute("SELECT COUNT(*) FROM app.wigle_alpha_v3_observations")
        total_api_obs = cur.fetchone()['count']
        print(f"  Total API observations: {total_api_obs}")

        # Find same-day duplicates
        print(f"  Analyzing duplicates (same BSSID + date + close coords)...")
        cur.execute("""
            WITH api_obs AS (
                SELECT
                    observation_id,
                    bssid,
                    lat,
                    lon,
                    DATE(observation_time) as obs_date,
                    observation_time
                FROM app.wigle_alpha_v3_observations
            ),
            staging_obs AS (
                SELECT
                    unified_id,
                    bssid,
                    lat,
                    lon,
                    DATE(to_timestamp(time / 1000)) as obs_date
                FROM app.wigle_sqlite_locations_staging
                WHERE observation_source = 'sqlite'  -- Only check against original sqlite data
            )
            SELECT
                api_obs.observation_id,
                staging_obs.unified_id as duplicate_of
            FROM api_obs
            LEFT JOIN staging_obs ON
                api_obs.bssid = staging_obs.bssid
                AND api_obs.obs_date = staging_obs.obs_date
                AND ABS(api_obs.lat - staging_obs.lat) < 0.0001  -- ~10m
                AND ABS(api_obs.lon - staging_obs.lon) < 0.0001
        """)

        new_observations = []
        duplicates = []

        for row in cur.fetchall():
            if row['duplicate_of'] is not None:
                duplicates.append(row['observation_id'])
            else:
                new_observations.append(row['observation_id'])

        print(f"  Analysis complete:")
        print(f"    New observations (different day/location): {len(new_observations)}")
        print(f"    Duplicates (same day + coords): {len(duplicates)}")

        if dry_run:
            print(f"\n  [DRY RUN] Would insert {len(new_observations)} new observations")
            print(f"  [DRY RUN] Would skip {len(duplicates)} duplicates")

            # Show sample new vs duplicate
            cur.execute("""
                SELECT bssid, ssid, observation_time, lat, lon, signal_dbm
                FROM app.wigle_alpha_v3_observations
                WHERE observation_id = ANY(%s)
                LIMIT 3
            """, (new_observations[:3],))

            print(f"\n  Sample NEW observations:")
            for row in cur.fetchall():
                print(f"    {row['bssid']} ({row['ssid']}) - {row['observation_time']} @ ({row['lat']:.5f}, {row['lon']:.5f}) [{row['signal_dbm']} dBm]")

            return (len(new_observations), len(duplicates))

        # Insert new observations only
        if new_observations:
            print(f"  Inserting {len(new_observations)} new observations...")

            cur.execute("""
                INSERT INTO app.wigle_sqlite_locations_staging (
                    bssid, lat, lon, altitude, accuracy, time,
                    observation_time, last_update, month_bucket,
                    ssid, name, signal_dbm, level, noise, snr,
                    channel, frequency, encryption_value, wep, wigle_net_id,
                    observation_source, api_observation_id, merge_batch_id,
                    sqlite_filename, data_source, is_duplicate
                )
                SELECT
                    bssid, lat, lon, altitude, accuracy,
                    EXTRACT(EPOCH FROM observation_time) * 1000,  -- to epoch ms
                    observation_time, last_update, month_bucket,
                    ssid, name, signal_dbm, signal_dbm as level,
                    noise, snr, channel, frequency,
                    encryption_value, wep, wigle_net_id,
                    'wigle_api', observation_id, %s,
                    'wigle_api_enrichment', 'wigle_api', FALSE
                FROM app.wigle_alpha_v3_observations
                WHERE observation_id = ANY(%s)
                ON CONFLICT (bssid, level, lat, lon, altitude, accuracy, time) DO NOTHING
            """, (batch_id, new_observations))

            inserted = cur.rowcount
            conn.commit()
            print(f"✓ Inserted {inserted} new observations")
        else:
            inserted = 0
            print("✓ No new observations to insert (all are same-day duplicates)")

        return (inserted, len(duplicates))


def generate_report(conn, batch_id: str):
    """Generate merge summary report"""
    print("\n" + "="*60)
    print("MERGE SUMMARY REPORT")
    print("="*60)
    print(f"Batch ID: {batch_id}")
    print(f"Timestamp: {datetime.now():%Y-%m-%d %H:%M:%S}")

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Networks enriched
        cur.execute("""
            SELECT COUNT(*) as count
            FROM app.wigle_sqlite_networks_staging
            WHERE merge_batch_id = %s
        """, (batch_id,))
        networks_enriched = cur.fetchone()['count']

        # Observations added
        cur.execute("""
            SELECT COUNT(*) as count
            FROM app.wigle_sqlite_locations_staging
            WHERE merge_batch_id = %s
        """, (batch_id,))
        observations_added = cur.fetchone()['count']

        # Total staging stats
        cur.execute("""
            SELECT
                COUNT(*) as total_networks,
                COUNT(*) FILTER (WHERE api_enriched = TRUE) as api_enriched_networks
            FROM app.wigle_sqlite_networks_staging
        """)
        net_stats = cur.fetchone()

        cur.execute("""
            SELECT
                COUNT(*) as total_observations,
                COUNT(*) FILTER (WHERE observation_source = 'wigle_api') as api_observations,
                COUNT(*) FILTER (WHERE observation_source = 'sqlite') as sqlite_observations
            FROM app.wigle_sqlite_locations_staging
        """)
        obs_stats = cur.fetchone()

        print(f"\nThis Merge:")
        print(f"  Networks enriched:     {networks_enriched:,}")
        print(f"  Observations added:    {observations_added:,}")

        print(f"\nOverall Totals:")
        print(f"  Total networks:        {net_stats['total_networks']:,}")
        print(f"    API-enriched:        {net_stats['api_enriched_networks']:,}")
        print(f"  Total observations:    {obs_stats['total_observations']:,}")
        print(f"    From SQLite:         {obs_stats['sqlite_observations']:,}")
        print(f"    From WiGLE API:      {obs_stats['api_observations']:,}")

        # Sample enriched network with most observations
        cur.execute("""
            SELECT
                n.bssid, n.ssid, n.encryption,
                n.street_address->>'road' as road,
                n.street_address->>'city' as city,
                n.observation_count_api,
                n.trilaterated_lat, n.trilaterated_lon
            FROM app.wigle_sqlite_networks_staging n
            WHERE n.merge_batch_id = %s
            ORDER BY n.observation_count_api DESC
            LIMIT 1
        """, (batch_id,))

        sample = cur.fetchone()
        if sample:
            print(f"\nTop Enriched Network:")
            print(f"  BSSID:        {sample['bssid']}")
            print(f"  SSID:         {sample['ssid']}")
            print(f"  Encryption:   {sample['encryption']}")
            print(f"  Location:     {sample['road']}, {sample['city']}")
            print(f"  Position:     ({sample['trilaterated_lat']:.6f}, {sample['trilaterated_lon']:.6f})")
            print(f"  Observations: {sample['observation_count_api']}")

    print("\n" + "="*60)
    print("✓ Merge complete!")
    print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(description='Merge WiGLE API data to staging tables')
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without committing')
    args = parser.parse_args()

    print("\n╔═══════════════════════════════════════════════════════════╗")
    print("║  WiGLE API → Staging Merge Script                        ║")
    print("╚═══════════════════════════════════════════════════════════╝\n")

    if args.dry_run:
        print("⚠️  DRY RUN MODE - No changes will be committed\n")

    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)

    try:
        # Check schema
        print("Checking schema extensions...")
        if not check_schema_extended(conn):
            print("✗ Error: Staging tables not extended with API columns")
            print("  Run: docker exec shadowcheck_postgres_18 psql -U postgres -d shadowcheck -f /path/to/extend_staging_schema.sql")
            sys.exit(1)
        print("✓ Schema ready")

        # Generate batch ID
        batch_id = get_merge_batch_id()
        print(f"Batch ID: {batch_id}\n")

        # Phase 1: Enrich network metadata
        networks_enriched = enrich_network_metadata(conn, batch_id, args.dry_run)

        # Phase 2: Merge observations with same-day deduplication
        new_obs, dupes = merge_observations(conn, batch_id, args.dry_run)

        if args.dry_run:
            print("\n" + "="*60)
            print("DRY RUN SUMMARY")
            print("="*60)
            print(f"  Would enrich {networks_enriched} networks")
            print(f"  Would add {new_obs} new observations")
            print(f"  Would skip {dupes} same-day duplicates")
            print("\nRun without --dry-run to apply changes.")
        else:
            # Generate report
            generate_report(conn, batch_id)

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
