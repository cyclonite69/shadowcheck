"""
Safe Ingestion Helpers
Provides deduplication-aware batch insertion for all data pipelines

Each pipeline maintains its own deduplication constraints to prevent
re-importing the same data, while preserving cross-source duplicates
for data enrichment.
"""

import psycopg2
from psycopg2.extras import Json
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SafeIngestStats:
    """Statistics from a batch ingestion operation"""

    def __init__(self, total: int = 0, inserted: int = 0, duplicates: int = 0):
        self.total = total
        self.inserted = inserted
        self.duplicates = duplicates

    @property
    def duplicate_rate(self) -> float:
        """Percentage of duplicates"""
        return (self.duplicates / self.total * 100) if self.total > 0 else 0.0

    def __str__(self) -> str:
        return (
            f"Ingestion: {self.inserted} inserted, {self.duplicates} duplicates "
            f"({self.duplicate_rate:.1f}% duplicate rate) out of {self.total} total"
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total": self.total,
            "inserted": self.inserted,
            "duplicates": self.duplicates,
            "duplicate_rate": round(self.duplicate_rate, 2)
        }


class SafeIngester:
    """
    Handles safe ingestion with deduplication for all pipelines
    """

    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def _get_connection(self):
        """Get a new database connection"""
        return psycopg2.connect(self.connection_string)

    def insert_kml_observation(
        self,
        bssid: str,
        ssid: Optional[str],
        network_type: str,
        encryption_type: Optional[str],
        level: int,
        lat: float,
        lon: float,
        altitude: Optional[float],
        accuracy: Optional[float],
        time_ms: int,
        kml_filename: str,
        source_id: Optional[int] = None
    ) -> bool:
        """
        Insert single KML observation
        Returns True if inserted, False if duplicate
        """
        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT app.safe_insert_kml_location(
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    """,
                    (
                        bssid, ssid, network_type, encryption_type,
                        level, lat, lon, altitude, accuracy,
                        time_ms, kml_filename, source_id
                    )
                )
                result = cur.fetchone()[0]
                conn.commit()
                return result > 0

    def batch_insert_kml_observations(
        self,
        observations: List[Dict[str, Any]]
    ) -> SafeIngestStats:
        """
        Batch insert KML observations with deduplication
        Returns statistics about inserted vs duplicate rows
        """
        if not observations:
            return SafeIngestStats()

        with self._get_connection() as conn:
            with conn.cursor() as cur:
                # Use the PostgreSQL batch insert function
                cur.execute(
                    "SELECT app.batch_insert_kml_locations(%s::jsonb)",
                    (Json(observations),)
                )
                result = cur.fetchone()[0]
                conn.commit()

                return SafeIngestStats(
                    total=result["total"],
                    inserted=result["inserted"],
                    duplicates=result["duplicates"]
                )

    def insert_wigle_api_observation(
        self,
        bssid: str,
        signal_level: int,
        lat: float,
        lon: float,
        altitude: Optional[float],
        accuracy: Optional[float],
        time: datetime,
        query_params: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Insert single WiGLE API observation
        Returns True if inserted, False if duplicate
        """
        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT app.safe_insert_wigle_api_location(
                        %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    """,
                    (
                        bssid, signal_level, lat, lon,
                        altitude, accuracy, time,
                        Json(query_params) if query_params else None
                    )
                )
                result = cur.fetchone()[0]
                conn.commit()
                return result > 0

    def batch_insert_wigle_api_observations(
        self,
        observations: List[Dict[str, Any]]
    ) -> SafeIngestStats:
        """
        Batch insert WiGLE API observations
        Returns statistics
        """
        if not observations:
            return SafeIngestStats()

        stats = SafeIngestStats(total=len(observations))

        with self._get_connection() as conn:
            with conn.cursor() as cur:
                for obs in observations:
                    cur.execute(
                        """
                        SELECT app.safe_insert_wigle_api_location(
                            %s, %s, %s, %s, %s, %s, %s, %s
                        )
                        """,
                        (
                            obs["bssid"],
                            obs["signal_level"],
                            obs["lat"],
                            obs["lon"],
                            obs.get("altitude"),
                            obs.get("accuracy"),
                            obs["time"],
                            Json(obs.get("query_params")) if obs.get("query_params") else None
                        )
                    )
                    result = cur.fetchone()[0]
                    if result > 0:
                        stats.inserted += 1
                    else:
                        stats.duplicates += 1

                conn.commit()

        return stats

    def insert_legacy_observation(
        self,
        bssid: str,
        level: int,
        lat: float,
        lon: float,
        altitude: Optional[float],
        accuracy: Optional[float],
        time_ms: int,
        source_id: Optional[int] = None
    ) -> bool:
        """
        Insert single legacy (SQLite) observation
        Returns True if inserted, False if duplicate
        """
        with self._get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT app.safe_insert_legacy_location(
                        %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    """,
                    (
                        bssid, level, lat, lon,
                        altitude, accuracy, time_ms, source_id
                    )
                )
                result = cur.fetchone()[0]
                conn.commit()
                return result > 0

    def batch_insert_legacy_observations(
        self,
        observations: List[Dict[str, Any]]
    ) -> SafeIngestStats:
        """
        Batch insert legacy observations
        Returns statistics
        """
        if not observations:
            return SafeIngestStats()

        stats = SafeIngestStats(total=len(observations))

        with self._get_connection() as conn:
            with conn.cursor() as cur:
                for obs in observations:
                    cur.execute(
                        """
                        SELECT app.safe_insert_legacy_location(
                            %s, %s, %s, %s, %s, %s, %s, %s
                        )
                        """,
                        (
                            obs["bssid"],
                            obs["level"],
                            obs["lat"],
                            obs["lon"],
                            obs.get("altitude"),
                            obs.get("accuracy"),
                            obs["time"],
                            obs.get("source_id")
                        )
                    )
                    result = cur.fetchone()[0]
                    if result > 0:
                        stats.inserted += 1
                    else:
                        stats.duplicates += 1

                conn.commit()

        return stats


# Example usage
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()

    # Initialize ingester
    ingester = SafeIngester(os.getenv("DATABASE_URL"))

    # Example: Batch insert KML observations
    kml_observations = [
        {
            "bssid": "AA:BB:CC:DD:EE:FF",
            "ssid": "TestNetwork",
            "network_type": "W",
            "encryption_type": "[WPA2-PSK-CCMP][ESS]",
            "level": -65,
            "lat": 37.7749,
            "lon": -122.4194,
            "altitude": 10.0,
            "accuracy": 15.0,
            "time": 1640000000000,
            "kml_filename": "test.kml"
        },
        # Duplicate of above
        {
            "bssid": "AA:BB:CC:DD:EE:FF",
            "ssid": "TestNetwork",
            "network_type": "W",
            "encryption_type": "[WPA2-PSK-CCMP][ESS]",
            "level": -65,
            "lat": 37.7749,
            "lon": -122.4194,
            "altitude": 10.0,
            "accuracy": 15.0,
            "time": 1640000000000,
            "kml_filename": "test.kml"
        },
        # Different observation
        {
            "bssid": "11:22:33:44:55:66",
            "ssid": "AnotherNetwork",
            "network_type": "W",
            "encryption_type": "[WPA2-PSK-CCMP][ESS]",
            "level": -70,
            "lat": 37.7750,
            "lon": -122.4195,
            "altitude": 12.0,
            "accuracy": 20.0,
            "time": 1640000001000,
            "kml_filename": "test.kml"
        }
    ]

    stats = ingester.batch_insert_kml_observations(kml_observations)
    print(stats)
    # Expected: Ingestion: 2 inserted, 1 duplicates (33.3% duplicate rate) out of 3 total
