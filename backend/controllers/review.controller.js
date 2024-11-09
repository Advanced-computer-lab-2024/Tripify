// controllers/review.controller.js
import mongoose from 'mongoose';
import Review from '../models/review.model.js';
import TourGuide from '../models/tourguide.model.js';
import Product from '../models/product.model.js';
import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';  // Import the Event model


class ReviewController {
  // Create a new review
  static async createReview(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { reviewType, entityId, rating, comment, images } = req.body;
      const touristId = req.user._id;

      // Verify the entity exists and the tourist is eligible to review
      const verificationResult = await this.verifyReviewEligibility(
        touristId,
        reviewType,
        entityId
      );

      if (!verificationResult.isEligible) {
        return res.status(400).json({ error: verificationResult.message });
      }

      // Check for existing review
      const existingReview = await Review.findOne({
        tourist: touristId,
        reviewType,
        entityId
      });

      if (existingReview) {
        return res.status(400).json({ error: `You have already reviewed this ${reviewType}` });
      }

      // Create the review
      const review = new Review({
        tourist: touristId,
        reviewType,
        entityId,
        rating,
        comment,
        images,
        verificationStatus: {
          isVerified: true,
          verificationDate: new Date(),
          bookingReference: verificationResult.bookingId
        }
      });

      await review.save({ session });

      // Update entity's rating statistics
      await this.updateEntityRatings(reviewType, entityId, session);

      await session.commitTransaction();

      const populatedReview = await Review.findById(review._id)
        .populate('tourist', 'username')
        .populate('verificationStatus.bookingReference');

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: populatedReview
      });

    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ success: false, message: 'An error occurred during review creation' });
    } finally {
      session.endSession();
    }
  }

  // Get reviews for an entity
  static async getEntityReviews(req, res) {
    const { reviewType, entityId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      rating,
      verifiedOnly
    } = req.query;

    const query = {
      reviewType,
      entityId,
      status: 'approved'
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (verifiedOnly === 'true') {
      query['verificationStatus.isVerified'] = true;
    }

    try {
      const reviews = await Review.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('tourist', 'username')
        .lean();

      const total = await Review.countDocuments(query);

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while fetching reviews' });
    }
  }

  // Get review statistics for an entity
  static async getEntityReviewStats(req, res) {
    const { reviewType, entityId } = req.params;

    try {
      const stats = await Review.aggregate([
        {
          $match: {
            reviewType,
            entityId: new mongoose.Types.ObjectId(entityId),
            status: 'approved'
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      const distribution = stats[0]?.ratingDistribution.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

      res.json({
        success: true,
        data: {
          averageRating: stats[0]?.averageRating || 0,
          totalReviews: stats[0]?.totalReviews || 0,
          distribution
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while fetching review statistics' });
    }
  }

  // Update a review
  static async updateReview(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const { rating, comment, images } = req.body;

      const review = await Review.findOne({
        _id: id,
        tourist: req.user._id
      });

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
      }

      // Update fields
      if (rating) review.rating = rating;
      if (comment) review.comment = comment;
      if (images) review.images = images;

      review.status = 'pending'; // Reset for moderation
      await review.save({ session });

      // Update entity's rating statistics
      await this.updateEntityRatings(review.reviewType, review.entityId, session);

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });

    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ success: false, message: 'An error occurred during review update' });
    } finally {
      session.endSession();
    }
  }

  // Delete a review
  static async deleteReview(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;

      const review = await Review.findOne({
        _id: id,
        tourist: req.user._id
      });

      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
      }

      await review.deleteOne({ session });

      // Update entity's rating statistics
      await this.updateEntityRatings(review.reviewType, review.entityId, session);

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ success: false, message: 'An error occurred during review deletion' });
    } finally {
      session.endSession();
    }
  }

  // Toggle like on a review
  static async toggleLike(req, res) {
    const { id } = req.params;
    const touristId = req.user._id;

    try {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      const likeIndex = review.likes.indexOf(touristId);
      if (likeIndex === -1) {
        review.likes.push(touristId);
      } else {
        review.likes.splice(likeIndex, 1);
      }

      await review.save();

      res.json({
        success: true,
        message: `Review ${likeIndex === -1 ? 'liked' : 'unliked'} successfully`,
        data: { likes: review.likes.length }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while toggling like' });
    }
  }

  // Report a review
  // review.controller.js

// Get completed tour guides eligible for review
static async getCompletedTourGuides(req, res) {
  try {
    const touristId = req.user._id;

    // Assuming you want to fetch tour guides completed by the tourist
    const completedTourGuides = await Booking.find({
      tourist: touristId,
      reviewStatus: { $ne: 'reviewed' }, // Not yet reviewed
      status: 'completed', // Only completed bookings
      entityType: 'tourguide'
    }).populate('entityId', 'name'); // Assuming entityId is the tour guide reference

    res.json({
      success: true,
      data: completedTourGuides
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while fetching completed tour guides' });
  }
}


static async getCompletedEvents(req, res) {
  try {
    const touristId = req.user._id;

    // Fetch events completed by the tourist
    const completedEvents = await Booking.find({
      tourist: touristId,
      reviewStatus: { $ne: 'reviewed' },  // Not yet reviewed
      status: 'completed',  // Only completed bookings
      entityType: 'event'  // Filter for events
    }).populate('entityId', 'name');  // Assuming entityId is the event reference

    res.json({
      success: true,
      data: completedEvents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while fetching completed events' });
  }
}


// Get completed products eligible for review
static async getCompletedProducts(req, res) {
  try {
    const touristId = req.user._id;

    // Assuming you want to fetch products completed by the tourist
    const completedProducts = await Booking.find({
      tourist: touristId,
      reviewStatus: { $ne: 'reviewed' }, // Not yet reviewed
      status: 'completed', // Only completed bookings
      entityType: 'product'
    }).populate('entityId', 'name'); // Assuming entityId is the product reference

    res.json({
      success: true,
      data: completedProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while fetching completed products' });
  }
}

  static async reportReview(req, res) {
    const { id } = req.params;
    const { reason } = req.body;
    const touristId = req.user._id;

    try {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      const existingReport = review.flags.find(
        flag => flag.reportedBy.toString() === touristId.toString()
      );

      if (existingReport) {
        return res.status(400).json({ success: false, message: 'You have already reported this review' });
      }

      review.flags.push({
        reportedBy: touristId,
        reason
      });

      if (review.flags.length >= 3) {
        review.status = 'pending';
      }

      await review.save();

      res.json({
        success: true,
        message: 'Review reported successfully'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred while reporting the review' });
    }
  }

  // Helper Methods
  static async verifyReviewEligibility(touristId, reviewType, entityId) {
    const result = {
      isEligible: false,
      message: '',
      bookingId: null
    };
  
    const allowedReviewTypes = ['tourguide', 'product', 'event'];
    if (!allowedReviewTypes.includes(reviewType)) {
      result.message = 'Invalid review type';
      return result;
    }
  
    try {
      const entityModel = reviewType === 'tourguide' ? TourGuide : reviewType === 'product' ? Product : Event;
  
      const entity = await entityModel.findById(entityId);
      if (!entity) {
        result.message = 'Entity not found';
        return result;
      }
  
      const booking = await Booking.findOne({
        tourist: touristId,
        entityId,
        reviewStatus: { $ne: 'reviewed' },
        status: 'completed'
      });
  
      if (!booking) {
        result.message = 'No valid booking found for review';
        return result;
      }
  
      result.isEligible = true;
      result.bookingId = booking._id;
      return result;
    } catch (error) {
      result.message = 'An error occurred while verifying review eligibility';
      return result;
    }
  }
  

  // Update entity ratings based on the reviews
  static async getMyReviews(req, res) {
    try {
      const touristId = req.user._id;
      const {
        page = 1,
        limit = 10,
        sort = '-createdAt'
      } = req.query;

      const reviews = await Review.find({ tourist: touristId })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('entityId')
        .lean();

      const total = await Review.countDocuments({ tourist: touristId });

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching your reviews'
      });
    }
  }

  // Ensure all static methods are properly defined and exported
  static async verifyReviewEligibility(touristId, reviewType, entityId) {
    const result = {
      isEligible: false,
      message: '',
      bookingId: null
    };

    const allowedReviewTypes = ['tourguide', 'product', 'event'];
    if (!allowedReviewTypes.includes(reviewType)) {
      result.message = 'Invalid review type';
      return result;
    }

    try {
      const entityModel = reviewType === 'tourguide' ? TourGuide : 
                         reviewType === 'product' ? Product : 
                         reviewType === 'event' ? Event : null;

      const entity = await entityModel.findById(entityId);
      if (!entity) {
        result.message = 'Entity not found';
        return result;
      }

      const booking = await Booking.findOne({
        tourist: touristId,
        entityId,
        reviewStatus: { $ne: 'reviewed' },
        status: 'completed'
      });

      if (!booking) {
        result.message = 'No valid booking found for review';
        return result;
      }

      result.isEligible = true;
      result.bookingId = booking._id;
      return result;
    } catch (error) {
      result.message = 'An error occurred while verifying review eligibility';
      return result;
    }
  }

  static async updateEntityRatings(reviewType, entityId, session) {
    const entityModel =
      reviewType === 'tourguide' ? TourGuide :
      reviewType === 'product' ? Product :
      reviewType === 'event' ? Event : null;

    if (!entityModel) return;

    const entity = await entityModel.findById(entityId);
    if (!entity) return;

    const stats = await Review.aggregate([
      {
        $match: {
          reviewType,
          entityId: new mongoose.Types.ObjectId(entityId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      entity.averageRating = stats[0].averageRating;
      entity.totalReviews = stats[0].totalReviews;
      await entity.save({ session });
    }
  }
}

export default ReviewController;
