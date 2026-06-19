import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILenderDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  depositDate: Date;
  paymentMethod: string;
  reference: string;
  createdAt: Date;
}

const LenderDepositSchema = new Schema<ILenderDeposit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    depositDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

LenderDepositSchema.index({ userId: 1, status: 1 });

export const LenderDeposit: Model<ILenderDeposit> = mongoose.model<ILenderDeposit>('LenderDeposit', LenderDepositSchema);