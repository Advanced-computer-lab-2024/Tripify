import express from "express";
import {
  createTransportation,
  getAllTransportation,
  getTransportationById,
  updateTransportation,
  deleteTransportation,
  bookTransportation,
  getTouristBookings,
  getAdvertiserBookings,
  updateBookingStatus,
} from "../controllers/transportation.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllTransportation);
router.get("/:id", getTransportationById);

// Protected routes
router.post("/", authMiddleware, createTransportation);
router.put("/:id", authMiddleware, updateTransportation);
router.delete("/:id", authMiddleware, deleteTransportation);

// Booking routes
router.post("/book", authMiddleware, bookTransportation);
router.get("/bookings/tourist", authMiddleware, getTouristBookings);
router.get("/bookings/advertiser", authMiddleware, getAdvertiserBookings);
router.put("/bookings/:id/status", authMiddleware, updateBookingStatus);

export default router;
