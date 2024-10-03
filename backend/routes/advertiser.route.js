import express from 'express';
import { registerAdvertiser, loginAdvertiser } from '../controllers/advertiser.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdvertiser);
router.post('/login', loginAdvertiser);

export default router;