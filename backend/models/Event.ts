import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  type: 'hackathon' | 'meetup' | 'conference' | 'workshop' | 'webinar' | 'competition';
  technologies: string[];
  startDate: Date;
  endDate: Date;
  locationType: 'online' | 'in-person' | 'hybrid';
  location: string;
  onlineUrl?: string;
  organizer: string;
  organizerEmail: string;
  organizerAvatar?: string;
  website?: string;
  coverImage: string;
  participantsLimit?: number;
  currentParticipants?: number;
  accessType: 'open-doors' | 'close-doors';
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  trending?: boolean;
  schedule?: Array<{
    time: string;
    title: string;
    speaker?: string;
    description?: string;
  }>;
  prizePool?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleItemSchema = new Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  speaker: { type: String },
  description: { type: String }
}, { _id: false });

const EventSchema: Schema<IEventDocument> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    longDescription: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['hackathon', 'meetup', 'conference', 'workshop', 'webinar', 'competition'],
      index: true
    },
    technologies: {
      type: [String],
      required: [true, 'At least one technology is required'],
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    locationType: {
      type: String,
      required: [true, 'Location type is required'],
      enum: ['online', 'in-person', 'hybrid'],
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location or platform description is required'],
      trim: true
    },
    onlineUrl: {
      type: String,
      trim: true
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true
    },
    organizerEmail: {
      type: String,
      required: [true, 'Organizer contact email is required'],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    organizerAvatar: {
      type: String
    },
    website: {
      type: String,
      trim: true
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required']
    },
    participantsLimit: {
      type: Number,
      default: 500
    },
    currentParticipants: {
      type: Number,
      default: 0
    },
    accessType: {
      type: String,
      enum: ['open-doors', 'close-doors'],
      default: 'open-doors',
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    trending: {
      type: Boolean,
      default: false,
      index: true
    },
    schedule: [ScheduleItemSchema],
    prizePool: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying
EventSchema.index(
  {
    title: 'text',
    description: 'text',
    organizer: 'text',
    location: 'text'
  },
  {
    weights: {
      title: 10,
      technologies: 5,
      description: 3,
      organizer: 2,
      location: 1
    },
    name: 'EventTextIndex'
  }
);

EventSchema.index({ status: 1, startDate: 1 });
EventSchema.index({ status: 1, featured: 1 });
EventSchema.index({ status: 1, type: 1 });
EventSchema.index({ status: 1, locationType: 1 });
EventSchema.index({ technologies: 1, status: 1 });

// Helper to generate slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

EventSchema.pre('save', function () {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title) + '-' + Math.random().toString(36).substring(2, 7);
  }
});

export const EventModel: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>('Event', EventSchema);
