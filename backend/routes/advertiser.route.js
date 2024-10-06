import express from 'express';
import { 
    registerAdvertiser, 
    loginAdvertiser, 
    getAdvertiserAccountById, 
    getAdvertiserAccountByParams, 
    updateAdvertiserAccount 
} from '../controllers/advertiser.controller.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdvertiser);  // Route to register an advertiser
router.post('/login', loginAdvertiser);        // Route to log in an advertiser

// Route to get advertiser account details by ID
router.get('/account/:id', getAdvertiserAccountById); 

// Route to get advertiser account details by username and email
router.get('/account', getAdvertiserAccountByParams); // Fetch by username and email

// Route to update advertiser account details
router.put('/account/:id', updateAdvertiserAccount); // Update advertiser details

export default router;
