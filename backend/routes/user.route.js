import express from 'express';
import { registerUser, loginUser, updateUser, restrictTo } from '../controllers/userController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.patch('/update/:id', protect, restrictTo('admin', 'user'), updateUser);

export default router;
