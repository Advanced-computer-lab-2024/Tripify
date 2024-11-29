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
} from "../controllers/product.controller.js";

const router = express.Router();

// Existing routes
router.post(
  "/",
  uploadMiddleware.fields([{ name: "productImage", maxCount: 5 }]),
  addProduct
);
router.get("/", getProducts);
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

export default router;
