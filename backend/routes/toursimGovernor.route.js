// routes/toursimGovernor.route.js

import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  registerTourismGovernor,
  loginTourismGovernor,
  getTourismGovernorProfile,
  getTourismGovernors,
  updateTourismGovernorProfile,
  getGovernorPlaces,
  createHistoricalPlace,
  updateHistoricalPlace,
  deleteHistoricalPlace,
  changePassword,
} from "../controllers/tourismGovernor.controller.js";

const router = express.Router();
// console.log("Setting up tourism governor routes...");

// Public routes with debug logging
router.post("/login", (req, res) => {
  console.log("Login attempt received:", req.body);
  loginTourismGovernor(req, res);
});

router.post("/register", (req, res) => {
  console.log("Registration attempt received:", req.body);
  registerTourismGovernor(req, res);
});

router.get("/", getTourismGovernors); // List all tourism governors

// Protected routes
router.get("/profile", authMiddleware, getTourismGovernorProfile);
router.put("/profile", authMiddleware, updateTourismGovernorProfile);
router.put("/change-password", authMiddleware, changePassword);

// Historical places routes
router.get("/my-places", authMiddleware, getGovernorPlaces);
router.post("/places", authMiddleware, createHistoricalPlace);
router.put("/places/:id", authMiddleware, updateHistoricalPlace);
router.delete("/places/:id", authMiddleware, deleteHistoricalPlace);

// console.log("Tourism governor routes configured");

export default router;
