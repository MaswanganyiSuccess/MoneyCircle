import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDispute extends Document {
  userId: mongoose.Types.ObjectId;
  loanId: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  filedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  evidenceUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open',
    },
    filedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: Date,
    resolution: {
      type: String,
      maxlength: 500,
    },
    evidenceUrls: [String],
  },
  { timestamps: true }
);

DisputeSchema.index({ loanId: 1, status: 1 });

export const Dispute: Model<IDispute> = mongoose.model<IDispute>('Dispute', DisputeSchema);