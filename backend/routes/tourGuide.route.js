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
