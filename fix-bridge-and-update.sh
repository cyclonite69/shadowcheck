#!/bin/bash
set -e

# 1. Fix Docker bridge IP
BRIDGE_NAME="br-61d45f745fe9"
BRIDGE_IP="172.29.0.1/16"

echo "🔧 Adding IP $BRIDGE_IP to bridge $BRIDGE_NAME..."
if ! ip addr show "$BRIDGE_NAME" | grep -q "inet 172.29.0.1"; then
    sudo ip addr add "$BRIDGE_IP" dev "$BRIDGE_NAME"
    echo "✅ Bridge IP added"
else
    echo "✅ Bridge IP already configured"
fi

# 2. Update pgAdmin image in compose file
sed -i 's/image: dpage\/pgadmin4:latest/image: dpage\/pgadmin4:8.14/' docker compose.prod.yml
sed -i 's/127.0.0.1:5050:80/127.0.0.1:8080:80/' docker compose.prod.yml

# 3. Restart pgAdmin with new image
docker compose -f docker compose.prod.yml up -d pgadmin

echo "✅ Complete"
