import express from "express";
import {
  registerTourGuide,
  loginTourGuide,
  getTourGuideByUsername,
  getAllTourGuides,
  updateTourGuideAccount,
  deleteTourGuide,
  getProfileByToken,
  getTourGuideItineraries,
  changePassword,
  resetPassword,
} from "../controllers/tourGuide.controller.js"; // Removed 'upload' from here

import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../utils/upload.js"; // Only keep this 'upload' import

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerTourGuide);
router.post("/login", loginTourGuide);
router.get("/guides", getAllTourGuides); // Public list of tour guides
router.post("/upload", upload.single("file")); // File upload route
router.post("/reset-password", resetPassword); // Public route for resetting password

// Protected routes (requires authentication)
// Get own profile using token
router.get("/profile", authMiddleware, getProfileByToken);

// Get own itineraries
router.get("/my-itineraries", authMiddleware, getTourGuideItineraries);

// Get specific tour guide profile
router.get("/profile/:username", authMiddleware, getTourGuideByUsername);

// Update own profile
router.put("/profile/:username", authMiddleware, updateTourGuideAccount);

// Change password
router.put("/profile/:id/change-password", authMiddleware, changePassword);

// Delete account
router.delete("/profile/:username", authMiddleware, deleteTourGuide);

export default router;
