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
    acceptTerms,
    requestDeletion,
    resetPassword
} from '../controllers/advertiser.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import checkTermsMiddleware from "../middleware/checkTerms.middleware.js";

// Initialize the router first
const router = express.Router();

// Route to check if terms are accepted (protected route)
router.get("/protected-route", authMiddleware, checkTermsMiddleware, (req, res) => {
  res.json({ message: "Access granted to protected route." });
});

// Route to accept terms (protected route)
router.put("/accept-terms", authMiddleware, acceptTerms);

//route to request deletion
router.put('/request-deletion', authMiddleware, requestDeletion);


// Public routes (no authentication required)
router.post('/register', registerAdvertiser);
router.post('/login', loginAdvertiser);
router.post('/reset-password', resetPassword);
router.get('/all', getAllAdvertisers);

// Protected routes (requires authentication)
router.get('/profile/:username', authMiddleware, getAdvertiserByUsername);
router.put('/profile/:username', authMiddleware, updateAdvertiserByUsername);
router.put('/change-password', authMiddleware, changeAdvertiserPassword);
router.get('/activities/my', authMiddleware, getAdvertiserActivities);
router.get('/:id', authMiddleware, getAdvertiserById);
router.delete('/:id', authMiddleware, deleteAdvertiser);

export default router;
