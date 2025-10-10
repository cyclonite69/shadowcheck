-- ShadowCheck Database Refactor - Phase 2: Reference Tables
-- OUI manufacturers and data source definitions

-- OUI Manufacturers (reference data from IEEE)
CREATE TABLE app.oui_manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    oui_prefix_hex CHAR(6) NOT NULL UNIQUE,  -- First 3 bytes of MAC (24 bits)
    organization_name TEXT NOT NULL,
    organization_address TEXT,
    registry_type TEXT DEFAULT 'MA-L',  -- MA-L, MA-M, MA-S, CID
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_oui_format CHECK (oui_prefix_hex ~ '^[0-9A-F]{6}$')
);

-- Index for fast MAC address lookups
CREATE INDEX idx_oui_prefix ON app.oui_manufacturers (oui_prefix_hex);

-- Data Sources (pipeline identification)
CREATE TABLE app.data_sources (
    data_source_id SERIAL PRIMARY KEY,
    source_name TEXT NOT NULL UNIQUE,
    source_type app.data_source_type_enum NOT NULL,
    pipeline_priority INTEGER NOT NULL,  -- 1=app_backup (highest), 2=wigle_api, 3=kismet
    data_quality_baseline NUMERIC(3,2) DEFAULT 1.0 CHECK (data_quality_baseline BETWEEN 0 AND 1),

    -- Configuration for import processing
    import_configuration JSONB,

    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_priority_per_type UNIQUE (source_type, pipeline_priority)
);

-- Insert default data sources
INSERT INTO app.data_sources (source_name, source_type, pipeline_priority, data_quality_baseline, description) VALUES
('WiGLE Android App Backup', 'wigle_app_backup', 1, 1.0, 'SQLite database export from WiGLE Android app - highest trust'),
('WiGLE Web API', 'wigle_api', 2, 0.8, 'JSON responses from WiGLE web API - moderate trust, potential rounding'),
('Kismet SQLite Export', 'kismet', 3, 0.9, 'Direct Kismet capture database - high precision, microsecond timestamps'),
('Manual Data Entry', 'manual_entry', 4, 0.5, 'Manually entered data - requires verification');

-- Function to extract OUI from MAC address
CREATE OR REPLACE FUNCTION app.extract_oui(mac_address TEXT)
RETURNS CHAR(6) AS $$
BEGIN
    -- Remove separators and take first 6 characters
    RETURN UPPER(SUBSTRING(REGEXP_REPLACE(mac_address, '[^0-9A-Fa-f]', '', 'g'), 1, 6));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get manufacturer for MAC address
CREATE OR REPLACE FUNCTION app.get_manufacturer_id(mac_address TEXT)
RETURNS INTEGER AS $$
DECLARE
    oui_prefix CHAR(6);
    manuf_id INTEGER;
BEGIN
    oui_prefix := app.extract_oui(mac_address);

    SELECT manufacturer_id INTO manuf_id
    FROM app.oui_manufacturers
    WHERE oui_prefix_hex = oui_prefix;

    RETURN manuf_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.extract_oui(TEXT) IS 'Extract OUI (first 3 bytes) from MAC address - preserves original format';
COMMENT ON FUNCTION app.get_manufacturer_id(TEXT) IS 'Get manufacturer ID for MAC address via OUI lookup';