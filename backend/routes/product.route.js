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


// POST: Create a new product
router.post('/add-product', addProduct);

// GET: Find all products
router.get('/', findProducts);  // e.g., /api/products

// GET: Find a product by ID
router.get('/:id', findProductById);  // e.g., /api/products/:id

// PUT: Update a product by ID
router.put('/:id', updateProduct);  // e.g., /api/products/:id

// DELETE: Delete a product by ID
router.delete('/:id', deleteProduct);  // e.g., /api/products/:id

// POST: Upload product image
router.post('/upload-image', upload.single('image'), (req, res) => {
  // Check if the file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // File upload successful, respond with the file path or URL
  res.status(200).json({ 
    message: 'Image uploaded successfully', 
    imageUrl: req.file.path // Send the path to the uploaded file
  });
});

// POST: Add a new product (including image URL handling)
router.post('/add-product', addProduct); // Adjust as needed


export default router;
