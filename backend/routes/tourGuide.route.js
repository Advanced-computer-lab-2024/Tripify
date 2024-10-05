import express from 'express';
import { registerTourGuide, loginTourGuide,getTourGuideByUsername,getAllTourGuides } from '../controllers/tourGuide.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllTourGuides);
router.post('/register', registerTourGuide);
router.post('/login', loginTourGuide);
router.post('/profile', getTourGuideByUsername);

export default router;