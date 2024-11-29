import express from "express";
import uploadMiddleware from "../utils/upload.js";
import {
  addProduct,
  getProducts,
  findProductById,
  updateProduct,
  deleteProduct,
  addReview,
} from "../controllers/product.controller.js";

const router = express.Router();

// POST: Create a new product
router.post("/", uploadMiddleware.fields([{ name: "productImage", maxCount: 5 }]), addProduct);

// GET: Find all products
router.get("/", getProducts); // e.g., /api/products

// GET: Find a product by ID
router.get("/:id", findProductById); // e.g., /api/products/:id

// PUT: Update a product by ID
router.put("/:id", uploadMiddleware.fields([{ name: "productImage", maxCount: 5 }]), updateProduct);

// DELETE: Delete a product by ID
router.delete("/:id", deleteProduct); // e.g., /api/products/:id

router.post("/:id", addReview);

export default router;
