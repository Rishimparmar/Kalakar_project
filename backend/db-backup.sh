#!/bin/bash

# Configuration
DB_FILE="database.sqlite"
BACKUP_DIR="./backups"
GCS_BUCKET="gs://your-kalaakar-backups-bucket"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sqlite"
TAR_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

echo "Starting SQLite database backup..."

# Create backups directory if not exists
mkdir -p "$BACKUP_DIR"

# Safely backup the SQLite database using the sqlite3 CLI .backup command.
# This ensures we get a consistent snapshot even if the database is actively being written to.
if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"
else
    echo "Warning: sqlite3 CLI not found. Falling back to hot copy (risks inconsistency if writes occur)."
    cp "$DB_FILE" "$BACKUP_FILE"
fi

# Compress the backup file to save space
tar -czf "$TAR_FILE" -C "$BACKUP_DIR" "backup_$TIMESTAMP.sqlite"
rm "$BACKUP_FILE"

echo "Backup created: $TAR_FILE"

# Upload to Google Cloud Storage bucket
if command -v gcloud >/dev/null 2>&1; then
    gcloud storage cp "$TAR_FILE" "$GCS_BUCKET/"
    echo "Backup uploaded successfully to GCS."
elif command -v gsutil >/dev/null 2>&1; then
    gsutil cp "$TAR_FILE" "$GCS_BUCKET/"
    echo "Backup uploaded successfully to GCS via gsutil."
else
    echo "Error: gcloud/gsutil CLI not found. Local backup saved, but failed to upload to Google Cloud Storage."
fi

# Cleanup old backups locally (keep last 7 days)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -exec rm {} \;
echo "Cleanup of local backups older than 7 days completed."
