#!/bin/bash
# Generate secure password for ShadowCheck database

set -e

# Generate a strong random password
PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo "Generated secure password: $PASSWORD"
echo
echo "Update your configuration files:"
echo "1. Edit .env and replace 'your_secure_password_here' with: $PASSWORD"
echo "2. Edit docker-compose.yml and replace 'your_secure_password_here' with: $PASSWORD"
echo "3. Edit deploy.sh and replace 'your_secure_password_here' with: $PASSWORD"
echo
echo "Or use sed to update automatically:"
echo "sed -i 's/your_secure_password_here/$PASSWORD/g' .env docker-compose.yml deploy.sh"