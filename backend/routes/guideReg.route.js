import express from 'express';
import { register, login, getProfile } from '../controllers/guide.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

export default router;