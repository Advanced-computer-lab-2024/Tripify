import express from 'express';
import { bookingController } from '../controllers/booking.controller.js';

const router = express.Router();

// Route to create a new booking
router.post('/create', bookingController.createBooking);

// Route to get bookings by user ID
router.get('/user/:userId', bookingController.getUserBookings);

// Route to get upcoming bookings for a user
router.get('/user/:userId/upcoming', bookingController.getUpcomingBookings);

// Route to get bookings for a specific item
router.get('/item/:bookingType/:itemId', bookingController.getItemBookings);

// Route to update booking status
router.patch('/status/:bookingId', bookingController.updateBookingStatus);

// Route to cancel a booking
router.patch('/cancel/:bookingId', bookingController.cancelBooking);

// Route to check availability for a specific date
router.get('/availability', bookingController.checkAvailability);

export default router;
