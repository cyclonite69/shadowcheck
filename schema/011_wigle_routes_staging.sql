CREATE TABLE IF NOT EXISTS app.wigle_sqlite_routes_staging (
    unified_id BIGSERIAL PRIMARY KEY,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    time BIGINT,
    sqlite_filename TEXT,
    imported_at TIMESTAMPTZ
);