# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Tests for validating geographic coordinates and radius parameters
- Total count information in network data endpoint
- Enhanced geospatial features with Mapbox integration
- Observation list display in map visualization

### Changed
- Project description improved for clarity and accuracy
- Network endpoint now counts total observations instead of unique networks
- Network data display updated for improved accuracy and filtering
- Map visualization enhanced by removing unused elements
- Map initialization improved and unused components removed
- Visual styles updated for more consistent and modern user interface
- Network filtering enhanced by type with better signal strength display

### Removed
- Unused map components and elements
- Unnecessary CLI handoff documentation files

## [Previous Versions]

### Added
- Database migration system from WiGLE exports to PostgreSQL
- Normalized relational schema with proper foreign keys
- REST API endpoints for network data access
- Interactive map visualization with Mapbox
- Network analytics and metrics dashboard
- Spatial query capabilities with PostGIS
- Vector tile generation for high-performance mapping

### Changed
- Migrated from flat schema to normalized relational structure
- Unified API endpoints under consistent schema
- Optimized database queries with materialized views

### Fixed
- API schema alignment between storage layer and endpoints
- Duplicate route handlers causing conflicts
- Performance issues with large dataset visualization