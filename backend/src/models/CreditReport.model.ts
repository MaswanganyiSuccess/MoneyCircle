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
  // --- Scoring fields ---
  bankStatementUploaded: boolean;
  employmentMonths: number;
  onTimePayments: number;
  earlySettlements: number;
  creditUtilization: number;
  recentHardInquiries: number;
  hasDefaultsOrJudgments: boolean;
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
    // --- Scoring fields ---
    bankStatementUploaded: { type: Boolean, default: false },
    employmentMonths: { type: Number, default: 0 },
    onTimePayments: { type: Number, default: 0 },
    earlySettlements: { type: Number, default: 0 },
    creditUtilization: { type: Number, default: 0 },
    recentHardInquiries: { type: Number, default: 0 },
    hasDefaultsOrJudgments: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CreditReportSchema.index({ userId: 1, pulledDate: -1 });

export const CreditReport: Model<ICreditReport> = mongoose.model<ICreditReport>('CreditReport', CreditReportSchema);