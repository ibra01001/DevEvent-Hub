import mongoose from 'mongoose';
import { EventModel, slugify } from './models/Event.ts';
import { UserModel } from './models/User.ts';
import { ApplicationModel } from './models/Application.ts';
import { deleteCloudinaryResourceByUrl, isCloudinaryUrl } from './utils/cloudinary.ts';

let isConnected = false;

export interface DbStatusInfo {
  connected: boolean;
  type: 'mongodb' | 'memory';
  clusterUriProvided: boolean;
  message: string;
}

let dbStatus: DbStatusInfo = {
  connected: false,
  type: 'mongodb',
  clusterUriProvided: false,
  message: 'Waiting for MongoDB connection.'
};

async function ensureDefaultUsers() {
  const defaultUsers = [
    {
      name: process.env.DEFAULT_ADMIN_NAME?.trim() || 'Mohamed Remili Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase(),
      password: process.env.DEFAULT_ADMIN_PASSWORD?.trim(),
      role: 'admin' as const,
      department: process.env.DEFAULT_ADMIN_DEPARTMENT?.trim() || 'Platform Administration'
    },
    {
      name: process.env.DEFAULT_STAFF_NAME?.trim() || 'Mohamed Remili Staff',
      email: process.env.DEFAULT_STAFF_EMAIL?.trim().toLowerCase(),
      password: process.env.DEFAULT_STAFF_PASSWORD?.trim(),
      role: 'staff' as const,
      department: process.env.DEFAULT_STAFF_DEPARTMENT?.trim() || 'Technical Events'
    }
  ];

  for (const defaultUser of defaultUsers) {
    if (!defaultUser.name || !defaultUser.email || !defaultUser.password) {
      console.log(`[DevEvent Hub] Skipping default ${defaultUser.role} user: missing env values.`);
      continue;
    }

    const existing = await UserModel.findOne({ email: defaultUser.email });
    if (existing) {
      console.log(`[DevEvent Hub] Default ${defaultUser.role} user already exists.`);
      continue;
    }

    await UserModel.create({
      name: defaultUser.name,
      email: defaultUser.email,
      password: defaultUser.password,
      role: defaultUser.role,
      department: defaultUser.department,
      status: 'active'
    });

    console.log(`[DevEvent Hub] Created default ${defaultUser.role} user.`);
  }
}

export async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    dbStatus = {
      connected: false,
      type: 'mongodb',
      clusterUriProvided: false,
      message: 'MONGODB_URI is required. Set it in backend/.env.'
    };
    throw new Error('MONGODB_URI is required. Set it in backend/.env before starting the API.');
  }

  dbStatus.clusterUriProvided = true;

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
    }

    isConnected = true;
    dbStatus = {
      connected: true,
      type: 'mongodb',
      clusterUriProvided: true,
      message: 'Connected to MongoDB Atlas cluster.'
    };

    console.log('[DevEvent Hub] Successfully connected to MongoDB Atlas.');
    await ensureDefaultUsers();
    return true;
  } catch (error: any) {
    isConnected = false;
    dbStatus = {
      connected: false,
      type: 'mongodb',
      clusterUriProvided: true,
      message: 'MongoDB connection failed. Check MONGODB_URI and MongoDB Atlas network access.'
    };

    console.error('[DevEvent Hub] MongoDB connection failed:', error?.message || error);
    throw new Error('MongoDB connection failed. Check the connection string and Atlas whitelist.');
  }
}

export const EventRepository = {
  isMongoActive() {
    return isConnected && mongoose.connection.readyState === 1;
  },

  getDbStatus(): DbStatusInfo {
    return dbStatus;
  },

  async getEvents(query: {
    search?: string;
    type?: string;
    technology?: string;
    locationType?: string;
    accessType?: string;
    from?: string;
    to?: string;
    status?: string;
    featured?: string;
    trending?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    if (!this.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    } else if (!query.status) {
      filter.status = 'approved';
    }

    if (query.type && query.type !== 'all') filter.type = query.type;
    if (query.technology && query.technology !== 'all') filter.technologies = { $regex: new RegExp(query.technology, 'i') };
    if (query.locationType && query.locationType !== 'all') filter.locationType = query.locationType;
    if (query.accessType && query.accessType !== 'all') filter.accessType = query.accessType;
    if (query.featured === 'true') filter.featured = true;
    if (query.trending === 'true') filter.trending = true;

    if (query.from || query.to) {
      filter.startDate = {};
      if (query.from) filter.startDate.$gte = new Date(query.from);
      if (query.to) filter.startDate.$lte = new Date(query.to);
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      filter.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { organizer: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { technologies: { $in: [new RegExp(s, 'i')] } }
      ];
    }

    let sort: any = { startDate: 1 };
    if (query.sortBy === 'date-desc') sort = { startDate: -1 };
    if (query.sortBy === 'popular') sort = { currentParticipants: -1 };
    if (query.sortBy === 'trending') sort = { trending: -1, startDate: 1 };

    const [events, total] = await Promise.all([
      EventModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      EventModel.countDocuments(filter)
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  async getEventByIdOrSlug(idOrSlug: string) {
    if (!this.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    return EventModel.findOne({
      $or: [{ _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null }, { slug: idOrSlug }]
    }).lean();
  },

  async createEvent(eventData: any) {
    if (!this.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const slug = slugify(eventData.title) + '-' + Math.random().toString(36).substring(2, 7);
    const accessType = eventData.accessType === 'close-doors' ? 'close-doors' : 'open-doors';

    const newDoc = {
      ...eventData,
      slug,
      accessType,
      currentParticipants: Number(eventData.currentParticipants || 0),
      status: eventData.status || 'approved',
      featured: Boolean(eventData.featured),
      trending: Boolean(eventData.trending)
    };

    const created = await EventModel.create(newDoc);
    return created.toObject();
  },

  async updateEvent(id: string, updates: any) {
    if (!this.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const existing = await EventModel.findById(id).lean();
    const nextCoverImage = updates?.coverImage;

    if (existing && nextCoverImage && existing.coverImage && existing.coverImage !== nextCoverImage && isCloudinaryUrl(existing.coverImage)) {
      await deleteCloudinaryResourceByUrl(existing.coverImage);
    }

    return EventModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  },

  async setStatus(id: string, status: 'approved' | 'rejected') {
    return this.updateEvent(id, { status });
  },

  async deleteEvent(id: string) {
    if (!this.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const event = await EventModel.findById(id);
    if (!event) {
      return null;
    }

    if (event.coverImage && isCloudinaryUrl(event.coverImage)) {
      await deleteCloudinaryResourceByUrl(event.coverImage).catch(() => undefined);
    }

    await EventModel.deleteOne({ _id: id });
    return event.toObject();
  },

  async getTechnologies() {
    if (!this.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const items = await EventModel.aggregate([
      { $match: { status: 'approved' } },
      { $unwind: '$technologies' },
      { $group: { _id: '$technologies', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]);

    return items.map((item: any) => ({
      name: item._id,
      count: item.count,
      category: 'Technology',
      iconName: 'code',
      description: 'Curated developer tech stack',
      color: '#8b5cf6'
    }));
  },

  async getOrganizerStats() {
    if (!this.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const [total, pending, approved, rejected, openDoorsCount, closeDoorsCount, totalParticipants] = await Promise.all([
      EventModel.countDocuments(),
      EventModel.countDocuments({ status: 'pending' }),
      EventModel.countDocuments({ status: 'approved' }),
      EventModel.countDocuments({ status: 'rejected' }),
      EventModel.countDocuments({ accessType: 'open-doors' }),
      EventModel.countDocuments({ accessType: 'close-doors' }),
      EventModel.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, totalParticipants: { $sum: '$currentParticipants' } } }
      ])
    ]);

    const aggregateTotal = totalParticipants[0]?.totalParticipants || 0;

    return {
      total,
      pending,
      approved,
      rejected,
      openDoorsCount,
      closeDoorsCount,
      totalParticipants: aggregateTotal
    };
  }
};

export const UserRepository = {
  async getUsers() {
    if (!EventRepository.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    return UserModel.find({}, '-password').sort({ createdAt: -1 }).lean();
  },

  async getUserByEmail(email: string) {
    if (!EventRepository.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    return UserModel.findOne({ email: cleanEmail }).lean();
  },

  async getUserById(id: string) {
    if (!EventRepository.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    return UserModel.findById(id).select('-password').lean();
  },

  async createStaff(userData: { name: string; email: string; password: string; department?: string; role?: string }) {
    if (userData.role && userData.role !== 'staff') {
      throw new Error('Admin cannot create another admin role. Only Staff accounts can be created.');
    }

    const cleanEmail = (userData.email || '').toLowerCase().trim();
    if (!userData.name?.trim() || !cleanEmail || !userData.password) {
      throw new Error('Name, valid email, and password are required to create staff.');
    }

    const existing = await this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const doc = await UserModel.create({
      name: userData.name.trim(),
      email: cleanEmail,
      password: userData.password,
      role: 'staff',
      department: userData.department?.trim() || 'Technical Events & Hackathons',
      status: 'active'
    });

    const obj = doc.toObject();
    delete obj.password;
    return obj;
  },

  async toggleStaffStatus(id: string) {
    const user = await UserModel.findById(id);
    if (!user) return null;
    if (user.role === 'admin') {
      throw new Error('Cannot modify Super Admin status.');
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    const obj = user.toObject();
    delete obj.password;
    return obj;
  },

  async deleteStaff(id: string) {
    const user = await UserModel.findById(id);
    if (!user) return false;
    if (user.role === 'admin') {
      throw new Error('Cannot delete Super Admin account.');
    }

    await UserModel.findByIdAndDelete(id);
    return true;
  }
};

export const ApplicationRepository = {
  async getApplications(query: {
    eventId?: string;
    status?: string;
    search?: string;
    eventAccessType?: string;
  } = {}) {
    if (!EventRepository.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const filter: any = {};
    if (query.eventId && query.eventId !== 'all') filter.eventId = query.eventId;
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.eventAccessType && query.eventAccessType !== 'all') filter.eventAccessType = query.eventAccessType;

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      filter.$or = [
        { fullName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { eventTitle: { $regex: s, $options: 'i' } }
      ];
    }

    return ApplicationModel.find(filter).sort({ createdAt: -1 }).lean();
  },

  async getApplicationById(id: string) {
    if (!EventRepository.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    return ApplicationModel.findById(id).lean();
  },

  async createApplication(data: {
    eventId: string;
    fullName: string;
    email: string;
    phone: string;
    notes?: string;
  }) {
    if (!data.fullName?.trim() || !data.email?.trim() || !data.phone?.trim()) {
      throw new Error('Full Name, Email, and Phone Number are required.');
    }

    const event = await EventRepository.getEventByIdOrSlug(data.eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    const isCloseDoors = event.accessType === 'close-doors';
    const status = isCloseDoors ? 'pending' : 'confirmed';

    const created = await ApplicationModel.create({
      eventId: String(event._id || event.id),
      eventTitle: event.title,
      eventAccessType: event.accessType || 'open-doors',
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      notes: data.notes?.trim() || '',
      status
    });

    if (!isCloseDoors) {
      await EventModel.findByIdAndUpdate(event._id, { $inc: { currentParticipants: 1 } });
    }

    return created.toObject();
  },

  async reviewApplication(id: string, decision: 'accepted' | 'rejected', reviewerName: string = 'Staff Member') {
    if (decision !== 'accepted' && decision !== 'rejected') {
      throw new Error('Decision must be either accepted or rejected.');
    }

    const app = await ApplicationModel.findById(id);
    if (!app) throw new Error('Application not found.');

    const previousStatus = app.status;
    app.status = decision;
    app.reviewedBy = reviewerName;
    app.reviewedAt = new Date();
    await app.save();

    if (decision === 'accepted' && previousStatus !== 'accepted') {
      await EventModel.findByIdAndUpdate(app.eventId, { $inc: { currentParticipants: 1 } });
    }

    return app.toObject();
  },

  async getApplicationStats() {
    if (!EventRepository.isMongoActive()) {
      throw new Error('MongoDB is not connected.');
    }

    const [total, pending, accepted, rejected, confirmed, closeDoorsTotal] = await Promise.all([
      ApplicationModel.countDocuments(),
      ApplicationModel.countDocuments({ status: 'pending' }),
      ApplicationModel.countDocuments({ status: 'accepted' }),
      ApplicationModel.countDocuments({ status: 'rejected' }),
      ApplicationModel.countDocuments({ status: 'confirmed' }),
      ApplicationModel.countDocuments({ eventAccessType: 'close-doors' })
    ]);

    return {
      total,
      pending,
      accepted,
      rejected,
      confirmed,
      closeDoorsTotal
    };
  }
};

