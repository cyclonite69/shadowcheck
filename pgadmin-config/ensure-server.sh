#!/bin/bash
# Ensure PostgreSQL server is registered in pgAdmin on every startup
# This script directly manipulates the pgadmin4.db SQLite database

echo "Waiting for pgAdmin to initialize..."
sleep 15

echo "Checking server registration..."

docker exec shadowcheck_pgadmin sh -c '
DB_PATH="/var/lib/pgadmin/pgadmin4.db"

# Wait for database to be created
timeout=30
while [ ! -f "$DB_PATH" ] && [ $timeout -gt 0 ]; do
    echo "Waiting for pgadmin4.db..."
    sleep 1
    timeout=$((timeout-1))
done

if [ ! -f "$DB_PATH" ]; then
    echo "ERROR: pgadmin4.db not found after 30 seconds"
    exit 1
fi

# Get the admin user ID
USER_ID=$(python3 -c "
import sqlite3
conn = sqlite3.connect('"'"'$DB_PATH'"'"')
cursor = conn.cursor()
cursor.execute('"'"'SELECT id FROM user WHERE email = ?'"'"', ('"'"'admin@admin.com'"'"',))
result = cursor.fetchone()
conn.close()
print(result[0] if result else '"'"''"'"')
")

if [ -z "$USER_ID" ]; then
    echo "ERROR: Admin user not found in database"
    exit 1
fi

echo "Found admin user ID: $USER_ID"

# Check if server already exists
SERVER_EXISTS=$(python3 -c "
import sqlite3
conn = sqlite3.connect('"'"'$DB_PATH'"'"')
cursor = conn.cursor()
cursor.execute('"'"'SELECT COUNT(*) FROM server WHERE user_id = ? AND name = ?'"'"', ($USER_ID, '"'"'ShadowCheck Production'"'"'))
result = cursor.fetchone()
conn.close()
print(result[0] if result else 0)
")

if [ "$SERVER_EXISTS" -gt 0 ]; then
    echo "✅ Server already registered"
    exit 0
fi

echo "Registering server in database..."

# Get or create server group
python3 << '"'"'PYEOF'"'"'
import sqlite3
import sys

db_path = "'"'"'$DB_PATH'"'"'
user_id = int("'"'"'$USER_ID'"'"'")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get or create Servers group
    cursor.execute("SELECT id FROM servergroup WHERE user_id = ? AND name = ?", (user_id, "Servers"))
    result = cursor.fetchone()

    if result:
        group_id = result[0]
        print(f"Using existing group ID: {group_id}")
    else:
        cursor.execute("INSERT INTO servergroup (user_id, name) VALUES (?, ?)", (user_id, "Servers"))
        group_id = cursor.lastrowid
        print(f"Created new group ID: {group_id}")
        conn.commit()

    # Insert server
    cursor.execute("""
        INSERT INTO server (
            user_id, servergroup_id, name, host, port,
            maintenance_db, username, ssl_mode, comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        group_id,
        "ShadowCheck Production",
        "postgres",
        5432,
        "shadowcheck",
        "shadowcheck_user",
        "prefer",
        "ShadowCheck PostgreSQL 18 Production Database"
    ))

    server_id = cursor.lastrowid
    conn.commit()
    conn.close()

    print(f"✅ Server registered successfully (ID: {server_id})")
    sys.exit(0)

except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
PYEOF

' || echo "Registration script failed"

echo "Server registration complete!"
