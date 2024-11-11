// product.route.js
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
  purchaseProduct,
  getTouristPurchases,
  reviewPurchase,
} from "../controllers/product.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

// Existing routes
router.get("/archived", authMiddleware, getArchivedProducts);
router.get("/", getProducts);
router.post("/", authMiddleware, addProduct);
router.get("/:id", findProductById);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.post("/:id/review", addReview);
router.put("/:productId/archive", authMiddleware, toggleArchiveProduct);

// New routes for purchasing and reviews
// Purchase routes
router.post("/purchase", authMiddleware, purchaseProduct);
router.get("/purchases/:touristId", authMiddleware, getTouristPurchases);
router.post("/purchases/:purchaseId/review", authMiddleware, reviewPurchase);

export default router;
