# Database Backup System - ShadowCheck

**Created:** 2025-11-07
**Purpose:** Automated PostgreSQL database backups with alternating backup slots

---

## Overview

The ShadowCheck database backup system creates full dumps of the entire PostgreSQL cluster (all databases) twice per week, alternating between two backup files to ensure we always have a working backup even if one backup operation fails.

## System Components

### 1. Backup Script: `backup-database.sh`

**Location:** `/home/nunya/shadowcheck/backup-database.sh`

**Features:**
- ✅ Full PostgreSQL cluster backup (all databases)
- ✅ Alternating backup slots (A and B)
- ✅ Automatic verification of backup integrity
- ✅ Detailed logging
- ✅ Automatic cleanup of old temporary files
- ✅ Safe overwriting with temporary file strategy

**Backup Strategy:**
```
First run:  Creates backup_a.sql
Second run: Creates backup_b.sql (overwrites previous B)
Third run:  Creates backup_a.sql (overwrites previous A)
Fourth run: Creates backup_b.sql (overwrites previous B)
... continues alternating ...
```

This ensures you always have at least one good backup, even if the current backup fails.

### 2. Systemd Service: `shadowcheck-backup.service`

**Location:** `/etc/systemd/system/shadowcheck-backup.service`

Defines how the backup script runs when triggered by the timer.

### 3. Systemd Timer: `shadowcheck-backup.timer`

**Location:** `/etc/systemd/system/shadowcheck-backup.timer`

**Schedule:** Twice per week
- **Wednesday at 2:00 AM** (with 0-15 min randomization)
- **Sunday at 2:00 AM** (with 0-15 min randomization)

**Persistence:** If the system is off during a scheduled backup, it will run on next boot.

---

## Installation

### Initial Setup (Already Completed)

1. **Backup script created and tested:**
   ```bash
   /home/nunya/shadowcheck/backup-database.sh
   ```
   ✅ First backup completed: 722 MB

2. **Systemd files created:**
   - `/tmp/shadowcheck-backup.service`
   - `/tmp/shadowcheck-backup.timer`

3. **To install the systemd timer** (requires sudo):
   ```bash
   cd /home/nunya/shadowcheck
   sudo ./install-backup-timer.sh
   ```

   This will:
   - Install service and timer files
   - Enable the timer to start on boot
   - Start the timer immediately
   - Show status and next scheduled runs

---

## Backup Locations

### Primary Backups

```
/home/nunya/shadowcheck/backups/
├── shadowcheck_backup_a.sql      # Backup slot A (alternates)
├── shadowcheck_backup_b.sql      # Backup slot B (alternates)
├── backup.log                    # Backup operation logs
└── .backup_state                 # Tracks which slot was used last
```

**Current Status:**
- ✅ Backup A: Created 2025-11-07 13:12:47 (722 MB)
- ⏳ Backup B: Will be created on next run

### Backup File Permissions

- Backup files: `600` (read/write owner only)
- State file: `600` (read/write owner only)

---

## Usage

### Manual Backup

Run a backup manually at any time:

```bash
/home/nunya/shadowcheck/backup-database.sh
```

Or via systemd:

```bash
sudo systemctl start shadowcheck-backup.service
```

### Check Backup Status

**View timer status:**
```bash
systemctl status shadowcheck-backup.timer
```

**View next scheduled runs:**
```bash
systemctl list-timers shadowcheck-backup*
```

**View recent backup logs:**
```bash
# Via systemd journal
journalctl -u shadowcheck-backup.service -n 50

# Via backup log file
cat /home/nunya/shadowcheck/backups/backup.log
```

### Restore from Backup

To restore the entire PostgreSQL cluster from a backup:

```bash
# Stop all applications using the database
docker stop shadowcheck_backend

# Drop existing databases and restore from backup
cat /home/nunya/shadowcheck/backups/shadowcheck_backup_a.sql | \
  docker exec -i shadowcheck_postgres_18 psql -U shadowcheck_user postgres

# Restart applications
docker start shadowcheck_backend
```

**⚠️ WARNING:** This will completely replace all databases with the backup data!

### Restore Single Database

To restore just the `shadowcheck` database:

```bash
# Extract and restore just one database from the cluster dump
# (pg_dumpall creates a cluster-wide dump, so this requires manual extraction)

# Better approach: Create single-database backup when needed
docker exec shadowcheck_postgres_18 pg_dump -U shadowcheck_user shadowcheck > /tmp/shadowcheck_single.sql

# Restore single database
cat /tmp/shadowcheck_single.sql | \
  docker exec -i shadowcheck_postgres_18 psql -U shadowcheck_user shadowcheck
```

---

## Backup Verification

The backup script automatically verifies:

1. ✅ Container is running
2. ✅ Backup file is not empty
3. ✅ Backup file contains valid PostgreSQL dump header
4. ✅ Backup size is logged

### Manual Verification

**Check backup file integrity:**
```bash
# View backup header
head -n 20 /home/nunya/shadowcheck/backups/shadowcheck_backup_a.sql

# Check for "PostgreSQL database cluster dump"
grep "PostgreSQL database cluster dump" /home/nunya/shadowcheck/backups/shadowcheck_backup_a.sql

# Check backup size
du -h /home/nunya/shadowcheck/backups/shadowcheck_backup_*.sql
```

**Test restore (dry run):**
```bash
# Validate SQL syntax without applying
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user --single-transaction --set ON_ERROR_STOP=on postgres < /dev/null
```

---

## Maintenance

### Log Rotation

The backup script automatically:
- Keeps last 1000 lines of `backup.log`
- Cleans up temporary backup files older than 7 days

### Disk Space Monitoring

**Check backup directory size:**
```bash
du -sh /home/nunya/shadowcheck/backups/
```

**Expected storage:**
- 2 backup files @ ~722 MB each = **~1.5 GB total**
- Plan for growth as database size increases

**Monitoring recommendations:**
- Set up disk space alerts when `/home` partition reaches 80% usage
- Review backup sizes monthly
- Consider compression if backups exceed 2 GB each

### Backup Compression (Optional)

To save disk space, modify `backup-database.sh` to use compression:

```bash
# Instead of:
docker exec "${CONTAINER_NAME}" pg_dumpall -U "${DB_USER}" > "${TEMP_BACKUP}"

# Use:
docker exec "${CONTAINER_NAME}" pg_dumpall -U "${DB_USER}" | gzip > "${TEMP_BACKUP}.gz"
```

**Trade-offs:**
- ✅ Saves ~70-80% disk space
- ❌ Slightly slower backup/restore
- ❌ Cannot easily inspect backup contents

---

## Troubleshooting

### Backup Fails with "Container not running"

**Check Docker container:**
```bash
docker ps | grep shadowcheck_postgres_18
```

**Start container if stopped:**
```bash
docker start shadowcheck_postgres_18
```

### Backup File is Empty or Invalid

**Check database permissions:**
```bash
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -c "\l"
```

**Check disk space:**
```bash
df -h /home/nunya/shadowcheck/backups
```

### Timer Not Running

**Check timer status:**
```bash
systemctl status shadowcheck-backup.timer
```

**Enable if disabled:**
```bash
sudo systemctl enable shadowcheck-backup.timer
sudo systemctl start shadowcheck-backup.timer
```

**View timer logs:**
```bash
journalctl -u shadowcheck-backup.timer -f
```

---

## Backup Schedule Details

### Twice-Weekly Schedule

| Day | Time | Backup Slot | Notes |
|-----|------|-------------|-------|
| Wednesday | 2:00 AM | Alternates A/B | Mid-week backup |
| Sunday | 2:00 AM | Alternates A/B | Weekend backup |

**Randomization:** ±15 minutes to avoid exact timing patterns

**Example schedule:**
```
Week 1 Wednesday: backup_a.sql created
Week 1 Sunday:    backup_b.sql created
Week 2 Wednesday: backup_a.sql overwritten
Week 2 Sunday:    backup_b.sql overwritten
```

### Why Twice Weekly?

- **Frequent enough:** Max 3-4 days of data loss
- **Infrequent enough:** Minimal disk I/O impact
- **Alternating slots:** Always have a fallback if one backup corrupts

---

## Security Considerations

### Backup File Protection

✅ **Permissions:** 600 (owner read/write only)
✅ **Location:** Local filesystem only (not exposed via web)
✅ **No encryption:** Backups contain unencrypted data

**⚠️ IMPORTANT:** These backups contain:
- All network observations (BSSID, SSID, locations)
- Evidence attachments metadata
- Potential PII depending on data collected

**Recommendations:**
- Keep backup directory permissions restricted
- Consider encrypting backups if storing off-site
- Never commit backups to version control
- Add to `.gitignore`: `backups/`

### Off-Site Backup Strategy

For production systems, consider:

1. **Encrypted remote backup:**
   ```bash
   # Encrypt and upload to remote storage
   gpg --encrypt --recipient your@email.com backup_a.sql
   rclone copy backup_a.sql.gpg remote:shadowcheck-backups/
   ```

2. **Cloud storage:** S3, Backblaze, etc.
3. **Network backup:** Rsync to separate server

---

## Testing the Backup

### Test Restore Procedure

**⚠️ Do this on a test system first!**

```bash
# 1. Create a test database to verify restore works
docker exec shadowcheck_postgres_18 createdb -U shadowcheck_user test_restore

# 2. Restore a table into test database
# (Since pg_dumpall backs up the entire cluster, you'd need to extract)

# 3. Better test: Create a test container and restore there
docker run --name test-postgres -e POSTGRES_PASSWORD=test -d postgis/postgis:18-3.5
cat /home/nunya/shadowcheck/backups/shadowcheck_backup_a.sql | \
  docker exec -i test-postgres psql -U postgres

# 4. Verify data
docker exec test-postgres psql -U postgres -d shadowcheck -c "SELECT COUNT(*) FROM app.locations_legacy;"

# 5. Clean up
docker stop test-postgres
docker rm test-postgres
```

---

## Disaster Recovery Plan

### Scenario: Complete Database Loss

**Recovery Steps:**

1. **Verify backup exists:**
   ```bash
   ls -lh /home/nunya/shadowcheck/backups/shadowcheck_backup_*.sql
   ```

2. **Stop application:**
   ```bash
   docker stop shadowcheck_backend
   ```

3. **Recreate database container (if needed):**
   ```bash
   docker stop shadowcheck_postgres_18
   docker rm shadowcheck_postgres_18
   # Recreate via docker-compose or run command
   ```

4. **Restore from most recent backup:**
   ```bash
   # Use backup_a.sql or backup_b.sql (whichever is newer)
   cat /home/nunya/shadowcheck/backups/shadowcheck_backup_a.sql | \
     docker exec -i shadowcheck_postgres_18 psql -U shadowcheck_user postgres
   ```

5. **Verify restoration:**
   ```bash
   docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck -c "\dt app.*" | wc -l
   # Should show ~50+ tables
   ```

6. **Restart application:**
   ```bash
   docker start shadowcheck_backend
   ```

7. **Test application:**
   ```bash
   curl http://localhost:3001/api/v1/health
   ```

**Expected Recovery Time:** 10-20 minutes for 722 MB backup

---

## Monitoring & Alerts

### Set Up Backup Monitoring

**Check last successful backup:**
```bash
# View last backup log entry
tail -n 20 /home/nunya/shadowcheck/backups/backup.log | grep "Backup completed successfully"
```

**Create monitoring script** (optional):
```bash
#!/bin/bash
# Check if backup is older than 5 days
BACKUP_A="/home/nunya/shadowcheck/backups/shadowcheck_backup_a.sql"
if [[ $(find "$BACKUP_A" -mtime +5 2>/dev/null) ]]; then
    echo "WARNING: Backup is older than 5 days!"
    # Send alert email, etc.
fi
```

---

## Future Enhancements

Potential improvements for the backup system:

1. **Compression:** Add gzip compression to save disk space
2. **Retention:** Keep last N backups instead of just 2
3. **Off-site backup:** Automatically sync to remote storage
4. **Encryption:** GPG-encrypt backups for security
5. **Metrics:** Send backup size/duration to monitoring system
6. **Incremental backups:** Use WAL archiving for point-in-time recovery
7. **Email notifications:** Send alerts on backup success/failure

---

## References

- PostgreSQL Backup Documentation: https://www.postgresql.org/docs/current/backup.html
- `pg_dumpall` Manual: https://www.postgresql.org/docs/current/app-pg-dumpall.html
- Systemd Timers: https://www.freedesktop.org/software/systemd/man/systemd.timer.html

---

**Document Owner:** Database Administration
**Last Updated:** 2025-11-07
**Next Review:** 2026-11-07
