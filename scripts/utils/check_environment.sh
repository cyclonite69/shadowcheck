#!/usr/bin/env bash
# Environment health check

echo "Environment Health Check"
echo "======================="

# API Server check
if curl -s "http://localhost:5000/" | grep -q "ok"; then
    echo "✓ API Server: Running on port 5000"
else  
    echo "✗ API Server: Not responding"
fi

# Database connections (ensure .pgpass usage)
unset PGPASSWORD

if psql "service=shadowcheck_app" -tAc "SELECT 1;" >/dev/null 2>&1; then
    echo "✓ Database: shadowcheck_app connected"
else
    echo "✗ Database: shadowcheck_app connection failed"
fi

if psql "service=sigint_admin" -tAc "SELECT 1;" >/dev/null 2>&1; then  
    echo "✓ Database: sigint_admin connected"
else
    echo "✗ Database: sigint_admin connection failed"
fi

# Data summary
echo ""
echo "Data Summary"
echo "============"
networks=$(psql "service=shadowcheck_app" -tAc "SELECT COUNT(*) FROM app.networks;" 2>/dev/null || echo "ERROR")
observations=$(psql "service=shadowcheck_app" -tAc "SELECT COUNT(*) FROM app.network_observations;" 2>/dev/null || echo "ERROR")
locations=$(psql "service=shadowcheck_app" -tAc "SELECT COUNT(*) FROM app.locations;" 2>/dev/null || echo "ERROR")

echo "Networks: $networks"
echo "Observations: $observations" 
echo "Locations: $locations"
