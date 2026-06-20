import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILenderBalance extends Document {
  lenderId: mongoose.Types.ObjectId;
  availableBalance: number;
  investedAmount: number;
  totalReturns: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LenderBalanceSchema = new Schema<ILenderBalance>(
  {
    lenderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    investedAmount: {
      type: Number,
      default: 0,
    },
    totalReturns: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

LenderBalanceSchema.index({ lenderId: 1 });

export const LenderBalance: Model<ILenderBalance> = mongoose.model<ILenderBalance>('LenderBalance', LenderBalanceSchema);