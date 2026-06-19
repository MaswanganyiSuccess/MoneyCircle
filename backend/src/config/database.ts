import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => console.log('📡 MongoDB connected'));
mongoose.connection.on('error', (err) => console.error('📡 MongoDB error:', err));
mongoose.connection.on('disconnected', () => console.log('📡 MongoDB disconnected'));

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('✅ Graceful shutdown');
  process.exit(0);
});

export default connectDB;