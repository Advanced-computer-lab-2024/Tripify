// routes/tourist.routes.js

import express from "express";
import {
  registerTourist,
  loginTourist,
  getTouristProfile,
  updateTouristProfile,
  getAllTourists,
  changePassword, // Import the changePassword function
} from "../controllers/tourist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"; // Correct import path for auth middleware

const router = express.Router();

// Public routes
router.post("/register", registerTourist);
router.post("/login", loginTourist);
router.get("/", getAllTourists); // Get all tourists

// Protected routes (requires authentication)
router.get("/profile/:username", authMiddleware, getTouristProfile);
router.put("/profile/:username", authMiddleware, updateTouristProfile);
router.put("/profile/:username/change-password", authMiddleware, changePassword); // Change password route

export default router;
