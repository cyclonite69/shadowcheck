-- Kismet Pipeline Tables
-- Tables for importing Kismet SQLite database exports

-- Kismet devices staging table
CREATE TABLE IF NOT EXISTS app.kismet_devices_staging (
    kismet_dev_id BIGSERIAL PRIMARY KEY,
    devkey TEXT NOT NULL,
    phyname TEXT,
    devmac TEXT,
    strongest_signal INTEGER,
    min_lat DOUBLE PRECISION,
    min_lon DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    max_lon DOUBLE PRECISION,
    avg_lat DOUBLE PRECISION,
    avg_lon DOUBLE PRECISION,
    device_json JSONB,
    kismet_filename TEXT NOT NULL,
    kismet_import_dt TIMESTAMPTZ DEFAULT NOW(),

    -- Extracted fields from JSON
    type_string TEXT,
    basic_type_string TEXT,
    manuf TEXT,
    first_time BIGINT,
    last_time BIGINT,

    UNIQUE(devkey, kismet_filename)
);

-- Kismet data sources staging table
CREATE TABLE IF NOT EXISTS app.kismet_datasources_staging (
    kismet_ds_id BIGSERIAL PRIMARY KEY,
    uuid TEXT NOT NULL,
    typestring TEXT,
    definition TEXT,
    name TEXT,
    interface TEXT,
    kismet_filename TEXT NOT NULL,
    kismet_import_dt TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(uuid, kismet_filename)
);

-- Kismet packets staging table (optional - high volume)
CREATE TABLE IF NOT EXISTS app.kismet_packets_staging (
    kismet_pkt_id BIGSERIAL PRIMARY KEY,
    ts_sec BIGINT NOT NULL,
    ts_usec INTEGER,
    phyname TEXT,
    sourcemac TEXT,
    destmac TEXT,
    transmac TEXT,
    frequency DOUBLE PRECISION,
    devkey TEXT,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    alt DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    packet_len INTEGER,
    signal INTEGER,
    datasource TEXT,
    kismet_filename TEXT NOT NULL,
    kismet_import_dt TIMESTAMPTZ DEFAULT NOW()
);

-- Kismet alerts staging table
CREATE TABLE IF NOT EXISTS app.kismet_alerts_staging (
    kismet_alert_id BIGSERIAL PRIMARY KEY,
    ts_sec BIGINT NOT NULL,
    ts_usec INTEGER,
    phyname TEXT,
    devmac TEXT,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    header TEXT,
    json_data JSONB,
    kismet_filename TEXT NOT NULL,
    kismet_import_dt TIMESTAMPTZ DEFAULT NOW()
);

-- Kismet snapshots staging table
CREATE TABLE IF NOT EXISTS app.kismet_snapshots_staging (
    kismet_snap_id BIGSERIAL PRIMARY KEY,
    ts_sec BIGINT NOT NULL,
    ts_usec INTEGER,
    snaptype TEXT,
    json_data JSONB,
    kismet_filename TEXT NOT NULL,
    kismet_import_dt TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kismet_devices_devmac ON app.kismet_devices_staging(devmac);
CREATE INDEX IF NOT EXISTS idx_kismet_devices_filename ON app.kismet_devices_staging(kismet_filename);
CREATE INDEX IF NOT EXISTS idx_kismet_devices_time ON app.kismet_devices_staging(last_time);
CREATE INDEX IF NOT EXISTS idx_kismet_packets_devkey ON app.kismet_packets_staging(devkey);
CREATE INDEX IF NOT EXISTS idx_kismet_packets_time ON app.kismet_packets_staging(ts_sec);
CREATE INDEX IF NOT EXISTS idx_kismet_packets_sourcemac ON app.kismet_packets_staging(sourcemac);
CREATE INDEX IF NOT EXISTS idx_kismet_alerts_devmac ON app.kismet_alerts_staging(devmac);
CREATE INDEX IF NOT EXISTS idx_kismet_alerts_time ON app.kismet_alerts_staging(ts_sec);

-- Comments
COMMENT ON TABLE app.kismet_devices_staging IS 'Staging table for Kismet device records with full JSON metadata';
COMMENT ON TABLE app.kismet_datasources_staging IS 'Staging table for Kismet data source information';
COMMENT ON TABLE app.kismet_packets_staging IS 'Staging table for Kismet packet data (optional, high volume)';
COMMENT ON TABLE app.kismet_alerts_staging IS 'Staging table for Kismet security alerts';
COMMENT ON TABLE app.kismet_snapshots_staging IS 'Staging table for Kismet system snapshots';
