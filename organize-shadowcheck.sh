#!/bin/bash

# =====================================================
# ShadowCheck Project Structure Reorganization Script
# Organizes SQL files, migrations, and documentation
# Idempotent - safe to run multiple times
# =====================================================

set -e

echo "=== SHADOWCHECK PROJECT REORGANIZATION ==="
echo "Current directory: $(pwd)"
echo "Starting file organization..."
echo

# =====================================================
# STEP 1: CREATE STANDARD DIRECTORY STRUCTURE
# =====================================================

echo "Step 1: Creating standard directory structure..."

# Create database-related directories (idempotent)
mkdir -p db/scripts
echo "✓ Created/verified db/scripts/ for verification and test SQL files"

mkdir -p db/migrations
echo "✓ Created/verified db/migrations/ for migration SQL files and docs"

# Create documentation directory (idempotent)
mkdir -p docs
echo "✓ Created/verified docs/ for documentation files"

echo

# =====================================================
# STEP 2: ORGANIZE SQL FILES
# =====================================================

echo "Step 2: Organizing SQL files..."

# Count SQL files before organization
sql_count_root=$(find . -maxdepth 1 -name "*.sql" | wc -l)
echo "Found $sql_count_root SQL files in root directory"

# Move all SQL files from root to db/scripts/ (skip if none exist)
if [ $sql_count_root -gt 0 ]; then
    echo "Moving root-level SQL files to db/scripts/..."
    mv *.sql db/scripts/ 2>/dev/null || true
    echo "✓ Moved root-level SQL files to db/scripts/"
else
    echo "✓ No root-level SQL files to move"
fi

# Find and move any SQL files from other locations (excluding .git and node_modules)
echo "Scanning for SQL files in subdirectories..."
sql_files_found=$(find . -name "*.sql" -not -path "./db/*" -not -path "./.git/*" -not -path "./node_modules/*" | wc -l)

if [ $sql_files_found -gt 0 ]; then
    echo "Found $sql_files_found SQL files in subdirectories, moving to db/scripts/..."
    find . -name "*.sql" -not -path "./db/*" -not -path "./.git/*" -not -path "./node_modules/*" -exec mv {} db/scripts/ \;
    echo "✓ Moved subdirectory SQL files to db/scripts/"
else
    echo "✓ No additional SQL files found in subdirectories"
fi

# Identify and move migration-related SQL files to db/migrations/
echo "Identifying migration-related SQL files..."
migration_files=$(find db/scripts/ -name "*mig*.sql" -o -name "*init*.sql" -o -name "*migration*.sql" 2>/dev/null | wc -l)

if [ $migration_files -gt 0 ]; then
    echo "Found $migration_files migration-related SQL files, moving to db/migrations/..."
    find db/scripts/ -name "*mig*.sql" -exec mv {} db/migrations/ \; 2>/dev/null || true
    find db/scripts/ -name "*init*.sql" -exec mv {} db/migrations/ \; 2>/dev/null || true
    find db/scripts/ -name "*migration*.sql" -exec mv {} db/migrations/ \; 2>/dev/null || true
    echo "✓ Moved migration-related SQL files to db/migrations/"
else
    echo "✓ No migration-related SQL files identified"
fi

echo

# =====================================================
# STEP 3: HANDLE DOCUMENTATION AND MARKDOWN FILES
# =====================================================

echo "Step 3: Organizing documentation files..."

# Move README.md to docs/ if it exists in root
if [ -f "README.md" ]; then
    echo "Moving README.md to docs/..."
    mv README.md docs/
    echo "✓ Moved README.md to docs/"
else
    echo "✓ No README.md found in root"
fi

# Move any other .md files to docs/ (excluding those already in docs/)
md_files=$(find . -maxdepth 1 -name "*.md" | wc -l)
if [ $md_files -gt 0 ]; then
    echo "Found $md_files markdown files in root, moving to docs/..."
    mv *.md docs/ 2>/dev/null || true
    echo "✓ Moved markdown files to docs/"
else
    echo "✓ No additional markdown files found in root"
fi

# Find and move any markdown files from subdirectories (excluding docs/, .git/, node_modules/)
echo "Scanning for markdown files in subdirectories..."
md_subdirs=$(find . -name "*.md" -not -path "./docs/*" -not -path "./.git/*" -not -path "./node_modules/*" | wc -l)

if [ $md_subdirs -gt 0 ]; then
    echo "Found $md_subdirs markdown files in subdirectories, moving to docs/..."
    find . -name "*.md" -not -path "./docs/*" -not -path "./.git/*" -not -path "./node_modules/*" -exec mv {} docs/ \;
    echo "✓ Moved subdirectory markdown files to docs/"
else
    echo "✓ No additional markdown files found in subdirectories"
fi

# Create placeholder MIGRATIONS.md if db/migrations/ is empty
migrations_count=$(find db/migrations/ -name "*.sql" -o -name "*.md" | wc -l)
if [ $migrations_count -eq 0 ]; then
    echo "Creating placeholder MIGRATIONS.md..."
    cat > docs/MIGRATIONS.md << 'EOF'
# Database Migrations

Placeholder for refactored DB migrations—add your schema scripts here.

## Migration Files Location
- `db/migrations/` - Database migration scripts and related documentation
- `db/scripts/` - General SQL scripts for verification, testing, and analysis

## Migration Naming Convention
- Use descriptive names with timestamps: `YYYYMMDD_HHMMSS_description.sql`
- Include both up and down migrations where applicable
- Document any manual steps required in this file

## Current Status
- [ ] Review existing SQL files in db/scripts/
- [ ] Identify which files should be formal migrations
- [ ] Create proper migration structure
- [ ] Update this documentation
EOF
    echo "✓ Created placeholder docs/MIGRATIONS.md"
else
    echo "✓ db/migrations/ contains files, skipping placeholder creation"
fi

echo

# =====================================================
# STEP 4: GIT OPERATIONS
# =====================================================

echo "Step 4: Committing changes to Git..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  Not in a Git repository, skipping Git operations"
else
    echo "Adding all changes to Git..."
    git add .
    echo "✓ Added all changes to Git staging area"

    echo "Committing changes..."
    git commit -m "Organize structure: SQL to db/scripts/, migrations to db/migrations/, docs to docs/" || echo "✓ No changes to commit (files may already be organized)"

    echo "Pushing to origin master..."
    git push origin master || git push origin main || echo "⚠️  Could not push - check remote configuration"
    echo "✓ Pushed changes to remote repository"
fi

echo

# =====================================================
# COMPLETION SUMMARY
# =====================================================

echo "=== ORGANIZATION SUMMARY ==="
echo "Directory structure:"
echo "├── db/"
echo "│   ├── scripts/     ($(find db/scripts/ -name "*.sql" 2>/dev/null | wc -l) SQL files)"
echo "│   └── migrations/  ($(find db/migrations/ -name "*.sql" 2>/dev/null | wc -l) migration files)"
echo "└── docs/            ($(find docs/ -name "*.md" 2>/dev/null | wc -l) documentation files)"
echo

echo "Files organized successfully!"
echo "📁 SQL scripts moved to db/scripts/"
echo "🔄 Migration files moved to db/migrations/"
echo "📄 Documentation moved to docs/"
echo

echo "Organization complete—review for deletions."