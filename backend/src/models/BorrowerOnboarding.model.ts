// backend/src/models/BorrowerOnboarding.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBorrowerOnboarding extends Document {
  userId?: mongoose.Types.ObjectId;
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
    password: string; // hashed later
    role: 'borrower' | 'lender';
  };
  banking: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
    monthlyIncome: number;
    deductions: number;
  };
  documents: {
    idFront: string;      // URL
    selfie: string;
    bankStatement: string;
    proofOfAddress: string;
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    score: number; // 0-100 match confidence
    idExtracted: {
      fullName: string;
      idNumber: string;
      photo: string; // base64 or URL
    };
    selfieMatch: boolean;
    accountMatch: boolean;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BorrowerOnboardingSchema = new Schema<IBorrowerOnboarding>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  personal: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    idNumber: { type: String, required: true },
    password: { type: String, required: true }, // will be hashed before user creation
    role: { type: String, enum: ['borrower', 'lender'], default: 'borrower' },
  },
  banking: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    branchCode: { type: String, required: true },
    monthlyIncome: { type: Number, required: true },
    deductions: { type: Number, default: 0 },
  },
  documents: {
    idFront: { type: String, required: true },
    selfie: { type: String, required: true },
    bankStatement: { type: String, required: true },
    proofOfAddress: { type: String, required: true },
  },
  verification: {
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    score: { type: Number, min: 0, max: 100 },
    idExtracted: {
      fullName: String,
      idNumber: String,
      photo: String,
    },
    selfieMatch: { type: Boolean, default: false },
    accountMatch: { type: Boolean, default: false },
    notes: String,
  },
}, { timestamps: true });

export const BorrowerOnboarding = mongoose.model<IBorrowerOnboarding>('BorrowerOnboarding', BorrowerOnboardingSchema);