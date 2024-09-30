import express from 'express';
import {
    registerGuest,
    registerUser, // Use the new registerUser method
} from "../controllers/guest.controller.js";

const router = express.Router();

// Existing route for guest registration
router.post('/register', registerGuest);

// Updated route for user registration (tour guide/advertiser/seller)
router.post('/register-user', registerUser);

export default router; // Use export default
