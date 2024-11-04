import express from "express";
import {
  createItinerary,
  getItineraryById,
  getAllItineraries,
  updateItinerary,
  deleteItinerary,
  searchItineraries,
  flagItinerary,
} from "../controllers/itinerary.controller.js";
// import { authenticateUser } from '../middleware/auth.middleware.js'; // Assuming you have authentication middleware
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware.js";

const router = express.Router();

router.post("/", createItinerary);
router.get("/", getAllItineraries);
router.get("/search", searchItineraries);
router.get("/:id", getItineraryById);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);
router.patch("/:id/flag", flagItinerary);

export default router;
