#!/bin/sh
# ==============================================================================
# SHADOWCHECK BACKEND ENTRYPOINT
# Constructs DATABASE_URL from Docker secrets and environment variables
# ==============================================================================

set -e

# Read password from Docker secret file if DB_PASSWORD_FILE is set
if [ -n "$DB_PASSWORD_FILE" ] && [ -f "$DB_PASSWORD_FILE" ]; then
  DB_PASSWORD=$(cat "$DB_PASSWORD_FILE")
  export DB_PASSWORD

  # Construct DATABASE_URL if not already set
  if [ -z "$DATABASE_URL" ]; then
    # URL-encode the password to handle special characters
    DB_PASSWORD_ENCODED=$(printf %s "$DB_PASSWORD" | jq -sRr @uri)

    export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    echo "✓ DATABASE_URL constructed from secrets"
  fi
else
  echo "⚠ Warning: DB_PASSWORD_FILE not set or file not found"
fi

# Set standard PostgreSQL environment variables for compatibility
export PGHOST="${DB_HOST}"
export PGPORT="${DB_PORT}"
export PGDATABASE="${DB_NAME}"
export PGUSER="${DB_USER}"
export PGPASSWORD="${DB_PASSWORD}"

# Execute the main command
exec "$@"
