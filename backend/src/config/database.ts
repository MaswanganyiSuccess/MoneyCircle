import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => logger.info('📡 MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('📡 MongoDB error:', err));
mongoose.connection.on('disconnected', () => logger.info('📡 MongoDB disconnected'));

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  logger.info('✅ Graceful shutdown');
  process.exit(0);
});

export default connectDB;