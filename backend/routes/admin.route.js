import express from 'express';
import { registerAdmin,loginAdmin } from '../controllers/admin.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

export default router;