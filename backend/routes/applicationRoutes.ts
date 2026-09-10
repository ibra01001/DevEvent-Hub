import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.ts';

const router = Router();

// Regular user submits event registration / application (No account required)
router.post('/applications', ApplicationController.submitApplication);

// Staff and Admin application list & statistics
router.get('/applications', ApplicationController.getApplications);
router.get('/applications/stats', ApplicationController.getStats);

// Staff application review (accept / reject) - Admin is strictly forbidden
router.patch('/applications/:id/review', ApplicationController.reviewApplication);

export default router;
