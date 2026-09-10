import { Request, Response } from 'express';
import { EventRepository } from '../db.ts';

export const EventController = {
  async getEvents(req: Request, res: Response) {
    try {
      const result = await EventRepository.getEvents({
        search: req.query.search as string,
        type: req.query.type as string,
        technology: req.query.technology as string,
        locationType: req.query.locationType as string,
        accessType: req.query.accessType as string,
        from: req.query.from as string,
        to: req.query.to as string,
        status: req.query.status as string,
        featured: req.query.featured as string,
        trending: req.query.trending as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
        sortBy: req.query.sortBy as string
      });

      return res.status(200).json({
        success: true,
        data: result.events,
        pagination: result.pagination,
        message: 'Events retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve events',
        error: error.message
      });
    }
  },

  async getFeaturedEvents(req: Request, res: Response) {
    try {
      const result = await EventRepository.getEvents({
        featured: 'true',
        status: 'approved',
        limit: 4
      });

      return res.status(200).json({
        success: true,
        data: result.events,
        message: 'Featured events retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve featured events',
        error: error.message
      });
    }
  },

  async getTrendingEvents(req: Request, res: Response) {
    try {
      const result = await EventRepository.getEvents({
        trending: 'true',
        status: 'approved',
        limit: 6,
        sortBy: 'trending'
      });

      return res.status(200).json({
        success: true,
        data: result.events,
        message: 'Trending events retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve trending events',
        error: error.message
      });
    }
  },

  async searchEvents(req: Request, res: Response) {
    try {
      const query = (req.query.q || req.query.search || '') as string;
      const result = await EventRepository.getEvents({
        search: query,
        status: 'approved',
        limit: 8
      });

      return res.status(200).json({
        success: true,
        data: result.events,
        pagination: result.pagination,
        message: `Found ${result.events.length} events`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error.message
      });
    }
  },

  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await EventRepository.getEventByIdOrSlug(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: event,
        message: 'Event retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve event',
        error: error.message
      });
    }
  },

  async createEvent(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        type,
        technologies,
        startDate,
        endDate,
        locationType,
        location,
        organizer,
        organizerEmail,
        coverImage
      } = req.body;

      // Basic validation
      if (!title || !description || !type || !startDate || !locationType || !organizer || !organizerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields (title, description, type, startDate, locationType, organizer, organizerEmail)'
        });
      }

      if (!technologies || !Array.isArray(technologies) || technologies.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please specify at least one technology tag'
        });
      }

      const newEvent = await EventRepository.createEvent({
        ...req.body,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        currentParticipants: 0
      });

      return res.status(201).json({
        success: true,
        data: newEvent,
        message: 'Event submitted successfully! It is now pending organizer approval.'
      });
    } catch (error: any) {
      console.error('Create event error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error.message
      });
    }
  },

  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await EventRepository.updateEvent(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Event updated successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update event',
        error: error.message
      });
    }
  },

  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await EventRepository.deleteEvent(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or already removed'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error.message
      });
    }
  },

  async getTechnologies(req: Request, res: Response) {
    try {
      const technologies = await EventRepository.getTechnologies();
      return res.status(200).json({
        success: true,
        data: technologies,
        message: 'Technologies retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve technologies',
        error: error.message
      });
    }
  },

  // Organizer moderation endpoints
  async getOrganizerEvents(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const result = await EventRepository.getEvents({
        status: status || 'all',
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        sortBy: 'date-desc'
      });

      const stats = await EventRepository.getOrganizerStats();

      return res.status(200).json({
        success: true,
        data: result.events,
        stats,
        dbStatus: EventRepository.getDbStatus(),
        pagination: result.pagination,
        message: 'Organizer events and statistics retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve organizer events',
        error: error.message
      });
    }
  },

  async approveEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await EventRepository.setStatus(id, 'approved');

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Event approved successfully and is now public!'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to approve event',
        error: error.message
      });
    }
  },

  async rejectEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await EventRepository.setStatus(id, 'rejected');

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Event rejected.'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reject event',
        error: error.message
      });
    }
  },

};
