#!/bin/bash

# ShadowCheck Development Environment Startup Script
# This script starts PostgreSQL and the development server

set -e

echo "========================================="
echo "ShadowCheck Development Environment"
echo "========================================="
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
if ! docker ps | grep -q shadowcheck_postgres_18; then
    echo "Starting PostgreSQL 18 container..."
    docker compose -f docker-compose.prod.yml up -d postgres
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
else
    echo "PostgreSQL is already running"
fi

# Verify database connection
echo ""
echo "Verifying database connection..."
if docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    echo "Please check PostgreSQL logs: docker logs shadowcheck_postgres_18"
    exit 1
fi

# Display database statistics
echo ""
echo "Database Statistics:"
echo "-------------------"
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "
SELECT
    (SELECT COUNT(*) FROM app.locations_legacy) as locations,
    (SELECT COUNT(*) FROM app.networks_legacy) as networks;
"

echo ""
echo "========================================="
echo "Starting Development Server..."
echo "========================================="
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend:    http://localhost:5173"
echo "Dashboard:   http://localhost:5173/dashboard"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
