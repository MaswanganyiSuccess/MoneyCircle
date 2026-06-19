import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'email' | 'sms' | 'push';
  title: string;
  message: string;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
  relatedEntityId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: Date,
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);