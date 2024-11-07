import express from "express";
import {
  createItinerary,
  getItineraryById,
  getAllItineraries,
  updateItinerary,
  deleteItinerary,
  searchItineraries,
  flagItinerary,
  addComment,
  getComments,
} from "../controllers/itinerary.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Basic itinerary routes
router.post("/", createItinerary);
router.get("/", getAllItineraries);
router.get("/search", searchItineraries);
router.get("/:id", getItineraryById);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);
router.patch("/:id/flag", flagItinerary);

// Comment routes
router.post("/:itineraryId/comments", authMiddleware, addComment);
router.get("/:itineraryId/comments", getComments);

export default router;
