#!/usr/bin/env bash
# Clean up workspace systematically

echo "Cleaning up workspace..."

# Create directories if they don't exist
mkdir -p database/{migrations,admin,auth} scripts/{archive,utils}

# Archive old/experimental scripts
echo "Archiving experimental scripts..."
mv *neon_passwords*.sh scripts/archive/ 2>/dev/null || true
mv alter_*.sh scripts/archive/ 2>/dev/null || true  
mv sync_*.sh scripts/archive/ 2>/dev/null || true
mv extract_*.sh scripts/archive/ 2>/dev/null || true
mv write_*.sh scripts/archive/ 2>/dev/null || true
mv 001b_*.sh scripts/archive/ 2>/dev/null || true
mv 002_*.sh scripts/archive/ 2>/dev/null || true
mv add_*.sh scripts/archive/ 2>/dev/null || true

# Move migration files to proper location
mv migrate_existing_data.sql database/migrations/ 2>/dev/null || true
mv update_views_new_schema.sql database/migrations/ 2>/dev/null || true
mv 001_bootstrap_postgis.sh database/admin/ 2>/dev/null || true
mv setup_neon_psql_clients.sh database/auth/ 2>/dev/null || true

# Remove temporary files
rm -f *.patch *.tmp update_*.sql temp_*.sql fix_*.* sid, 2>/dev/null || true
rm -f 'ql service=sigint_admin'* 2>/dev/null || true

echo "Workspace cleaned up"
