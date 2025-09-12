# Database Migration Methodology

## Current Status (Sept 7, 2025)

- ✅ Migrated from old schema (app.location, app.network) to normalized schema
- ✅ 1,268 networks, 2,510 observations preserved
- ✅ Event sourcing implemented for network state changes
- ✅ API endpoints updated for new schema

## Migration Scripts (in order)

1. `migrate_existing_data.sql` - Main migration from old to new schema
2. `update_views_new_schema.sql` - Recreate views for new schema

## For Future Migrations

1. Always backup data first
2. Test migration on copy before production
3. Use transactions for atomicity
4. Verify data integrity after migration
5. Update application code before dropping old tables

## Schema Design Principles

- Temporal integrity: capture state at observation time
- Event sourcing: track all state changes as events
- Proper normalization: separate concerns (networks, locations, observations)
- Performance: materialized views for expensive queries
