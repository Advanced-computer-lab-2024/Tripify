// routes/tourismGovernor.routes.js

import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
    registerTourismGovernor,
    loginTourismGovernor,
    getTourismGovernorProfile,
    getTourismGovernors,
    updateTourismGovernorProfile,
    changePassword, // Import changePassword function
    getGovernorPlaces,
    createHistoricalPlace,
    updateHistoricalPlace,
    deleteHistoricalPlace
} from '../controllers/tourismGovernor.controller.js';

const router = express.Router();

// Public routes
router.post('/register', registerTourismGovernor);
router.post('/login', loginTourismGovernor);
router.get('/', getTourismGovernors); // List all tourism governors

// Protected routes
router.get('/profile', authMiddleware, getTourismGovernorProfile); // Get logged-in governor's profile
router.put('/profile', authMiddleware, updateTourismGovernorProfile); // Update logged-in governor's profile
router.put('/change-password', authMiddleware, changePassword); // Change governor's password

// Historical places routes
router.get('/my-places', authMiddleware, getGovernorPlaces); // Get historical places created by the governor
router.post('/places', authMiddleware, createHistoricalPlace); // Create a new historical place
router.put('/places/:id', authMiddleware, updateHistoricalPlace); // Update a specific historical place
router.delete('/places/:id', authMiddleware, deleteHistoricalPlace); // Delete a specific historical place

export default router;
