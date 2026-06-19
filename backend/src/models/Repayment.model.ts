import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepayment extends Document {
  loanId: mongoose.Types.ObjectId;
  dueAmount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  lateFee?: number;
  interestPortion: number;
  principalPortion: number;
  remainingBalance: number;
  transactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RepaymentSchema = new Schema<IRepayment>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    dueAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    lateFee: {
      type: Number,
      min: 0,
    },
    interestPortion: {
      type: Number,
      default: 0,
    },
    principalPortion: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  { timestamps: true }
);

RepaymentSchema.index({ loanId: 1, dueDate: 1 });
RepaymentSchema.index({ status: 1, dueDate: 1 });

export const Repayment: Model<IRepayment> = mongoose.model<IRepayment>('Repayment', RepaymentSchema);