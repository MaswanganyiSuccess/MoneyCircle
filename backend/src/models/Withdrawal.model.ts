import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'standard' | 'instant' | 'idle';
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  bankAccount: string;
  createdAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['standard', 'instant', 'idle'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 50,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    bankAccount: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

WithdrawalSchema.index({ userId: 1, status: 1 });

export const Withdrawal: Model<IWithdrawal> = mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);