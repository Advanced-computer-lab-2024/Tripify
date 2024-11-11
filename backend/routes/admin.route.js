import express from 'express';
import { 
    registerAdmin,
    loginAdmin,
    listAllUsers,
    deleteUser,
    getAdminProfile,
    changeAdminPassword,
    resetPassword,
    getPendingApprovals,          // New imports for approvals
    updateApprovalStatus,
    getApprovalStatistics
} from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/reset-password', resetPassword); // Public route for resetting password

// Protected admin routes (requires authentication and admin role)
router.get('/profile', authMiddleware, adminAuthMiddleware, getAdminProfile);
router.get('/users', authMiddleware, adminAuthMiddleware, listAllUsers);
router.delete('/users', authMiddleware, adminAuthMiddleware, deleteUser);
router.put('/change-password', authMiddleware, adminAuthMiddleware, changeAdminPassword); // Route for changing password

// Approval management routes (requires authentication and admin role)
router.get('/approvals/pending', authMiddleware, adminAuthMiddleware, getPendingApprovals);
router.put('/approvals/update', authMiddleware, adminAuthMiddleware, updateApprovalStatus);
router.get('/approvals/statistics', authMiddleware, adminAuthMiddleware, getApprovalStatistics);

export default router;
