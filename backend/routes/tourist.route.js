import express from "express";
import {
  registerTourist,
  loginTourist,
  getTouristProfile,
  updateTouristProfile,
  getAllTourists,
  addToWallet,
  deductFromWallet,
  refundToWallet,
  getLoyaltyStatus,
  redeemLoyaltyPoints,
  rateTourGuide,
  changePassword,
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
router.get("/profile/:username", authMiddleware, getLoyaltyStatus);

router.put("/change-password", authMiddleware, changePassword);

// Wallet routes
router.post("/wallet/add/:id", authMiddleware, addToWallet);
router.post("/wallet/deduct/:id", authMiddleware, deductFromWallet);
router.post("/wallet/refund/:id", authMiddleware, refundToWallet);
router.post("/loyalty/redeem/:id", authMiddleware, redeemLoyaltyPoints);

// Rate tour guide route
router.post("/rate-guide/:tourGuideId", authMiddleware, rateTourGuide);

export default router;
