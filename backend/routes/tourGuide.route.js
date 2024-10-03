import express from 'express';
import { registertourGuide, logintourGuide } from '../controllers/tourGuide.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registertourGuide);
router.post('/login', logintourGuide);

export default router;