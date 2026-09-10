import { Request, Response } from 'express';
import { UserRepository, EventRepository, ApplicationRepository } from '../db.ts';

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const user = await UserRepository.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.'
        });
      }

      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password. Please verify your credentials.'
        });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account is suspended. Please contact the administrator.'
        });
      }

      const safeUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      };

      return res.status(200).json({
        success: true,
        data: safeUser,
        message: `Welcome back, ${user.name}! Logged in as ${user.role}.`
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication failed.',
        error: error.message
      });
    }
  },

  async getStaffList(req: Request, res: Response) {
    try {
      const users = await UserRepository.getUsers();
      // Filter out passwords and return staff + admin overview
      return res.status(200).json({
        success: true,
        data: users,
        message: 'Users retrieved successfully.'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve staff list.',
        error: error.message
      });
    }
  },

  async createStaff(req: Request, res: Response) {
    try {
      const { name, email, password, department, role } = req.body;

      // STRICT USER REQUIREMENT: Admin CANNOT create another admin role!
      if (role && role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Platform Security Policy: Admin cannot create another admin role. Only Staff accounts can be created.'
        });
      }

      const newStaff = await UserRepository.createStaff({
        name,
        email,
        password: password || 'staff123',
        department,
        role: 'staff'
      });

      return res.status(201).json({
        success: true,
        data: newStaff,
        message: `Staff member "${newStaff.name}" created successfully.`
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create staff member.'
      });
    }
  },

  async toggleStaffStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await UserRepository.toggleStaffStatus(id);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found.'
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Staff member status updated to ${updated.status}.`
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update staff status.'
      });
    }
  },

  async deleteStaff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await UserRepository.deleteStaff(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Staff member account removed successfully.'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete staff member.'
      });
    }
  },

  async getAdminStats(req: Request, res: Response) {
    try {
      const [eventsStats, appStats, allUsers] = await Promise.all([
        EventRepository.getOrganizerStats(),
        ApplicationRepository.getApplicationStats(),
        UserRepository.getUsers()
      ]);

      const staffCount = allUsers.filter((u: any) => u.role === 'staff').length;
      const activeStaff = allUsers.filter((u: any) => u.role === 'staff' && u.status === 'active').length;

      return res.status(200).json({
        success: true,
        data: {
          totalEvents: eventsStats.total,
          openDoorsCount: eventsStats.openDoorsCount,
          closeDoorsCount: eventsStats.closeDoorsCount,
          totalParticipants: eventsStats.totalParticipants,
          totalApplications: appStats.total,
          pendingApplications: appStats.pending,
          acceptedApplications: appStats.accepted,
          rejectedApplications: appStats.rejected,
          totalStaff: staffCount,
          activeStaff
        },
        message: 'Admin statistics retrieved successfully.'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin stats.',
        error: error.message
      });
    }
  }
};
