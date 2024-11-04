import express from 'express';
import {
    registerTourGuide,
    loginTourGuide,
    getTourGuideByUsername,
    getAllTourGuides,
    updateTourGuideAccount,
    deleteTourGuide,
    getProfileByToken,
    getTourGuideItineraries  // Add this import
} from '../controllers/tourGuide.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerTourGuide);
router.post('/login', loginTourGuide);
router.get('/guides', getAllTourGuides); // Public list of tour guides

// Protected routes (requires authentication)
// Get own profile using token
router.get('/profile', authMiddleware, getProfileByToken);

// Get own itineraries
router.get('/my-itineraries', authMiddleware, getTourGuideItineraries);

// Get specific tour guide profile
router.get('/profile/:username', authMiddleware, getTourGuideByUsername);

// Update own profile
router.put('/profile/:username', authMiddleware, updateTourGuideAccount);

// Delete account
router.delete('/profile/:username', authMiddleware, deleteTourGuide);

export default router;
