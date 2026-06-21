import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const getMongoUri = () => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.MONGODB_URI_TEST ||
           process.env.MONGODB_URI ||
           'mongodb://localhost:27017/moneycircle_test';
  }
  return process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle';
};

const getCorsOrigin = () => {
  const origin = process.env.CORS_ORIGIN || '*';
  if (origin !== '*' && origin.includes(',')) {
    return origin.split(',').map(o => o.trim());
  }
  return origin;
};

export const config = {
  // Node
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',

  // Database
  mongoUri: getMongoUri(),
  databaseName: process.env.DATABASE_NAME || 'moneycircle',

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  jwtResetExpiry: process.env.JWT_RESET_EXPIRY || '1h',

  // CORS
  corsOrigin: getCorsOrigin(),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // File uploads
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Trust proxy – enable in production or when explicitly set
  trustProxy: process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production',

  // Swagger UI
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
  swaggerPath: process.env.SWAGGER_PATH || '/api/docs',

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';
export const isTest = config.nodeEnv === 'test';

export default config;