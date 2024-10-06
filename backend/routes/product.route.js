// backend/routes/product.route.js
import express from "express";
import {
  addProduct,
  getProducts,
  findProductById,
  updateProduct,
  deleteProduct,
  addReview,
} from "../controllers/product.controller.js"; // Ensure correct import path

const router = express.Router();

// POST: Create a new product
router.post("/", addProduct);

// GET: Find all products
router.get("/", getProducts); // e.g., /api/products

// GET: Find a product by ID
router.get("/:id", findProductById); // e.g., /api/products/:id

// PUT: Update a product by ID
router.put("/:id", updateProduct); // e.g., /api/products/:id

// DELETE: Delete a product by ID
router.delete("/:id", deleteProduct); // e.g., /api/products/:id

router.post("/:id", addReview);

export default router;
