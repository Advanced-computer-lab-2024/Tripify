import express from "express";
import {
  registerAdvertiser,
  loginAdvertiser,
  getAllAdvertisers,
} from "../controllers/advertiser.controller.js";

const router = express.Router();

// Public routes
router.post("/register", registerAdvertiser);
router.post("/login", loginAdvertiser);
router.get("/", getAllAdvertisers); // Add this new route

export default router;
