#!/bin/bash
# Fix for Docker bridge network missing IPv4 address
# This script adds the missing gateway IP to the shadowcheck Docker bridge
#
# Root cause: The Docker bridge br-c92029280bb0 for shadowcheck_shadowcheck_network
# was missing its IPv4 address (172.18.0.1/16), preventing port forwarding from
# 127.0.0.1:5432 to the PostgreSQL container at 172.18.0.6:5432

set -e

BRIDGE_NAME="br-c92029280bb0"
BRIDGE_IP="172.18.0.1/16"

echo "Checking Docker bridge configuration..."

# Check if bridge exists
if ! ip addr show "$BRIDGE_NAME" &>/dev/null; then
    echo "Error: Bridge $BRIDGE_NAME does not exist"
    exit 1
fi

# Check if IPv4 address is already configured
if ip addr show "$BRIDGE_NAME" | grep -q "inet 172.18.0.1"; then
    echo "✅ Bridge already has correct IP address"
    exit 0
fi

echo "Adding IP address $BRIDGE_IP to bridge $BRIDGE_NAME..."
sudo ip addr add "$BRIDGE_IP" dev "$BRIDGE_NAME"

echo "✅ Docker bridge fixed!"
echo ""
echo "Verifying connectivity..."
if timeout 3 psql -h 127.0.0.1 -p 5432 -U postgres -d shadowcheck -c "SELECT 1" &>/dev/null; then
    echo "✅ PostgreSQL connection successful!"
else
    echo "⚠️  PostgreSQL connection test failed - you may need to restart services"
fi
