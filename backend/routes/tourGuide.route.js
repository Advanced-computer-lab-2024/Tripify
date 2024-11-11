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
} from "../controllers/tourGuide.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadMiddleware from "../utils/upload.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", 
  uploadMiddleware.fields([
    { name: 'identificationDocument', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]), 
  registerTourGuide
);

router.post("/login", loginTourGuide);
router.get("/guides", getAllTourGuides);
router.post("/reset-password", resetPassword);

// Protected routes (requires authentication)
router.get("/profile", authMiddleware, getProfileByToken);
router.get("/my-itineraries", authMiddleware, getTourGuideItineraries);
router.get("/profile/:username", authMiddleware, getTourGuideByUsername);

// Update profile (without file uploads)
router.put("/profile/:username", authMiddleware, updateTourGuideAccount);

router.put("/profile/:id/change-password", authMiddleware, changePassword);
router.delete("/profile/:username", authMiddleware, deleteTourGuide);

export default router;