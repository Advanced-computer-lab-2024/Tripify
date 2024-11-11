import express from "express";
import {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerAccount,
  getAllSellers,
  deleteSellerAccount,
  changePassword,
} from "../controllers/seller.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadMiddleware from "../utils/upload.js";

const router = express.Router();

// Required files configuration for both registration and update
const documentUpload = uploadMiddleware.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'identificationDocument', maxCount: 1 }
]);

// Public routes (no authentication required)
router.post("/register", documentUpload, registerSeller);
router.post("/login", loginSeller);

// Protected routes (requires authentication)
// Profile routes
router.get("/profile/:username", authMiddleware, getSellerProfile);
router.put(
  "/profile/:id",
  authMiddleware,
  documentUpload,
  updateSellerAccount
);

// Password management
router.put("/change-password", authMiddleware, changePassword);

// Account management
router.delete("/profile/:id", authMiddleware, deleteSellerAccount);

// Admin routes (might need additional admin middleware)
router.get("/all", authMiddleware, getAllSellers);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      error: error.message
    });
  } else if (error) {
    return res.status(400).json({
      message: 'Invalid file type. Only images and PDFs are allowed',
      error: error.message
    });
  }
  next();
});

export default router;