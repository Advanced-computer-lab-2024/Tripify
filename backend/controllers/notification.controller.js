// controllers/notificationController.js
import mongoose from 'mongoose';
import Notification from '../models/notification.model.js';


// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false, userId, userType } = req.query;

    console.log('Fetching notifications with params:', { userId, userType, page, limit, unreadOnly });

    // Ensure userId is a valid ObjectId
    const query = {
      'recipient.userId': new mongoose.Types.ObjectId(userId),
      'recipient.userType': userType
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // First, let's check if any notifications exist for this user
    const totalCheck = await Notification.countDocuments(query);
    console.log('Total notifications found:', totalCheck);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    console.log('Notifications retrieved:', notifications.length);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId, userType } = req.query;
    
    console.log('Getting unread count for:', { userId, userType });

    const query = {
      'recipient.userId': new mongoose.Types.ObjectId(userId),
      'recipient.userType': userType,
      isRead: false
    };

    console.log('Unread count query:', JSON.stringify(query, null, 2));

    const count = await Notification.countDocuments(query);
    console.log('Unread count:', count);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.query;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Verify the notification belongs to the user
    if (notification.recipient.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this notification'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId, userType } = req.query;

    await Notification.updateMany(
      {
        'recipient.userId': userId,
        'recipient.userType': userType,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.query;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Verify the notification belongs to the user
    if (notification.recipient.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this notification'
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create a new notification (admin only)
export const createNotification = async (req, res) => {
  try {
    const { recipients, title, message, type, priority, link, expiresAt } = req.body;

    if (!Array.isArray(recipients)) {
      return res.status(400).json({
        success: false,
        message: 'Recipients must be an array'
      });
    }

    const notifications = await Promise.all(
      recipients.map(recipient => {
        const newNotification = new Notification({
          recipient: {
            userId: recipient.userId,
            userType: recipient.userType
          },
          title,
          message,
          type,
          priority,
          link,
          expiresAt
        });
        return newNotification.save();
      })
    );

    res.status(201).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notifications',
      error: error.message
    });
  }
};

export default {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};