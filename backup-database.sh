#!/bin/bash
#
# Database Backup Script - ShadowCheck PostgreSQL
# Backs up entire PostgreSQL cluster (all databases)
# Alternates between two backup files (backup_a.sql and backup_b.sql)
#
# Usage: ./backup-database.sh
# Scheduled: Twice weekly via systemd timer

set -euo pipefail

# Configuration
BACKUP_DIR="/home/nunya/shadowcheck/backups"
CONTAINER_NAME="shadowcheck_postgres_18"
DB_USER="shadowcheck_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup.log"

# Backup file names (alternating)
BACKUP_A="${BACKUP_DIR}/shadowcheck_backup_a.sql"
BACKUP_B="${BACKUP_DIR}/shadowcheck_backup_b.sql"
STATE_FILE="${BACKUP_DIR}/.backup_state"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

log "========================================="
log "Starting database backup"
log "========================================="

# Determine which backup file to use (alternate between A and B)
if [[ -f "${STATE_FILE}" ]]; then
    LAST_BACKUP=$(cat "${STATE_FILE}")
    if [[ "${LAST_BACKUP}" == "A" ]]; then
        CURRENT_BACKUP="${BACKUP_B}"
        BACKUP_LABEL="B"
    else
        CURRENT_BACKUP="${BACKUP_A}"
        BACKUP_LABEL="A"
    fi
else
    # First run - use backup A
    CURRENT_BACKUP="${BACKUP_A}"
    BACKUP_LABEL="A"
fi

log "Backup target: ${CURRENT_BACKUP} (slot ${BACKUP_LABEL})"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log "ERROR: Container ${CONTAINER_NAME} is not running"
    exit 1
fi

log "Container ${CONTAINER_NAME} is running"

# Create temporary backup file with timestamp
TEMP_BACKUP="${BACKUP_DIR}/shadowcheck_backup_${TIMESTAMP}.sql"

log "Creating backup to temporary file: ${TEMP_BACKUP}"

# Perform the backup (all databases in the cluster)
if docker exec "${CONTAINER_NAME}" pg_dumpall -U "${DB_USER}" > "${TEMP_BACKUP}"; then
    BACKUP_SIZE=$(du -h "${TEMP_BACKUP}" | cut -f1)
    log "Backup created successfully: ${BACKUP_SIZE}"

    # Verify backup is not empty
    if [[ ! -s "${TEMP_BACKUP}" ]]; then
        log "ERROR: Backup file is empty"
        rm -f "${TEMP_BACKUP}"
        exit 1
    fi

    # Verify backup contains expected header
    if ! head -n 5 "${TEMP_BACKUP}" | grep -q "PostgreSQL database cluster dump"; then
        log "ERROR: Backup file does not appear to be a valid PostgreSQL dump"
        rm -f "${TEMP_BACKUP}"
        exit 1
    fi

    log "Backup verification passed"

    # Move temporary backup to the target slot (overwriting previous)
    log "Moving backup to ${CURRENT_BACKUP}"
    mv "${TEMP_BACKUP}" "${CURRENT_BACKUP}"

    # Update state file to track which backup was used
    echo "${BACKUP_LABEL}" > "${STATE_FILE}"

    # Set permissions
    chmod 600 "${CURRENT_BACKUP}"
    chmod 600 "${STATE_FILE}"

    log "Backup completed successfully"
    log "Next backup will use slot $([ "${BACKUP_LABEL}" == "A" ] && echo "B" || echo "A")"

    # Log backup info
    FINAL_SIZE=$(du -h "${CURRENT_BACKUP}" | cut -f1)
    log "Final backup size: ${FINAL_SIZE}"
    log "Backup location: ${CURRENT_BACKUP}"

else
    log "ERROR: Backup failed"
    rm -f "${TEMP_BACKUP}"
    exit 1
fi

# Clean up old temporary backups (keep logs, remove temp .sql files older than 7 days)
log "Cleaning up old temporary backup files..."
find "${BACKUP_DIR}" -name "shadowcheck_backup_*.sql" -type f -mtime +7 -delete 2>/dev/null || true

# Rotate log file if it gets too large (keep last 1000 lines)
if [[ -f "${LOG_FILE}" ]] && [[ $(wc -l < "${LOG_FILE}") -gt 1000 ]]; then
    log "Rotating log file..."
    tail -n 1000 "${LOG_FILE}" > "${LOG_FILE}.tmp"
    mv "${LOG_FILE}.tmp" "${LOG_FILE}"
fi

log "========================================="
log "Backup completed at $(date)"
log "========================================="

exit 0
