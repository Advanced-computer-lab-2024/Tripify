import express from 'express';
import { registerSeller, loginSeller } from '../controllers/seller.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerSeller);
router.post('/login', loginSeller);

export default router;