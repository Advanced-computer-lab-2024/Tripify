import express from "express";
import {
  registerAdvertiser,
  loginAdvertiser,
  getAllAdvertisers,
  getAdvertiserById,
  getAdvertiserByUsername,
  updateAdvertiserByUsername,
  deleteAdvertiser,
  getAdvertiserActivities,
  changePassword,
} from "../controllers/advertiser.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerAdvertiser);
router.post("/login", loginAdvertiser);

router.get("/all", getAllAdvertisers);

// Protected routes (requires authentication)
// Profile routes
router.get("/profile/:username", authMiddleware, getAdvertiserByUsername);
router.put("/profile/:username", authMiddleware, updateAdvertiserByUsername);

router.put("/change-password", authMiddleware, changePassword);

// Activities route
router.get("/activities/my", authMiddleware, getAdvertiserActivities);

// ID-based routes
router.get("/:id", authMiddleware, getAdvertiserById);
router.delete("/:id", authMiddleware, deleteAdvertiser);

export default router;
