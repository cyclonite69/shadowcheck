-- ShadowCheck Database Refactor - Phase 1: Extensions and Schema Setup
-- Critical: NEVER mutate source data, preserve ALL precision

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create application schema (separate from public)
CREATE SCHEMA IF NOT EXISTS app;

-- Set search path for session
SET search_path TO app, public;

-- Create ENUM types for better data integrity
CREATE TYPE app.radio_technology_enum AS ENUM (
    'wifi',
    'bluetooth',
    'bluetooth_le',
    'gsm',
    'lte',
    'zigbee',
    'unknown'
);

CREATE TYPE app.data_source_type_enum AS ENUM (
    'wigle_app_backup',
    'wigle_api',
    'kismet',
    'manual_entry'
);

CREATE TYPE app.verification_status_enum AS ENUM (
    'pending',
    'confirmed',
    'false_positive',
    'requires_review'
);

CREATE TYPE app.change_event_type_enum AS ENUM (
    'bssid_change_same_ssid',
    'ssid_change_same_bssid',
    'mac_walking',
    'spoofing_detected',
    'ap_replacement',
    'network_reconfiguration'
);

-- Comments for data integrity rules
COMMENT ON SCHEMA app IS 'ShadowCheck SIGINT Database - NEVER mutate source data, preserve ALL precision';