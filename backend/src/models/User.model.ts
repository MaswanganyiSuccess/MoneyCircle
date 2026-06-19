import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idNumber: string;
  role: 'borrower' | 'lender';
  kycStatus: 'pending' | 'verified' | 'rejected';
  creditGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  creditScore?: number;
  debtToIncomeRatio?: number;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
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
    role: {
      type: String,
      enum: ['borrower', 'lender'],
      required: true,
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
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
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: 'South Africa' },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ idNumber: 1 }, { unique: true });
UserSchema.index({ creditGrade: 1 });
UserSchema.index({ role: 1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);