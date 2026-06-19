import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  lenderId?: mongoose.Types.ObjectId;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  applicationDate: Date;
  approvalDate?: Date;
  firstRepaymentDate?: Date;
  servicingFee: number;
  purpose?: string;
  collateral?: Array<{ type: string; value: number }>;
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
      min: 100,
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
      min: 1,
      max: 60,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'defaulted'],
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
      maxlength: 200,
    },
    collateral: [
      {
        type: { type: String },
        value: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

LoanSchema.index({ borrowerId: 1 });
LoanSchema.index({ status: 1, createdAt: -1 });
LoanSchema.index({ interestRate: 1 });
LoanSchema.index({ amount: 1, term: 1 });

LoanSchema.virtual('remainingBalance').get(function () {
  return 0;
});

export const Loan: Model<ILoan> = mongoose.model<ILoan>('Loan', LoanSchema);