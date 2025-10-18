#!/bin/bash

set -e

echo "=== PostgreSQL Database Schema Analysis ==="
echo "Timestamp: $(date)"
echo

# Docker container and database parameters
CONTAINER="${CONTAINER:-shadowcheck_postgres}"
DB_NAME="${DB_NAME:-shadowcheck}"
DB_USER="${DB_USER:-postgres}"
SCHEMA="${SCHEMA:-app}"

# Test database connection
echo "Testing database connection to $DB_NAME in container $CONTAINER..."
docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -c '\q' || {
    echo "Error: Could not connect to database"
    exit 1
}
echo "Connected successfully to $DB_NAME in container $CONTAINER"
echo

# Function to run SQL queries
run_query() {
    docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "$1"
}

# 1. Table sizes sorted by largest first
echo "=== TABLE SIZES (sorted by largest) ==="
run_query "
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = '$SCHEMA'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
echo

# 2. Foreign key relationships
echo "=== FOREIGN KEY RELATIONSHIPS ==="
run_query "
SELECT
    tc.table_name as table_name,
    kcu.column_name as column_name,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = '$SCHEMA'
ORDER BY tc.table_name, kcu.column_name;
"
echo

# 3. Row count for each table
echo "=== ROW COUNTS BY TABLE ==="
for table in $(run_query "SELECT tablename FROM pg_tables WHERE schemaname = '$SCHEMA' ORDER BY tablename;"); do
    count=$(run_query "SELECT COUNT(*) FROM $SCHEMA.$table;")
    printf "%-30s %s\n" "$table" "$count"
done
echo

# 4. Tables with zero rows
echo "=== TABLES WITH ZERO ROWS ==="
for table in $(run_query "SELECT tablename FROM pg_tables WHERE schemaname = '$SCHEMA' ORDER BY tablename;"); do
    count=$(run_query "SELECT COUNT(*) FROM $SCHEMA.$table;")
    if [ "$count" -eq 0 ]; then
        echo "$table"
    fi
done
echo

# 5. Orphaned records detection
echo "=== ORPHANED RECORDS DETECTION ==="
run_query "
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name as foreign_table,
    ccu.column_name as foreign_column,
    tc.constraint_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = '$SCHEMA'
ORDER BY tc.table_name;
" | while IFS=$'\t' read -r table_name column_name foreign_table foreign_column constraint_name; do
    if [ ! -z "$table_name" ]; then
        orphan_count=$(run_query "
        SELECT COUNT(*)
        FROM $SCHEMA.$table_name t
        LEFT JOIN $SCHEMA.$foreign_table f ON t.$column_name = f.$foreign_column
        WHERE f.$foreign_column IS NULL AND t.$column_name IS NOT NULL;
        ")
        if [ "$orphan_count" -gt 0 ]; then
            echo "$table_name.$column_name -> $foreign_table.$foreign_column: $orphan_count orphaned records"
        fi
    fi
done
echo

echo "=== Analysis Complete ==="