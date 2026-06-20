import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvestment extends Document {
  loanId: mongoose.Types.ObjectId;
  lenderId: mongoose.Types.ObjectId;
  amount: number;
  interestRate: number;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  fundedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    lenderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'defaulted'],
      default: 'pending',
    },
    fundedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
InvestmentSchema.index({ loanId: 1 });
InvestmentSchema.index({ lenderId: 1 });
InvestmentSchema.index({ status: 1 });

export const Investment: Model<IInvestment> = mongoose.model<IInvestment>('Investment', InvestmentSchema);