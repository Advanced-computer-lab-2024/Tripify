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
  uploadProfilePicture,
} from "../controllers/tourGuide.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadMiddleware from "../utils/upload.js";

const router = express.Router();

// Public routes (no authentication required)
router.post(
  "/register",
  uploadMiddleware.fields([
    { name: "identificationDocument", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  registerTourGuide
);
router.post("/login", loginTourGuide);
router.get("/guides", getAllTourGuides);

// Protected routes (requires authentication)
router.get("/profile", authMiddleware, getProfileByToken);
router.get("/my-itineraries", authMiddleware, getTourGuideItineraries);
router.get("/profile/:username", authMiddleware, getTourGuideByUsername);

// Update profile (without file uploads)
router.put("/profile/:username", authMiddleware, updateTourGuideAccount);
router.put("/change-password", authMiddleware, changePassword);

// Profile picture upload route - Updated with :id parameter
router.post(
  "/upload-profile-picture/:id",
  
  uploadMiddleware.single("profilePicture"),
  uploadProfilePicture
);

// Delete account
router.delete("/delete/:id", authMiddleware, deleteTourGuide);

export default router;