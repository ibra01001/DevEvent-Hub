import mongoose, { Document, Schema, Model } from 'mongoose';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'confirmed';

export interface IApplicationDocument extends Document {
  eventId: string;
  eventTitle: string;
  eventAccessType: 'open-doors' | 'close-doors';
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema<IApplicationDocument> = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      index: true
    },
    eventTitle: {
      type: String,
      required: true
    },
    eventAccessType: {
      type: String,
      enum: ['open-doors', 'close-doors'],
      required: true,
      default: 'open-doors'
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'confirmed'],
      default: 'pending',
      index: true
    },
    reviewedBy: {
      type: String
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const ApplicationModel: Model<IApplicationDocument> =
  mongoose.models.Application || mongoose.model<IApplicationDocument>('Application', ApplicationSchema);
