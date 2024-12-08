// routes/notificationRoutes.js
import express from 'express';

import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

// Get user's notifications with pagination
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread/count', getUnreadCount);

// Mark a single notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

// Create notifications (admin only)
router.post('/', createNotification);

export default router;