import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idNumber: string;
  monthlyIncome?: number;  
  role: 'borrower' | 'lender' | 'admin';
  
  // Profile & KYC
  avatar?: string;
  kycDocuments?: {
    idDocument?: string;
    proofOfAddress?: string;
    selfie?: string;
  };
  status: 'pending' | 'verified' | 'rejected';
  kycStatus: 'pending' | 'verified' | 'rejected';

  // Credit
  creditGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  creditScore?: number;
  debtToIncomeRatio?: number;

  // Address
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  // Auth
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isEmailVerified: boolean;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;

  // Soft delete
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementFailedAttempts(): Promise<void>;
  resetFailedAttempts(): Promise<void>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /\S+@\S+\.\S+/,
    },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, minlength: 1, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 1, maxlength: 50 },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\+[1-9]\d{1,14}$/,
    },
    idNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{13}$/,
    },
    monthlyIncome: { type: Number, default: 0 }, 
    role: {
      type: String,
      enum: ['borrower', 'lender', 'admin'],
      required: true,
    },

    // Profile & KYC
    avatar: { type: String },
    kycDocuments: {
      idDocument: { type: String },
      proofOfAddress: { type: String },
      selfie: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    // Credit fields
    creditGrade: {
      type: String,
      enum: ['A+', 'A', 'B', 'C', 'D', 'E'],
    },
    creditScore: {
      type: Number,
      min: 0,
      max: 999,
    },
    debtToIncomeRatio: {
      type: Number,
      min: 0,
      max: 1,
    },

    // Address
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: 'South Africa' },
    },

    // Auth fields
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // Soft delete
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ idNumber: 1 }, { unique: true });
UserSchema.index({ creditGrade: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ refreshToken: 1 }, { sparse: true });
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });
UserSchema.index({ status: 1 });
UserSchema.index({ deletedAt: 1 });

// ---------- Soft Delete Middleware ----------
UserSchema.pre('find', function () {
  this.where({ deletedAt: null });
});
UserSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});
UserSchema.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

// ❌ PRE-SAVE HOOK REMOVED – Password hashing is handled by AuthService
// UserSchema.pre('save', ...) has been removed.

// ---------- Instance Methods ----------
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.incrementFailedAttempts = async function (): Promise<void> {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  await this.save();
};

UserSchema.methods.resetFailedAttempts = async function (): Promise<void> {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

UserSchema.methods.isLocked = function (): boolean {
  if (!this.lockUntil) return false;
  return this.lockUntil > new Date();
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);