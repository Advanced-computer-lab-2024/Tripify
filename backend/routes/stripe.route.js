// routes/stripe.route.js
import express from "express";
import { createPaymentIntent } from "../controllers/stripe.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-payment-intent", authMiddleware, createPaymentIntent);

export default router;
