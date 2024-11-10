// routes/tourist.routes.js

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
  requestDeletion,
  deleteTourist // Import the deleteTourist function
} from "../controllers/tourist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerTourist);
router.post("/login", loginTourist);
router.get("/", getAllTourists);

// Request deletion route (protected)
router.put('/request-deletion', authMiddleware, requestDeletion);

// Protected routes (requires authentication)
router.get("/profile/:username", authMiddleware, getTouristProfile);
router.put("/profile/:username", authMiddleware, updateTouristProfile);
router.put("/profile/:username/change-password", authMiddleware, changePassword);
router.get("/profile/:username/loyalty-status", authMiddleware, getLoyaltyStatus);

// Wallet routes
router.post("/wallet/add/:id", authMiddleware, addToWallet);
router.post("/wallet/deduct/:id", authMiddleware, deductFromWallet);
router.post("/wallet/refund/:id", authMiddleware, refundToWallet);
router.post("/loyalty/redeem/:id", authMiddleware, redeemLoyaltyPoints);

// Account deletion route (protected)
router.delete("/:id", authMiddleware, deleteTourist);

export default router;
