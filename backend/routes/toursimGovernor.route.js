// routes/tourismGovernor.routes.js

import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
    registerTourismGovernor,
    loginTourismGovernor,
    getTourismGovernorProfile,
    getTourismGovernors,
    updateTourismGovernorProfile,
    getGovernorPlaces,
    createHistoricalPlace,
    updateHistoricalPlace,
    deleteHistoricalPlace
} from '../controllers/tourismGovernor.controller.js';

const router = express.Router();

// Public routes
router.post('/register', registerTourismGovernor);
router.post('/login', loginTourismGovernor);
router.get('/', getTourismGovernors);

// Protected routes
router.get('/profile', authMiddleware, getTourismGovernorProfile);
router.put('/profile', authMiddleware, updateTourismGovernorProfile);

// Historical places routes
router.get('/my-places', authMiddleware, getGovernorPlaces);
router.post('/places', authMiddleware, createHistoricalPlace);
router.put('/places/:id', authMiddleware, updateHistoricalPlace);
router.delete('/places/:id', authMiddleware, deleteHistoricalPlace);

export default router;