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
  verifyTourGuide,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getAllPromoCodes,
  triggerBirthdayPromos,
  getItinerarySales,
  getActivitySales,
  getProductSales,
  getHistoricalPlaceSales,
  getUserStats, 
  sendPasswordResetOtp,
  resetPassword,
  verifyPasswordResetOtp,
  
  // Import the new controller function
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

router.get("/unverified-sellers", authMiddleware, getUnverifiedSellers);
router.get("/unverified-advertisers", authMiddleware, getUnverifiedAdvertisers);
router.get("/unverified-tourguides", authMiddleware, getUnverifiedTourGuides);

router.put("/verify-seller/:id", authMiddleware, verifySeller);
router.put("/verify-advertiser/:id", authMiddleware, verifyAdvertiser);
router.put("/verify-tourguide/:id", authMiddleware, verifyTourGuide);

router.post("/promo-codes", authMiddleware, createPromoCode); // Create promo code
router.put("/promo-codes/:id", authMiddleware, updatePromoCode); // Update promo code by ID
router.delete("/promo-codes/:id", authMiddleware, deletePromoCode); // Delete promo code by ID
router.get("/promo-codes", authMiddleware, getAllPromoCodes);
router.post("/promos/trigger-birthday", triggerBirthdayPromos);

// Sales routes
router.get(
  "/sales/itineraries",
  authMiddleware,
  adminAuthMiddleware,
  getItinerarySales
);
router.get(
  "/sales/activities",
  authMiddleware,
  adminAuthMiddleware,
  getActivitySales
);
router.get(
  "/sales/products",
  authMiddleware,
  adminAuthMiddleware,
  getProductSales
);
router.get(
  "/sales/historical",
  authMiddleware,
  adminAuthMiddleware,
  getHistoricalPlaceSales
);

// New route to get user stats
router.get(
  "/user-stats",
  authMiddleware,
  adminAuthMiddleware,
  getUserStats // Adding the new controller function for user stats
);
router.post("/forgot-password/send-otp", sendPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPassword);

export default router;
