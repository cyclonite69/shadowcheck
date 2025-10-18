#!/usr/bin/env bash
# Wrapper script to run psql inside the Docker container.

if [ -z "$SC_CONTAINER" ] || [ -z "$SC_DB" ]; then
    echo "Error: SC_CONTAINER or SC_DB environment variables must be exported on the host." 1>&2
    exit 1
fi

exec docker exec -i "$SC_CONTAINER" psql -U postgres -d "$SC_DB" "$@"
