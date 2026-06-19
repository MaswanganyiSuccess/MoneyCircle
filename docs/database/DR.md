# Disaster Recovery Plan

## Overview
This document outlines the disaster recovery procedures for MoneyCircle. The goal is to ensure data safety and minimal downtime in case of failures.

## Backup Strategy

### Automated Daily Backups
- **Schedule:** Daily at 2:00 AM UTC
- **Method:** `mongodump` with gzip compression
- **Storage:** AWS S3 (Standard-IA tier)
- **Retention:** 30 days (local), 90 days (S3)
- **Backup Size:** ~100MB (compressed)

### Point-in-Time Recovery
- Enabled via MongoDB Atlas M10+ cluster
- Retention: 24 hours

### Backup Verification
- Weekly automated restore test
- Quarterly manual restore drill

---

## Restore Procedures

### Option 1: Restore from Atlas Cloud Backup (M10+)
1. Go to MongoDB Atlas → Backup.
2. Select the snapshot.
3. Click "Restore" → Choose target cluster.
4. Confirm restore.

### Option 2: Restore from S3 Backup (Manual)
1. Install MongoDB tools:
   ```bash
   apt install mongodb-database-tools