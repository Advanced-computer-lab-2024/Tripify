<<<<<<< HEAD
import express from 'express';
import {
    registerAdvertiser,
    loginAdvertiser,
    getAllAdvertisers,
    getAdvertiserAccountById,
    getAdvertiserAccountByParams,
    updateAdvertiser,
    deleteAdvertiser, 
    getAdvertiserByUsername,
    updateAdvertiserByUsername// Assuming you want to include delete functionality
} from '../controllers/advertiser.controller.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdvertiser);          // Route to register an advertiser
router.post('/login', loginAdvertiser);                // Route to log in an advertiser
router.get('/', getAllAdvertisers);                    // Route to get all advertisers
router.get("/profile/:username", getAdvertiserByUsername);
// Route to get advertiser account details by ID
router.get('/account/:id', getAdvertiserAccountById); 

// Route to get advertiser account details by username and email
router.get('/account', getAdvertiserAccountByParams);  // Fetch by username and email

// Route to update advertiser account details
router.put('/account/:id', updateAdvertiser);   

router.put('/profile/:username', updateAdvertiserByUsername);// Update advertiser details

// Route to delete an advertiser (if needed)
router.delete('/account/:id', deleteAdvertiser);       // Delete advertiser

export default router;
=======
import express from 'express';
import {
    registerAdvertiser,
    loginAdvertiser,
    getAllAdvertisers,
    getAdvertiserById,
    getAdvertiserByUsername,
    updateAdvertiserByUsername,
    deleteAdvertiser,
    getAdvertiserActivities  // Add this import
} from '../controllers/advertiser.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerAdvertiser);
router.post('/login', loginAdvertiser);
router.get('/all', getAllAdvertisers);

// Protected routes (requires authentication)
// Profile routes
router.get('/profile/:username', authMiddleware, getAdvertiserByUsername);
router.put('/profile/:username', authMiddleware, updateAdvertiserByUsername);

// Activities route
router.get('/activities/my', authMiddleware, getAdvertiserActivities);

// ID-based routes
router.get('/:id', authMiddleware, getAdvertiserById);
router.delete('/:id', authMiddleware, deleteAdvertiser);

export default router;
>>>>>>> jwtdemo
