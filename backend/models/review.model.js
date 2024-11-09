// models/review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['TourGuide', 'event', 'product'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reviewType',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
    trim: true
  },
  images: [{
    imageUrl: String,
    caption: String
  }],
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    bookingReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist'
  }],
  flags: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tourist'
    },
    reason: {
      type: String,
      required: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ tourist: 1, reviewType: 1, entityId: 1 }, { unique: true });

// Indexes for common queries
reviewSchema.index({ reviewType: 1, entityId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;