import mongoose from 'mongoose';
import { Loan } from '../models/Loan.model';
import { logger } from '../config/logger';
import { config } from '../config/env';

const expireLoans = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('🔄 Expiring loans...');

    const result = await Loan.updateMany(
      {
        status: 'pending',
        expiryDate: { $lt: new Date() },
        isFullyFunded: false,
      },
      {
        $set: { status: 'rejected' },
      }
    );

    logger.info(`✅ Expired ${result.modifiedCount} loans`);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to expire loans:', error);
    process.exit(1);
  }
};

expireLoans();