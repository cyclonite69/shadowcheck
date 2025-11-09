#!/bin/bash
#
# Install ShadowCheck Database Backup Timer
# Run this script with: sudo ./install-backup-timer.sh
#

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)"
   exit 1
fi

echo "Installing ShadowCheck database backup service and timer..."

# Copy service file
cp /tmp/shadowcheck-backup.service /etc/systemd/system/
echo "✓ Installed shadowcheck-backup.service"

# Copy timer file
cp /tmp/shadowcheck-backup.timer /etc/systemd/system/
echo "✓ Installed shadowcheck-backup.timer"

# Reload systemd
systemctl daemon-reload
echo "✓ Reloaded systemd daemon"

# Enable the timer (will start on boot and run on schedule)
systemctl enable shadowcheck-backup.timer
echo "✓ Enabled shadowcheck-backup.timer"

# Start the timer now
systemctl start shadowcheck-backup.timer
echo "✓ Started shadowcheck-backup.timer"

# Show status
echo ""
echo "========================================="
echo "Backup timer installed successfully!"
echo "========================================="
echo ""
echo "Status:"
systemctl status shadowcheck-backup.timer --no-pager

echo ""
echo "Next scheduled runs:"
systemctl list-timers shadowcheck-backup.timer --no-pager

echo ""
echo "To manually trigger a backup:"
echo "  sudo systemctl start shadowcheck-backup.service"
echo ""
echo "To view backup logs:"
echo "  journalctl -u shadowcheck-backup.service -f"
echo "  OR"
echo "  cat /home/nunya/shadowcheck/backups/backup.log"
echo ""
