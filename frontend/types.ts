export type EventType = 
  | 'hackathon' 
  | 'meetup' 
  | 'conference' 
  | 'workshop' 
  | 'webinar' 
  | 'competition';

export type LocationType = 'online' | 'in-person' | 'hybrid';

export type EventStatus = 'pending' | 'approved' | 'rejected';
export type EventAccessType = 'open-doors' | 'close-doors';
export type UserRole = 'admin' | 'staff';

export interface ScheduleItem {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export interface IEvent {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  type: EventType;
  accessType?: EventAccessType;
  technologies: string[];
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  locationType: LocationType;
  location: string;
  onlineUrl?: string;
  organizer: string;
  organizerEmail: string;
  organizerAvatar?: string;
  website?: string;
  coverImage: string;
  participantsLimit?: number;
  currentParticipants?: number;
  status: EventStatus;
  featured: boolean;
  trending?: boolean;
  schedule?: ScheduleItem[];
  tags?: string[];
  prizePool?: string;
  registrationOpen?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status: 'active' | 'suspended';
  createdAt?: string;
}

export interface IApplication {
  _id: string;
  id?: string;
  eventId: string;
  eventTitle: string;
  eventAccessType: EventAccessType;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FilterState {
  search: string;
  type: string;
  technology: string;
  locationType: string;
  accessType: string;
  dateRange: 'all' | 'today' | 'this-week' | 'this-month' | 'upcoming';
  sortBy: 'date-asc' | 'date-desc' | 'popular' | 'trending';
  page: number;
  limit: number;
}

export interface TechnologyItem {
  name: string;
  count: number;
  category: string;
  iconName: string;
  description: string;
  color: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DbStatusInfo {
  connected: boolean;
  type: 'mongodb' | 'memory';
  clusterUriProvided: boolean;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  dbStatus?: DbStatusInfo;
  message?: string;
  error?: string;
}

export interface OrganizerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  openDoorsCount?: number;
  closeDoorsCount?: number;
  totalParticipants: number;
}

export interface AdminStats {
  totalEvents: number;
  openDoorsCount: number;
  closeDoorsCount: number;
  totalParticipants: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalStaff: number;
  activeStaff: number;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  confirmed: number;
  closeDoorsTotal: number;
}

export type Theme = 'dark' | 'light';
