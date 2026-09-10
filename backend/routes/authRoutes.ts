import { Router } from 'express';
import { AuthController } from '../controllers/authController.ts';

const router = Router();

// Authentication
router.post('/auth/login', AuthController.login);

// Admin-only staff management
router.get('/auth/users', AuthController.getStaffList);
router.post('/auth/staff', AuthController.createStaff);
router.patch('/auth/staff/:id/toggle-status', AuthController.toggleStaffStatus);
router.delete('/auth/staff/:id', AuthController.deleteStaff);

// Admin dashboard statistics
router.get('/auth/admin-stats', AuthController.getAdminStats);

export default router;
