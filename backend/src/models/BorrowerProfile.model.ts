import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBorrowerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  employment: {
    employerName: string;
    employerAddress: string;
    employerContact: string; // phone or email
    employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired';
  };
  monthlyIncome: number; // gross
  deductions: number; // total deductions (tax, pension, etc.)
  netIncome: number; // monthlyIncome - deductions (computed)
  dependents: number; // number of children/dependents
  monthlyExpenses: number; // total monthly living expenses (food, rent, etc.)
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    sameAsId: boolean; // does this match the ID's address?
  };
  banking: {
    bankName: string;
    accountNumber: string; // encrypted in production
    branchCode: string;
    accountType: 'current' | 'savings' | 'cheque' | 'investment';
    proofOfBanking?: string; // file URL (e.g., bank letter)
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents: {
    idCopy: string; // file URL
    bankStatements: string[]; // array of file URLs (6 months)
    proofOfAddress: string; // file URL
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowerProfileSchema = new Schema<IBorrowerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employment: {
      employerName: { type: String, required: true },
      employerAddress: { type: String, required: true },
      employerContact: { type: String, required: true },
      employmentStatus: {
        type: String,
        enum: ['employed', 'self-employed', 'unemployed', 'student', 'retired'],
        required: true,
      },
    },
    monthlyIncome: { type: Number, required: true, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netIncome: { type: Number, required: true, min: 0 }, // will be computed
    dependents: { type: Number, default: 0, min: 0 },
    monthlyExpenses: { type: Number, default: 0, min: 0 },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'South Africa' },
      sameAsId: { type: Boolean, default: false },
    },
    banking: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      branchCode: { type: String, required: true },
      accountType: {
        type: String,
        enum: ['current', 'savings', 'cheque', 'investment'],
        required: true,
      },
      proofOfBanking: { type: String },
    },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    documents: {
      idCopy: { type: String, required: true },
      bankStatements: { type: [String], default: [] },
      proofOfAddress: { type: String, required: true },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNotes: { type: String },
  },
  { timestamps: true }
);

// Indexes
BorrowerProfileSchema.index({ userId: 1 }, { unique: true });
BorrowerProfileSchema.index({ verificationStatus: 1 });

export const BorrowerProfile: Model<IBorrowerProfile> = mongoose.model<IBorrowerProfile>(
  'BorrowerProfile',
  BorrowerProfileSchema
);