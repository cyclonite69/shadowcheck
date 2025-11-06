ALTER TABLE app.wigle_sqlite_locations_staging
ADD CONSTRAINT wigle_sqlite_locations_staging_unique_observation
UNIQUE (bssid, level, lat, lon, altitude, accuracy, "time");