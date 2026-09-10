import { Router } from 'express';
import { EventController } from '../controllers/eventController.ts';

const router = Router();

// Public & discovery endpoints
router.get('/events/search', EventController.searchEvents);
router.get('/events/featured', EventController.getFeaturedEvents);
router.get('/events/trending', EventController.getTrendingEvents);

router.get('/events', EventController.getEvents);
router.get('/events/:id', EventController.getEventById);
router.post('/events', EventController.createEvent);
router.put('/events/:id', EventController.updateEvent);
router.delete('/events/:id', EventController.deleteEvent);

// Technologies
router.get('/technologies', EventController.getTechnologies);

// Organizer routes
router.get('/organizer/events', EventController.getOrganizerEvents);
router.patch('/organizer/events/:id/approve', EventController.approveEvent);
router.patch('/organizer/events/:id/reject', EventController.rejectEvent);

export default router;
