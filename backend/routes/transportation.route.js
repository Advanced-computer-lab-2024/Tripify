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
  getAdvertiserTransportations,
} from "../controllers/transportation.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllTransportation); // Route for tourists to view all transportations
router.get("/all", getAllTransportation); // Alternative route

// Protected routes - Advertiser
router.get(
  "/advertiser/listings",
  authMiddleware,
  getAdvertiserTransportations
);
router.get("/:id", getTransportationById);
router.post("/", authMiddleware, createTransportation);
router.put("/:id", authMiddleware, updateTransportation);
router.delete("/:id", authMiddleware, deleteTransportation);

// Protected routes - Bookings
router.post("/book", authMiddleware, bookTransportation);
router.get("/bookings/tourist", authMiddleware, getTouristBookings);
router.get("/bookings/advertiser", authMiddleware, getAdvertiserBookings);
router.put("/bookings/:id/status", authMiddleware, updateBookingStatus);

export default router;
