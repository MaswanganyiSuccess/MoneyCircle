import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BACKUP_DIR = path.join(__dirname, '../../backups');
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'moneycircle-backups';

interface RestoreOptions {
  backupFile?: string; // Local backup file path
  s3Key?: string; // S3 backup key
  timestamp?: string; // Restore to specific timestamp (Point-in-time)
  dropExisting?: boolean;
}

const downloadFromS3 = async (s3Key: string, localPath: string): Promise<void> => {
  const params = {
    Bucket: S3_BUCKET,
    Key: s3Key,
  };

  console.log(`📥 Downloading from S3: ${s3Key}`);
  const file = fs.createWriteStream(localPath);

  try {
    const stream = s3.getObject(params).createReadStream();
    await new Promise((resolve, reject) => {
      stream.pipe(file);
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    console.log(`✅ Downloaded to: ${localPath}`);
  } catch (error) {
    console.error('❌ S3 download failed:', error);
    throw error;
  }
};

const listS3Backups = async (): Promise<string[]> => {
  const params = {
    Bucket: S3_BUCKET,
    Prefix: 'backups/',
  };

  try {
    const result = await s3.listObjectsV2(params).promise();
    const keys = result.Contents?.map((item) => item.Key!) || [];
    console.log(`📋 Found ${keys.length} backups in S3`);
    return keys;
  } catch (error) {
    console.error('❌ Failed to list S3 backups:', error);
    return [];
  }
};

const restoreBackup = async (options: RestoreOptions): Promise<void> => {
  console.log('🔄 Starting restore process...');

  try {
    let backupPath: string;

    if (options.backupFile && fs.existsSync(options.backupFile)) {
      // Use local backup
      backupPath = options.backupFile;
      console.log(`📂 Using local backup: ${backupPath}`);
    } else if (options.s3Key) {
      // Download from S3
      const localPath = path.join(BACKUP_DIR, path.basename(options.s3Key));
      await downloadFromS3(options.s3Key, localPath);
      backupPath = localPath;
    } else {
      // Auto-detect latest backup
      const backups = await listS3Backups();
      if (backups.length === 0) {
        throw new Error('No backups found in S3');
      }
      const latest = backups.sort().pop()!;
      const localPath = path.join(BACKUP_DIR, path.basename(latest));
      await downloadFromS3(latest, localPath);
      backupPath = localPath;
    }

    // Drop existing collections if requested
    if (options.dropExisting) {
      console.log('🗑️ Dropping existing collections...');
      // TODO: Implement drop logic using mongoose
    }

    // Restore the backup
    console.log(`♻️ Restoring from: ${backupPath}`);
    const cmd = `mongorestore --uri="${MONGODB_URI}" --archive="${backupPath}" --gzip`;

    try {
      await execAsync(cmd);
      console.log('✅ Restore completed successfully!');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: RestoreOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        options.backupFile = args[++i];
        break;
      case '--s3':
        options.s3Key = args[++i];
        break;
      case '--drop':
        options.dropExisting = true;
        break;
    }
  }

  restoreBackup(options);
}

export { restoreBackup, listS3Backups };