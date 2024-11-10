import express from 'express';
import { 
    registerSeller, 
    loginSeller, 
    getSellerProfile,
    updateSellerAccount,
    changePassword,  
    resetPassword,    
    getAllSellers,
    acceptTerms,
    deleteSellerAccount,
    requestDeletion
} from '../controllers/seller.controller.js';
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

// Public routes (no authentication required)
router.post('/register', registerSeller);
router.post('/login', loginSeller);
router.post('/reset-password', resetPassword); 

//request deletion
router.put('/request-deletion', authMiddleware, requestDeletion);


// Protected routes (requires authentication)
router.get('/profile/:username', authMiddleware, getSellerProfile);
router.put('/profile/:id', authMiddleware, updateSellerAccount);
router.put('/profile/:id/change-password', authMiddleware, changePassword);
router.delete('/profile/:id', authMiddleware, deleteSellerAccount);

// Optional routes - might need admin authentication
router.get('/all', getAllSellers); 

export default router;
