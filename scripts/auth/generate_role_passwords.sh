#!/usr/bin/env bash
# Generate secure random passwords for app roles

echo "=== GENERATING NEW ROLE PASSWORDS ==="
APP_PASS_NEW=$(openssl rand -base64 24 | tr -d '/+=' | head -c 20)
ADMIN_PASS_NEW=$(openssl rand -base64 24 | tr -d '/+=' | head -c 20)

echo ""
echo "ADD THESE TO REPLIT SECRETS:"
echo "================================"
echo "Key: NEON_APP_PASS"
echo "Value: $APP_PASS_NEW"
echo ""
echo "Key: NEON_ADMIN_PASS" 
echo "Value: $ADMIN_PASS_NEW"
echo "================================"
echo ""
echo "1. Click 'Secrets' in left sidebar"
echo "2. Add each key/value pair above"
echo "3. Restart your Repl"
echo "4. Run: ./setup_password_management.sh"
