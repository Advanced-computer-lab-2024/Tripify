// backend/routes/product.route.js
import express from "express";
import {
  addProduct,
  getProducts,
  findProductById,
  updateProduct,
  deleteProduct,
  addReview,
  toggleArchiveProduct,
  getArchivedProducts,
} from "../controllers/product.controller.js"; // Ensure correct import path
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/archived", authMiddleware, getArchivedProducts); // Move this up!

// GET: Find all products
router.get("/", getProducts); // e.g., /api/products

// Create a new product
router.post("/", authMiddleware, addProduct); // Authentication required for adding a product

// GET: Find a product by ID
router.get("/:id", findProductById); // e.g., /api/products/:id

// PUT: Update a product by ID
router.put("/:id", authMiddleware, updateProduct); // e.g., /api/products/:id

// DELETE: Delete a product by ID
router.delete("/:id", authMiddleware, deleteProduct); // e.g., /api/products/:id

router.post("/:id/review", addReview);

router.put("/:productId/archive", authMiddleware, toggleArchiveProduct);

export default router;
