import express from "express";
import {
  registerTourist,
  loginTourist,
  getTouristProfile,
  updateTouristProfile,
  getAllTourists,
  changePassword,
  addToWallet,
  deductFromWallet,
  refundToWallet,
  getLoyaltyStatus,
  redeemLoyaltyPoints,
  rateTourGuide,
} from "../controllers/tourist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerTourist);
router.post("/login", loginTourist);
router.get("/", getAllTourists);

// Protected routes (requires authentication)
router.get("/profile/:username", authMiddleware, getTouristProfile);
router.put("/profile/:username", authMiddleware, updateTouristProfile);
router.put(
  "/profile/:username/change-password",
  authMiddleware,
  changePassword
);

// Loyalty routes
router.get("/loyalty/:id", authMiddleware, getLoyaltyStatus);
router.post("/loyalty/redeem/:id", authMiddleware, redeemLoyaltyPoints);

// Wallet routes
router.post("/wallet/add/:id", authMiddleware, addToWallet);
router.post("/wallet/deduct/:id", authMiddleware, deductFromWallet);
router.post("/wallet/refund/:id", authMiddleware, refundToWallet);

// Rate tour guide route
router.post("/rate-guide/:tourGuideId", authMiddleware, rateTourGuide);

export default router;
