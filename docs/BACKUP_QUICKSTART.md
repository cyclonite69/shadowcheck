# Database Backup - Quick Start

## ✅ Backup System Status

**Initial backup completed:** 2025-11-07 13:12:47
- **Backup A:** 756 MB ✅
- **Backup B:** Not yet created (will be created on next run)
- **Location:** `/home/nunya/shadowcheck/backups/`

---

## 🚀 Installation (One-Time Setup)

**Install the automatic backup timer:**

```bash
cd /home/nunya/shadowcheck
sudo ./install-backup-timer.sh
```

This sets up automatic backups **twice per week** (Wednesday & Sunday at 2 AM).

---

## 📋 Common Commands

### Manual Backup (Run Anytime)
```bash
/home/nunya/shadowcheck/backup-database.sh
```

### Check Backup Status
```bash
# List backups
ls -lh /home/nunya/shadowcheck/backups/

# View backup log
cat /home/nunya/shadowcheck/backups/backup.log
```

### Check Timer Status (after installation)
```bash
# Timer status
systemctl status shadowcheck-backup.timer

# Next scheduled runs
systemctl list-timers shadowcheck-backup*

# View logs
journalctl -u shadowcheck-backup.service -n 50
```

### Restore from Backup
```bash
# Stop application
docker stop shadowcheck_backend

# Restore entire database cluster
cat /home/nunya/shadowcheck/backups/shadowcheck_backup_a.sql | \
  docker exec -i shadowcheck_postgres_18 psql -U shadowcheck_user postgres

# Restart application
docker start shadowcheck_backend
```

---

## 📁 Backup Files

| File | Purpose |
|------|---------|
| `shadowcheck_backup_a.sql` | Backup slot A (alternates) |
| `shadowcheck_backup_b.sql` | Backup slot B (alternates) |
| `backup.log` | Backup operation logs |
| `.backup_state` | Tracks which slot to use next |

**How alternating works:**
- First run → Creates `backup_a.sql`
- Second run → Creates `backup_b.sql`
- Third run → Overwrites `backup_a.sql`
- Fourth run → Overwrites `backup_b.sql`
- Continues alternating...

This ensures you always have at least one good backup!

---

## 🔧 Scripts Created

| Script | Location | Purpose |
|--------|----------|---------|
| `backup-database.sh` | `/home/nunya/shadowcheck/` | Main backup script |
| `install-backup-timer.sh` | `/home/nunya/shadowcheck/` | Install systemd timer (run with sudo) |

---

## 📖 Full Documentation

See comprehensive documentation at:
`/home/nunya/shadowcheck/docs/technical-notes/DATABASE_BACKUP_SYSTEM.md`

---

## ⏰ Schedule

**Twice per week:**
- **Wednesday at 2:00 AM** (±15 min random)
- **Sunday at 2:00 AM** (±15 min random)

**Persistent:** If system is off, backup runs on next boot.

---

## 🆘 Troubleshooting

**Backup fails?**
```bash
# Check container is running
docker ps | grep shadowcheck_postgres_18

# Check disk space
df -h /home/nunya/shadowcheck/backups

# Check permissions
ls -la /home/nunya/shadowcheck/backups/
```

**Need help?**
- View logs: `cat /home/nunya/shadowcheck/backups/backup.log`
- Test manually: `/home/nunya/shadowcheck/backup-database.sh`

---

**Created:** 2025-11-07
**Current Backup Size:** 756 MB
**Next Backup:** Slot B (when timer runs or manually executed)
