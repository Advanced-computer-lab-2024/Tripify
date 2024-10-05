// backend/routes/product.route.js
import express from 'express';
import {
  addProduct,
  findProducts,
  findProductById,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js'; // Ensure correct import path
import upload from '../middleware/upload.js'; // Import the upload middleware

const router = express.Router();

// POST: Create a new product with an image
router.post('/add-product', upload.single('image'), addProduct);

// GET: Find all products
router.get('/', findProducts);  // e.g., /api/products

// GET: Find a product by ID
router.get('/:id', findProductById);  // e.g., /api/products/:id

// PUT: Update a product by ID
router.put('/:id', updateProduct);  // e.g., /api/products/:id

// DELETE: Delete a product by ID
router.delete('/:id', deleteProduct);  // e.g., /api/products/:id

export default router;
