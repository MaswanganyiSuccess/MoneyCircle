import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICreditReport extends Document {
  userId: mongoose.Types.ObjectId;
  pulledDate: Date;
  transUnionScore: number;
  numberOfAccounts: number;
  outstandingDebt: number;
  paymentHistoryPercent: number;
  creditGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  rawData?: any;
  createdAt: Date;
}

const CreditReportSchema = new Schema<ICreditReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pulledDate: {
      type: Date,
      default: Date.now,
    },
    transUnionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 999,
    },
    numberOfAccounts: {
      type: Number,
      required: true,
      min: 0,
    },
    outstandingDebt: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentHistoryPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    creditGrade: {
      type: String,
      enum: ['A+', 'A', 'B', 'C', 'D', 'E'],
      required: true,
    },
    rawData: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

CreditReportSchema.index({ userId: 1, pulledDate: -1 });

export const CreditReport: Model<ICreditReport> = mongoose.model<ICreditReport>('CreditReport', CreditReportSchema);