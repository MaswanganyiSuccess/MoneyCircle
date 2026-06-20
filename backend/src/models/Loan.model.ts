import mongoose, { Schema, Document, Model } from 'mongoose';
import { IInvestment } from './Investment.model';

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  lenderId?: mongoose.Types.ObjectId;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: 'pending' | 'active' | 'completed' | 'defaulted' | 'rejected';
  applicationDate: Date;
  approvalDate?: Date;
  firstRepaymentDate?: Date;
  servicingFee: number;
  purpose: string;
  loanType: 'personal' | 'secured' | 'business' | 'student';
  collateral?: Array<{ type: string; value: number }>;
  affordabilityCheckPassed: boolean;
  dtiAtApplication?: number;
  creditGradeAtApplication?: string;

  // ---- NEW INVESTMENT FIELDS ----
  fundedAmount: number;
  remainingAmount: number;
  expiryDate: Date;
  isFullyFunded: boolean;

  // Virtuals
  investors?: IInvestment[];
  repayments?: any[];

  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lenderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
      min: 5000,
      max: 500000,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    termMonths: {
      type: Number,
      required: true,
      min: 3,
      max: 84,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'defaulted', 'rejected'],
      default: 'pending',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: Date,
    firstRepaymentDate: Date,
    servicingFee: {
      type: Number,
      default: function () {
        return (this as any).amount * 0.005;
      },
    },
    purpose: {
      type: String,
      required: true,
      maxlength: 200,
    },
    loanType: {
      type: String,
      enum: ['personal', 'secured', 'business', 'student'],
      default: 'personal',
    },
    collateral: [
      {
        type: { type: String },
        value: { type: Number },
      },
    ],
    affordabilityCheckPassed: {
      type: Boolean,
      default: false,
    },
    dtiAtApplication: Number,
    creditGradeAtApplication: String,

    // ---- NEW INVESTMENT FIELDS (inside schema) ----
    fundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: function () {
        return (this as any).amount;
      },
    },
    expiryDate: {
      type: Date,
      default: function () {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
      },
    },
    isFullyFunded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes (existing + new)
LoanSchema.index({ borrowerId: 1 });
LoanSchema.index({ status: 1, createdAt: -1 });
LoanSchema.index({ interestRate: 1 });
LoanSchema.index({ amount: 1, termMonths: 1 });
LoanSchema.index({ status: 1, lenderId: 1 });
LoanSchema.index({ expiryDate: 1 });      // for cron job
LoanSchema.index({ isFullyFunded: 1 });   // for filtering

// Virtual: investors (populated on demand)
LoanSchema.virtual('investors', {
  ref: 'Investment',
  localField: '_id',
  foreignField: 'loanId',
});

// Virtual: repayments (populated on demand)
LoanSchema.virtual('repayments', {
  ref: 'Repayment',
  localField: '_id',
  foreignField: 'loanId',
});

// Ensure virtuals are included in JSON output
LoanSchema.set('toJSON', { virtuals: true });
LoanSchema.set('toObject', { virtuals: true });

export const Loan: Model<ILoan> = mongoose.model<ILoan>('Loan', LoanSchema);