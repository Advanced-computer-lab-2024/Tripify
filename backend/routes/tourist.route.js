// Update your tourist.route.js

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
} from "../controllers/tourist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerTourist);
router.post("/login", loginTourist);
router.get("/", getAllTourists);
router.get("/profile/:username", authMiddleware, getTouristProfile);
router.put("/profile/:username", authMiddleware, updateTouristProfile);
router.post("/wallet/add/:id", authMiddleware, addToWallet);
router.post("/wallet/deduct/:id", authMiddleware, deductFromWallet);
router.post("/wallet/refund/:id", authMiddleware, refundToWallet);

export default router;
