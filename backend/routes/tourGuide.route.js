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
} from "../controllers/tourGuide.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerTourGuide);
router.post("/login", loginTourGuide);
router.get("/guides", getAllTourGuides); // Public list of tour guides

router.post(
  "/upload",
  upload.single("idDocument"),
  upload.single("certificate"),
  async (req, res) => {
    try {
      // Handle the uploaded files
      console.log("Uploaded ID Document:", req.files.idDocument);
      console.log("Uploaded Certificate:", req.files.certificate);
      res.status(200).json({ message: "Files uploaded successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to upload files" });
    }
  }
);
// Protected routes (requires authentication)
// Get own profile using token
router.get("/profile", authMiddleware, getProfileByToken);

// Get own itineraries
router.get("/my-itineraries", authMiddleware, getTourGuideItineraries);

// Get specific tour guide profile
router.get("/profile/:username", authMiddleware, getTourGuideByUsername);

// Update own profile
router.put("/profile/:username", authMiddleware, updateTourGuideAccount);

// Delete account
router.delete("/profile/:username", authMiddleware, deleteTourGuide);

export default router;
