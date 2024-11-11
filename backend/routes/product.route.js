import express from 'express';
import {
  addProduct,
  getProducts,
  findProductById,
  updateProduct,
  deleteProduct,
  addReview,
  toggleArchiveProduct,
  getArchivedProducts,
} from '../controllers/product.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes for Products

router.get('/archived', authMiddleware, getArchivedProducts); // Move this up!

// Get all products
router.get('/', getProducts);

// Create a new product
router.post('/', authMiddleware, addProduct); // Authentication required for adding a product

// Get a product by ID
router.get('/:id', findProductById);

// Update a product by ID
router.put('/:id', authMiddleware, updateProduct); // Authentication required for updating

// Delete a product by ID
router.delete('/:id', authMiddleware, deleteProduct); // Authentication required for deleting

// Add a review to a product
router.post('/:id/review', addReview); // Assuming reviews don't require authentication

// Archive or unarchive a product
router.put('/:productId/archive', authMiddleware, toggleArchiveProduct);


export default router;
