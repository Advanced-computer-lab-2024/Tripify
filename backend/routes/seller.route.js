import express from 'express';
import { 
    registerSeller, 
    loginSeller, 
    getSellerProfile,
    updateSellerAccount,
    getAllSellers,
 
    deleteSellerAccount 
} from '../controllers/seller.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerSeller);
router.post('/login', loginSeller);

// Protected routes (requires authentication)
// Get seller's own profile
router.get('/profile/:username', authMiddleware, getSellerProfile);

// Update seller's own account
router.put('/profile/:id', authMiddleware, updateSellerAccount);

// Delete seller's own account
router.delete('/profile/:id', authMiddleware, deleteSellerAccount);

// Optional routes - might need admin authentication
router.get('/all', getAllSellers); // Get all sellers (could be admin-only)
// router.get('/:id', authMiddleware, getSellerById); // Get specific seller by ID

export default router;