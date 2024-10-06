import express from 'express';
import { registerTourismGovernor, loginTourismGovernor } from '../controllers/tourismGovernor.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerTourismGovernor);
router.post('/login', loginTourismGovernor);

export default router;