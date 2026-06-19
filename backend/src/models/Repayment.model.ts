import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepayment extends Document {
  loanId: mongoose.Types.ObjectId;
  dueAmount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  lateFee?: number;
  transactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  isOverdue(): boolean;
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
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  { timestamps: true }
);

RepaymentSchema.index({ loanId: 1, dueDate: 1 });
RepaymentSchema.index({ status: 1, dueDate: 1 });

RepaymentSchema.methods.isOverdue = function (): boolean {
  if (this.status === 'paid') return false;
  const now = new Date();
  return this.dueDate < now;
};

export const Repayment: Model<IRepayment> = mongoose.model<IRepayment>('Repayment', RepaymentSchema);