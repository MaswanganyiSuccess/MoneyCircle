import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

/**
 * MongoDB connection options
 */
const options: mongoose.ConnectOptions = {
  minPoolSize: 2,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB with retry logic
 */
export const connectDB = async (): Promise<void> => {
  const uri = config.mongoUri;
  if (!uri) {
    logger.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  // Log the connection attempt (hide sensitive parts)
  const sanitizedUri = uri.replace(/\/\/.*@/, '//****:****@');
  logger.info(`📡 Connecting to MongoDB: ${sanitizedUri}`);

  let retries = 0;
  const maxRetries = 5;
  const baseDelay = 1000; // 1 second

  const attemptConnection = async (): Promise<void> => {
    try {
      await mongoose.connect(uri, options);
      logger.info('✅ MongoDB connected successfully');
    } catch (error) {
      retries++;
      if (retries <= maxRetries) {
        const delay = baseDelay * Math.pow(2, retries - 1); // exponential backoff
        logger.warn(
          `⚠️ MongoDB connection attempt ${retries}/${maxRetries} failed. ` +
          `Retrying in ${delay}ms...`
        );
        logger.error(`Error: ${(error as Error).message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptConnection();
      } else {
        logger.error(`❌ Failed to connect to MongoDB after ${maxRetries} attempts`);
        logger.error(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    }
  };

  await attemptConnection();

  // Setup connection event listeners
  mongoose.connection.on('connected', () => {
    logger.info('📡 MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected');
  });
};

/**
 * Gracefully close MongoDB connection
 */
export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed gracefully');
  } catch (error) {
    logger.error(`❌ Error closing MongoDB connection: ${(error as Error).message}`);
  }
};

export default connectDB;