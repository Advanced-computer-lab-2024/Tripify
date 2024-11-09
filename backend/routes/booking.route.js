import express from 'express';
import { bookingController } from '../controllers/booking.controller.js';

const router = express.Router();

// Existing booking routes
router.post('/create', bookingController.createBooking);
router.get('/user/:userId', bookingController.getUserBookings);
router.get('/user/:userId/upcoming', bookingController.getUpcomingBookings);
router.get('/item/:bookingType/:itemId', bookingController.getItemBookings);
router.patch('/status/:bookingId', bookingController.updateBookingStatus);
router.patch('/cancel/:bookingId', bookingController.cancelBooking);
router.get('/availability', bookingController.checkAvailability);

// New rating routes
// Add a rating to a booking
router.post('/:bookingId/rating', bookingController.addRating);

// Update an existing rating
router.put('/:bookingId/rating', bookingController.updateRating);

// Get guide ratings (paginated)
router.get('/guide/:guideId/ratings', bookingController.getGuideRatings);

// Get guide rating statistics
router.get('/guide/:guideId/rating-stats', bookingController.getGuideRatingStats);

export default router;