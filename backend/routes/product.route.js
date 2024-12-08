import express from "express";
import uploadMiddleware from "../utils/upload.js";
import {
  addProduct,
  getProducts,
  findProductById,
  updateProduct,
  deleteProduct,
  addReview,
  purchaseProduct,
  getUserPurchases,
  addPurchaseReview,
  toggleArchiveProduct,
  getArchivedProducts,
  getSellerSales,
  cancelOrder,
  validatePromoCode,
  sendStockAlert
} from "../controllers/product.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/archived", getArchivedProducts);

// Existing routes
router.post(
  "/",
  uploadMiddleware.fields([{ name: "productImage", maxCount: 5 }]),
  addProduct
);

router.get("/:id", findProductById);
router.put(
  "/:id",
  uploadMiddleware.fields([{ name: "productImage", maxCount: 5 }]),
  updateProduct
);
router.delete("/:id", deleteProduct);
router.post("/:id/review", addReview);

// New purchase-related routes
router.post("/purchase", purchaseProduct);
router.get("/purchases/:userId", getUserPurchases);
router.post("/purchases/:purchaseId/review", addPurchaseReview);

router.put("/archive/:productId/", toggleArchiveProduct);
// Add this to product.route.js
router.get("/seller-sales/:sellerId", authMiddleware, getSellerSales);
router.post("/purchases/:purchaseId/cancel", authMiddleware, cancelOrder);
router.post("/validate-promo", validatePromoCode);
router.post("/stock-alert", sendStockAlert);
export default router;
