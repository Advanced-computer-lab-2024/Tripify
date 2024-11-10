import express from "express";
import { bookingController } from "../controllers/booking.controller.js";

const router = express.Router();

// Existing routes
router.post("/create", bookingController.createBooking);
router.get("/user/:userId", bookingController.getUserBookings);
router.get("/user/:userId/upcoming", bookingController.getUpcomingBookings);
router.get("/item/:bookingType/:itemId", bookingController.getItemBookings);
router.patch("/status/:bookingId", bookingController.updateBookingStatus);
router.patch("/cancel/:bookingId", bookingController.cancelBooking);
router.get("/availability", bookingController.checkAvailability);

// Rating routes
router.post("/:bookingId/rating", bookingController.addRating);
router.put("/:bookingId/rating", bookingController.updateRating);

// Item-specific rating routes
router.get(
  "/historicalplace/:placeId/ratings",
  bookingController.getHistoricalPlaceRatings
);
router.get(
  "/activity/:activityId/ratings",
  bookingController.getActivityRatings
);
router.get("/guide/:guideId/ratings", bookingController.getGuideRatings);
router.get(
  "/guide/:guideId/rating-stats",
  bookingController.getGuideRatingStats
);

export default router;
