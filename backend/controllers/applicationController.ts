import { Request, Response } from 'express';
import { ApplicationRepository, EventRepository } from '../db.ts';

export const ApplicationController = {
  // Regular User endpoint (no account needed!)
  async submitApplication(req: Request, res: Response) {
    try {
      const { eventId, fullName, email, phone, number, notes } = req.body;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required to register or apply.'
        });
      }

      if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your Full Name, Email, and Phone.'
        });
      }

      // Combine phone and number or attach number to notes
      const extraNotes = [
        number ? `Applicant/Attendee Number: ${number}` : '',
        notes ? notes.trim() : ''
      ].filter(Boolean).join(' | ');

      const application = await ApplicationRepository.createApplication({
        eventId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: extraNotes
      });

      const isCloseDoors = application.eventAccessType === 'close-doors';

      return res.status(201).json({
        success: true,
        data: application,
        isCloseDoors,
        message: isCloseDoors
          ? 'Your application for this Close-Doors event has been received and is pending Staff review.'
          : 'Registration confirmed! This is an Open-Doors event, and your entry pass is verified.'
      });
    } catch (error: any) {
      console.error('Submit application error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit event application.'
      });
    }
  },

  // Get list of applications (for Staff and Admin views)
  async getApplications(req: Request, res: Response) {
    try {
      const { eventId, status, search, eventAccessType } = req.query;

      const applications = await ApplicationRepository.getApplications({
        eventId: eventId as string,
        status: status as string,
        search: search as string,
        eventAccessType: eventAccessType as string
      });

      const stats = await ApplicationRepository.getApplicationStats();

      return res.status(200).json({
        success: true,
        data: applications,
        stats,
        message: 'Applications retrieved successfully.'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve applications.',
        error: error.message
      });
    }
  },

  // Staff review endpoint: Accept or Reject
  async reviewApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { decision, reviewerName, callerRole } = req.body;

      // Check header or body role
      const userRole = req.headers['x-user-role'] || callerRole;

      // STRICT USER REQUIREMENT:
      // "admin who can create new staff but cant decide if they accept or reject applications from user one"
      if (userRole === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: Administrators cannot accept or reject applications. Application decisions are strictly managed by Staff.'
        });
      }

      if (decision !== 'accepted' && decision !== 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'Decision must be either "accepted" or "rejected".'
        });
      }

      const app = await ApplicationRepository.getApplicationById(id);
      if (!app) {
        return res.status(404).json({
          success: false,
          message: 'Application not found.'
        });
      }

      if (app.eventAccessType === 'open-doors') {
        return res.status(400).json({
          success: false,
          message: 'Open-Doors events do not require staff review; attendees are automatically confirmed.'
        });
      }

      const updated = await ApplicationRepository.reviewApplication(
        id,
        decision,
        reviewerName || 'Staff Member'
      );

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Application for ${updated.fullName} has been ${decision}.`
      });
    } catch (error: any) {
      console.error('Review application error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to review application.'
      });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await ApplicationRepository.getApplicationStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve stats.',
        error: error.message
      });
    }
  }
};
