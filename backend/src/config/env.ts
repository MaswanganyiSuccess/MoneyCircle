import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const getMongoUri = () => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.MONGODB_URI_TEST || process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle_test';
  }
  return process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle';
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: getMongoUri(),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  jwtResetExpiry: process.env.JWT_RESET_EXPIRY || '1h',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseName: process.env.DATABASE_NAME || 'moneycircle',
};