import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle';
const BACKUP_DIR = path.join(__dirname, '../../backups');

const ensureBackupDir = (): void => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

const getBackupFileName = (): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `backup-moneycircle-${timestamp}.archive`;
};

const createBackup = async (): Promise<string> => {
  ensureBackupDir();
  const backupName = getBackupFileName();
  const backupPath = path.join(BACKUP_DIR, backupName);

  console.log(`🔄 Creating local backup: ${backupName}`);

  // ✅ Hardcoded path to mongodump.exe
  const mongodumpPath = `"C:\\Users\\27760\\Downloads\\mongodb-database-tools-windows-x86_64-100.17.0\\mongodb-database-tools-windows-x86_64-100.17.0\\bin\\mongodump.exe"`;
  const cmd = `${mongodumpPath} --uri="${MONGODB_URI}" --archive="${backupPath}" --gzip`;

  try {
    await execAsync(cmd);
    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
};

const cleanupOldBackups = (keepDays: number = 7): void => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - keepDays);

  console.log(`🧹 Cleaning up backups older than ${keepDays} days...`);

  if (!fs.existsSync(BACKUP_DIR)) return;

  const files = fs.readdirSync(BACKUP_DIR);
  for (const file of files) {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    if (stats.mtime < cutoff) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Removed old backup: ${file}`);
    }
  }
};

const runLocalBackup = async (): Promise<void> => {
  console.log('🚀 Starting local backup process...');
  const startTime = Date.now();

  try {
    await createBackup();
    cleanupOldBackups(7);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Backup completed in ${duration}s`);
    console.log(`📁 Backup location: ${BACKUP_DIR}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runLocalBackup();
}

export { runLocalBackup, createBackup };