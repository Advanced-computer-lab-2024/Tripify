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
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  getTourGuideReport
} from "../controllers/tourGuide.controller.js"; // Removed 'upload' from here

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
router.get("/guides", getAllTourGuides); // Public list of tour guides

// Protected routes (requires authentication)
router.get("/profile", authMiddleware, getProfileByToken);
router.get("/my-itineraries", authMiddleware, getTourGuideItineraries);
router.get("/profile/:username", authMiddleware, getTourGuideByUsername);

// Update profile (without file uploads)
router.put("/profile/:username", authMiddleware, updateTourGuideAccount);

router.put("/change-password", authMiddleware, changePassword);
// Delete account
router.delete("/delete/:id", authMiddleware, deleteTourGuide);


router.post("/forgot-password/send-otp", sendPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPassword);

router.get("/:id/get-report", getTourGuideReport);

export default router;
