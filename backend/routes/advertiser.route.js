import express from 'express';
import {
    registerAdvertiser,
    loginAdvertiser,
    getAllAdvertisers,
    getAdvertiserById,
    getAdvertiserByUsername,
    updateAdvertiserByUsername,
    deleteAdvertiser
} from '../controllers/advertiser.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerAdvertiser);
router.post('/login', loginAdvertiser);
router.get('/all', getAllAdvertisers); // Public list of advertisers

// Protected routes (requires authentication)
// Profile routes
router.get('/profile/:username', authMiddleware, getAdvertiserByUsername);
router.put('/profile/:username', authMiddleware, updateAdvertiserByUsername);

// ID-based routes
router.get('/:id', authMiddleware, getAdvertiserById);
router.delete('/:id', authMiddleware, deleteAdvertiser);

export default router;