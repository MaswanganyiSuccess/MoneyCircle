import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { validateSAID } from '../utils/id-validator';

export interface IUser extends Document {
  // Core identity
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idNumber: string;
  role: 'borrower' | 'lender' | 'admin';

  // Profile & KYC (basic – extended data goes to BorrowerProfile)
  avatar?: string;
  kycDocuments?: {
    idDocument?: string;
    proofOfAddress?: string;
    selfie?: string;
  };
  status: 'pending' | 'verified' | 'rejected';
  kycStatus: 'pending' | 'verified' | 'rejected';

  // Credit scoring (summary fields)
  creditGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  creditScore?: number;
  debtToIncomeRatio?: number;

  // Address (optional – can be stored here or in BorrowerProfile)
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  // Authentication
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isEmailVerified: boolean;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;

  // Soft delete
  deletedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // ---------- EXTRACTED FROM SA ID ----------
  dateOfBirth: Date;
  gender: 'Male' | 'Female';
  age: number; // convenience – can be computed on the fly

  // ---------- LINK TO BORROWER PROFILE ----------
  borrowerProfile?: mongoose.Types.ObjectId; // reference to detailed KYC

  // ---------- LOAN AGGREGATES (cached) ----------
  totalBorrowed: number;   // sum of all loan principals (approved/disbursed)
  totalRepaid: number;     // total repayments made (principal + interest)
  totalOutstanding: number;// total remaining balance (principal + interest)

  // ---------- INSTANCE METHODS ----------
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementFailedAttempts(): Promise<void>;
  resetFailedAttempts(): Promise<void>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>(
  {
    // ---------- CORE FIELDS ----------
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
      validate: {
        validator: function (value: string) {
          return validateSAID(value).isValid;
        },
        message: (props: any) => {
          const result = validateSAID(props.value);
          return result.errors.join(', ');
        },
      },
    },
    role: {
      type: String,
      enum: ['borrower', 'lender', 'admin'],
      required: true,
    },

    // ---------- BASIC KYC (files) ----------
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

    // ---------- CREDIT SUMMARY ----------
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

    // ---------- ADDRESS (optional, can be overridden in BorrowerProfile) ----------
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: 'South Africa' },
    },

    // ---------- AUTH ----------
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // ---------- SOFT DELETE ----------
    deletedAt: { type: Date },

    // ---------- NEW: EXTRACTED FROM SA ID ----------
    dateOfBirth: {
      type: Date,
      required: true, // auto‑populated
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },
    age: {
      type: Number,
      // optional – will be set by pre‑save hook
    },

    // ---------- NEW: REFERENCE TO DETAILED PROFILE ----------
    borrowerProfile: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowerProfile',
    },

    // ---------- NEW: LOAN AGGREGATES ----------
    totalBorrowed: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRepaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOutstanding: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// ---------- INDEXES ----------
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ idNumber: 1 }, { unique: true });
UserSchema.index({ creditGrade: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ refreshToken: 1 }, { sparse: true });
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });
UserSchema.index({ status: 1 });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ borrowerProfile: 1 }); // for quick joins

// ---------- SOFT DELETE MIDDLEWARE ----------
UserSchema.pre('find', function () {
  this.where({ deletedAt: null });
});
UserSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});
UserSchema.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

// ---------- ID VALIDATION & AUTO‑POPULATE HOOK ----------
UserSchema.pre('save', function (next) {
  if (this.isModified('idNumber')) {
    const result = validateSAID(this.idNumber);

    if (!result.isValid) {
      return next(new Error(`Invalid South African ID: ${result.errors.join(', ')}`));
    }

    if (result.parsed) {
      this.dateOfBirth = result.parsed.dateOfBirth;
      this.gender = result.parsed.gender;
      this.age = result.parsed.age;
    }
  }
  next();
});

// ---------- INSTANCE METHODS ----------
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