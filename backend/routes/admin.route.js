import express from "express";
import {
  registerAdmin,
  loginAdmin,
  listAllUsers,
  deleteUser,
  getAdminProfile,
  changePassword,
  getUnverifiedAdvertisers,
  getUnverifiedSellers,
  getUnverifiedTourGuides,
  verifyAdvertiser,
  verifySeller,
  verifyTourGuide
  
} from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected admin routes (requires authentication and admin role)
router.get("/profile", authMiddleware, adminAuthMiddleware, getAdminProfile);
router.get("/users", authMiddleware, adminAuthMiddleware, listAllUsers);
router.delete("/users", authMiddleware, adminAuthMiddleware, deleteUser);
router.put(
  "/change-password",
  authMiddleware,
  adminAuthMiddleware,
  changePassword
);

router.get('/unverified-sellers', authMiddleware, getUnverifiedSellers);
router.get('/unverified-advertisers', authMiddleware, getUnverifiedAdvertisers);
router.get('/unverified-tourguides', authMiddleware, getUnverifiedTourGuides);

router.put('/verify-seller/:id', authMiddleware, verifySeller);
router.put('/verify-advertiser/:id', authMiddleware, verifyAdvertiser);
router.put('/verify-tourguide/:id', authMiddleware, verifyTourGuide);
export default router;
