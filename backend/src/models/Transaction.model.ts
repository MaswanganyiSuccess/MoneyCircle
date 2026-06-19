import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'repayment' | 'servicing_fee' | 'dispute_hold';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  reference: string;
  transactionDate: Date;
  relatedEntityId?: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'loan_disbursement', 'repayment', 'servicing_fee', 'dispute_hold'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'ZAR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      required: true,
      default: 'pending',
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
    description: {
      type: String,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ reference: 1 }, { unique: true });

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', TransactionSchema);