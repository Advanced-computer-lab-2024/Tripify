import express from "express";
import {
  registerAdmin,
  loginAdmin,
  listAllUsers,
  deleteUser,
  getAdminProfile,
  changePassword,
} from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected admin routes (requires authentication and admin role)
router.get("/profile", authMiddleware, adminAuthMiddleware, getAdminProfile);
router.get("/users", authMiddleware, adminAuthMiddleware, listAllUsers);
router.delete("/users", authMiddleware, adminAuthMiddleware, deleteUser);
router.put(
  "/change-password",
  authMiddleware,
  adminAuthMiddleware,
  changePassword
);

export default router;
