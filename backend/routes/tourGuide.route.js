<<<<<<< HEAD
import express from 'express';
import { 
    registerTourGuide, 
    loginTourGuide,getTourGuideByUsername,getAllTourGuides, 
    getTourGuideAccount, 
    updateTourGuideAccount 
} from '../controllers/tourGuide.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllTourGuides);
router.post('/register', registerTourGuide); // Register a new tour guide
router.post('/login', loginTourGuide); // Login an existing tour guide

// Route to get tour guide account details by username and email
router.get('/account', getTourGuideAccount); // Fetch tour guide details based on username and email

// Route to update tour guide account details by ID
router.put('/account/:id', updateTourGuideAccount); // Update tour guide details based on ID
router.post('/profile', getTourGuideByUsername);

export default router;
=======
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
>>>>>>> jwtdemo
