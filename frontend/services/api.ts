import { ApiResponse, IEvent, OrganizerStats, TechnologyItem, DbStatusInfo, IUser, IApplication, AdminStats, ApplicationStats } from '../types.ts';

const API_BASE: string = (import.meta.env && import.meta.env.VITE_API_BASE) ? String(import.meta.env.VITE_API_BASE) : '/api';

export const eventApi = {
  async getEvents(params: {
    search?: string;
    type?: string;
    technology?: string;
    locationType?: string;
    accessType?: string;
    from?: string;
    to?: string;
    status?: string;
    featured?: boolean;
    trending?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}): Promise<ApiResponse<IEvent[]>> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.technology && params.technology !== 'all') query.set('technology', params.technology);
    if (params.locationType && params.locationType !== 'all') query.set('locationType', params.locationType);
    if (params.accessType && params.accessType !== 'all') query.set('accessType', params.accessType);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.status) query.set('status', params.status);
    if (params.featured !== undefined) query.set('featured', String(params.featured));
    if (params.trending !== undefined) query.set('trending', String(params.trending));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }
    return res.json();
  },

  async getFeaturedEvents(): Promise<ApiResponse<IEvent[]>> {
    const res = await fetch(`${API_BASE}/events/featured`);
    if (!res.ok) throw new Error('Failed to fetch featured events');
    return res.json();
  },

  async getTrendingEvents(): Promise<ApiResponse<IEvent[]>> {
    const res = await fetch(`${API_BASE}/events/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending events');
    return res.json();
  },

  async searchEvents(searchTerm: string): Promise<ApiResponse<IEvent[]>> {
    const res = await fetch(`${API_BASE}/events/search?q=${encodeURIComponent(searchTerm)}`);
    if (!res.ok) throw new Error('Search request failed');
    return res.json();
  },

  async getEventById(idOrSlug: string): Promise<ApiResponse<IEvent>> {
    const res = await fetch(`${API_BASE}/events/${encodeURIComponent(idOrSlug)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error('Failed to load event details');
    }
    return res.json();
  },

  async createEvent(data: Partial<IEvent>): Promise<ApiResponse<IEvent>> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to submit event');
    }
    return json;
  },

  async updateEvent(id: string, data: Partial<IEvent>): Promise<ApiResponse<IEvent>> {
    const res = await fetch(`${API_BASE}/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update event');
    return json;
  },

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/events/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete event');
    return json;
  },

  async getTechnologies(): Promise<ApiResponse<TechnologyItem[]>> {
    const res = await fetch(`${API_BASE}/technologies`);
    if (!res.ok) throw new Error('Failed to load technologies');
    return res.json();
  },

  // Organizer API
  async getOrganizerEvents(status?: string, page = 1): Promise<{
    success: boolean;
    data: IEvent[];
    stats: OrganizerStats;
    dbStatus?: DbStatusInfo;
    pagination?: any;
    message?: string;
  }> {
    const query = new URLSearchParams();
    if (status && status !== 'all') query.set('status', status);
    query.set('page', String(page));
    query.set('limit', '50');

    const res = await fetch(`${API_BASE}/organizer/events?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load organizer events');
    return res.json();
  },

  async approveEvent(id: string): Promise<ApiResponse<IEvent>> {
    const res = await fetch(`${API_BASE}/organizer/events/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to approve event');
    return json;
  },

  async rejectEvent(id: string, reason?: string): Promise<ApiResponse<IEvent>> {
    const res = await fetch(`${API_BASE}/organizer/events/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reject event');
    return json;
  },

  async uploadImage(file: File, folderName?: string): Promise<{ success: boolean; data: { url: string; publicId: string }; message: string }> {
    const formData = new FormData();
    formData.append('image', file);

    if (folderName && folderName.trim()) {
      formData.append('folder', folderName.trim());
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Image upload failed');
    return json;
  }
};

export const organizerApi = eventApi;

export const authApi = {
  async login(credentials: { email: string; password: string }): Promise<{
    success: boolean;
    data: IUser;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Authentication failed');
    }
    return json;
  },

  async getUsers(): Promise<{ success: boolean; data: IUser[]; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/users`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch users');
    return json;
  },

  async createStaff(staffData: {
    name: string;
    email: string;
    password?: string;
    department?: string;
  }): Promise<{ success: boolean; data: IUser; message: string }> {
    const res = await fetch(`${API_BASE}/auth/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create staff member');
    return json;
  },

  async toggleStaffStatus(id: string): Promise<{ success: boolean; data: IUser; message: string }> {
    const res = await fetch(`${API_BASE}/auth/staff/${encodeURIComponent(id)}/toggle-status`, {
      method: 'PATCH'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update staff status');
    return json;
  },

  async deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/staff/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete staff member');
    return json;
  },

  async getAdminStats(): Promise<{ success: boolean; data: AdminStats; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/admin-stats`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch admin stats');
    return json;
  }
};

export const applicationApi = {
  // Regular User endpoint (no auth needed)
  async submitApplication(data: {
    eventId: string;
    fullName: string;
    email: string;
    phone: string;
    number?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: IApplication;
    isCloseDoors: boolean;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit application');
    return json;
  },

  async getApplications(params: {
    eventId?: string;
    status?: string;
    search?: string;
    eventAccessType?: string;
  } = {}): Promise<{
    success: boolean;
    data: IApplication[];
    stats: ApplicationStats;
    message?: string;
  }> {
    const query = new URLSearchParams();
    if (params.eventId && params.eventId !== 'all') query.set('eventId', params.eventId);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.eventAccessType && params.eventAccessType !== 'all') query.set('eventAccessType', params.eventAccessType);

    const res = await fetch(`${API_BASE}/applications?${query.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load applications');
    return json;
  },

  // Staff application review (accept/reject). Admin blocked on server!
  async reviewApplication(
    id: string,
    decision: 'accepted' | 'rejected',
    reviewerName?: string,
    userRole?: string
  ): Promise<{
    success: boolean;
    data: IApplication;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/applications/${encodeURIComponent(id)}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole || ''
      },
      body: JSON.stringify({ decision, reviewerName, callerRole: userRole })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to review application');
    return json;
  },

  async getStats(): Promise<{ success: boolean; data: ApplicationStats }> {
    const res = await fetch(`${API_BASE}/applications/stats`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load stats');
    return json;
  }
};


