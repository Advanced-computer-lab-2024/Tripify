
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipient.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['Admin', 'Seller', 'Tourist', 'Advertiser', 'TourGuide']
    }
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    // required: true,
    enum: [
      'BOOKING_CONFIRMATION',
      'BOOKING_CANCELLATION',
      'PAYMENT_RECEIVED',
      'REVIEW_RECEIVED',
      'NEW_BOOKING',
      'BOOKING_REMINDER',
      'ADMIN_NOTICE',
      'PROFILE_UPDATE',
      'NEW_MESSAGE',
      'TOUR_ASSIGNED',
      'AD_APPROVAL',
      'SYSTEM_NOTIFICATION',
       'BIRTHDAY_PROMO',
       'Flag_Activity',
       'stock_alert'
    ]
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Booking', 'Payment', 'Review', 'Tour', 'Advertisement','PromoCode','Activity', null]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  link: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
});

// Index for faster queries
notificationSchema.index({ 'recipient.userId': 1, 'recipient.userType': 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;