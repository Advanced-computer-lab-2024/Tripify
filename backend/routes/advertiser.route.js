import express from 'express';
import {
    registerAdvertiser,
    loginAdvertiser,
    getAllAdvertisers,
    getAdvertiserById,
    getAdvertiserByUsername,
    updateAdvertiserByUsername,
    deleteAdvertiser,
    getAdvertiserActivities,
    changeAdvertiserPassword,
    resetPassword // Import the reset password function
} from '../controllers/advertiser.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerAdvertiser);
router.post('/login', loginAdvertiser);
router.post('/reset-password', resetPassword); // Public route for resetting password
router.get('/all', getAllAdvertisers);

// Protected routes (requires authentication)
// Profile routes
router.get('/profile/:username', authMiddleware, getAdvertiserByUsername);
router.put('/profile/:username', authMiddleware, updateAdvertiserByUsername);

// Change password route
router.put('/change-password', authMiddleware, changeAdvertiserPassword);

// Activities route
router.get('/activities/my', authMiddleware, getAdvertiserActivities);

// ID-based routes
router.get('/:id', authMiddleware, getAdvertiserById);
router.delete('/:id', authMiddleware, deleteAdvertiser);

export default router;
