#!/bin/bash
#
# Fix Docker Bridge IP Address Issue
# The bridge br-61d45f745fe9 for shadowcheck_shadowcheck_internal_prod
# is missing its IPv4 gateway address, preventing localhost port forwarding
#

set -e

BRIDGE_NAME="br-61d45f745fe9"
BRIDGE_IP="172.29.0.1/16"

echo "🔍 Checking Docker bridge configuration..."
echo ""

# Check if bridge exists
if ! ip addr show "$BRIDGE_NAME" &>/dev/null; then
    echo "❌ Error: Bridge $BRIDGE_NAME does not exist"
    exit 1
fi

# Check if IPv4 address is already configured
if ip addr show "$BRIDGE_NAME" | grep -q "inet 172.29.0.1"; then
    echo "✅ Bridge already has correct IP address"
    ip addr show "$BRIDGE_NAME"
    exit 0
fi

echo "⚠️  Bridge is missing IP address!"
echo "Current bridge state:"
ip addr show "$BRIDGE_NAME"
echo ""

echo "Adding IP address $BRIDGE_IP to bridge $BRIDGE_NAME..."
sudo ip addr add "$BRIDGE_IP" dev "$BRIDGE_NAME"

echo ""
echo "✅ Docker bridge fixed!"
echo ""
echo "New bridge state:"
ip addr show "$BRIDGE_NAME"
echo ""

echo "🧪 Testing connectivity to backend..."
if curl -sf http://localhost:5000/api/v1/health >/dev/null 2>&1; then
    echo "✅ Backend connection successful!"
else
    echo "⚠️  Backend connection test failed - may need to wait a moment"
fi
