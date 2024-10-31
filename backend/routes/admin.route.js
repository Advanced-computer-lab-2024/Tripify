import express from 'express';
import { registerAdmin,loginAdmin,listAllUsers,deleteUser } from '../controllers/admin.controller.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/users', listAllUsers);
router.delete('/users/delete',deleteUser );

export default router;