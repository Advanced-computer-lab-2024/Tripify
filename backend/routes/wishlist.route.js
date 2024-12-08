import express from 'express';
import { wishlistController } from '../controllers/wishlist.controller.js';
import  authMiddleware  from '../middleware/auth.middleware.js'; // Assuming you have auth middleware

const router = express.Router();

// Apply auth middleware to all wishlist routes
router.use(authMiddleware);

// Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:userId/product/:productId', wishlistController.removeFromWishlist);

// Get user's wishlist
router.get('/:userId', wishlistController.getWishlist);

export default router;