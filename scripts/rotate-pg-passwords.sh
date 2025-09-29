#!/usr/bin/env bash
# rotate-pg-passwords.sh
# Version: 0.5
# Purpose: Randomize passwords for Postgres roles in a container:
#          postgres, shadowcheck_admin, shadowcheck_user. Non-destructive.

set -euo pipefail

# Detect project root dynamically
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
ENV_FILE="${PROJECT_ROOT}/.env.postgres"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-}"

# Detect running Postgres container if not supplied
if [[ -z "$POSTGRES_CONTAINER" ]]; then
  POSTGRES_CONTAINER=$(docker ps --format '{{.Names}} {{.Image}}' \
    | grep -E '^shadowcheck_postgres|postgres|postgis' | awk '{print $1}' | head -n1 || true)
  if [[ -z "$POSTGRES_CONTAINER" ]]; then
    echo "No running Postgres container found. Exiting."
    exit 1
  fi
fi

echo "Using container: $POSTGRES_CONTAINER"
echo "Project root: $PROJECT_ROOT"
echo "ENV file: $ENV_FILE"
echo

# Define the key roles
KEY_ROLES=("postgres" "shadowcheck_admin" "shadowcheck_user")

# Check which roles exist in the container
EXISTING_ROLES=()
for role in "${KEY_ROLES[@]}"; do
  EXISTS=$(docker exec -u postgres "$POSTGRES_CONTAINER" \
    psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$role';" | tr -d '[:space:]')
  if [[ "$EXISTS" == "1" ]]; then
    EXISTING_ROLES+=("$role")
  fi
done

if [[ ${#EXISTING_ROLES[@]} -eq 0 ]]; then
  echo "No key roles found in container. Exiting."
  exit 0
fi

echo "Existing roles to rotate passwords for: ${EXISTING_ROLES[*]}"
echo

# Generate strong passwords
generate_pass() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 18
  else
    date +%s%N | sha256sum | head -c 24
  fi
}

declare -A PASSWORDS
for role in "${EXISTING_ROLES[@]}"; do
  PASSWORDS["$role"]=$(generate_pass)
done

# Apply passwords inside container
for role in "${EXISTING_ROLES[@]}"; do
  docker exec -u postgres "$POSTGRES_CONTAINER" \
    psql -v ON_ERROR_STOP=1 -U postgres \
    -c "ALTER USER \"$role\" WITH PASSWORD '${PASSWORDS[$role]}';"
done

# Update .env.postgres
mkdir -p "$(dirname "$ENV_FILE")"
touch "$ENV_FILE"

for role in "${EXISTING_ROLES[@]}"; do
  grep -vE "^PG_${role^^}_PASS=" "$ENV_FILE" > "$ENV_FILE.tmp" || true
  mv "$ENV_FILE.tmp" "$ENV_FILE"
  echo "PG_${role^^}_PASS='${PASSWORDS[$role]}'" >> "$ENV_FILE"
done

# Output results
echo "[Done] Passwords rotated for existing roles and saved in $ENV_FILE."
echo
echo "Generated passwords:"
for role in "${EXISTING_ROLES[@]}"; do
  echo "  $role: ${PASSWORDS[$role]}"
done
echo
echo "Verify connection inside container (example for each role):"
for role in "${EXISTING_ROLES[@]}"; do
  echo "  docker exec -u postgres $POSTGRES_CONTAINER psql -U $role -c '\conninfo'"
done
