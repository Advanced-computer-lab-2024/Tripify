import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },
    bookingType: {
      type: String,
      required: true,
      enum: ["HistoricalPlace", "Itinerary", "Activity"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "bookingType",
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    review: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "attended"],
      default: "pending",
    }
  },
  { timestamps: true }
);

// Existing indexes
bookingSchema.index({ userId: 1, bookingDate: 1 });
bookingSchema.index({ bookingType: 1, itemId: 1, bookingDate: 1 });

// Add index for guide ratings
bookingSchema.index({ 'itemId': 1, 'bookingType': 1, 'rating': 1 });

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Only check for future dates if it's a new booking and not specifically marked for testing
  if (this.isNew && !this._allowPastDate && this.bookingDate < new Date()) {
    next(new Error('Cannot book for a past date'));
  }
  
  // Validate rating can only be set for attended itinerary bookings
  if (this.isModified('rating') && this.rating > 0) {
    if (this.bookingType !== 'Itinerary') {
      return next(new Error('Ratings can only be given for Itinerary bookings'));
    }
    if (this.status !== 'attended') {
      return next(new Error('Can only rate attended bookings'));
    }
  }
  
  next();
});

// Static method to add or update rating
bookingSchema.statics.addRating = async function(bookingId, rating, review) {
  const booking = await this.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  if (booking.bookingType !== 'Itinerary') {
    throw new Error('Can only rate Itinerary bookings');
  }
  
  if (booking.status !== 'attended') {
    throw new Error('Can only rate attended bookings');
  }
  
  booking.rating = rating;
  booking.review = review || '';
  
  await booking.save();
  return booking;
};

// Static method to get guide's ratings
bookingSchema.statics.getGuideRatings = async function(guideId) {
  const ratings = await this.aggregate([
    {
      $match: {
        bookingType: 'Itinerary',
        status: 'attended',
        rating: { $gt: 0 }
      }
    },
    {
      $lookup: {
        from: 'itineraries',
        localField: 'itemId',
        foreignField: '_id',
        as: 'itinerary'
      }
    },
    {
      $unwind: '$itinerary'
    },
    {
      $match: {
        'itinerary.guideId': new mongoose.Types.ObjectId(guideId)
      }
    },
    {
      $lookup: {
        from: 'tourists',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        rating: 1,
        review: 1,
        bookingDate: 1,
        'user.name': 1,
        createdAt: 1
      }
    },
    {
      $group: {
        _id: null,
        ratings: {
          $push: {
            rating: '$rating',
            review: '$review',
            bookingDate: '$bookingDate',
            userName: '$user.name',
            createdAt: '$createdAt'
          }
        },
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  return ratings[0] || { ratings: [], averageRating: 0, totalRatings: 0 };
};

// Static method to get paginated guide ratings
bookingSchema.statics.getGuideRatingsPaginated = async function(guideId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const ratings = await this.aggregate([
    {
      $match: {
        bookingType: 'Itinerary',
        status: 'attended',
        rating: { $gt: 0 }
      }
    },
    {
      $lookup: {
        from: 'itineraries',
        localField: 'itemId',
        foreignField: '_id',
        as: 'itinerary'
      }
    },
    {
      $unwind: '$itinerary'
    },
    {
      $match: {
        'itinerary.guideId': new mongoose.Types.ObjectId(guideId)
      }
    },
    {
      $lookup: {
        from: 'tourists',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    },
    {
      $project: {
        rating: 1,
        review: 1,
        bookingDate: 1,
        'user.name': 1,
        createdAt: 1
      }
    }
  ]);

  // Get total count for pagination
  const totalCount = await this.aggregate([
    {
      $match: {
        bookingType: 'Itinerary',
        status: 'attended',
        rating: { $gt: 0 }
      }
    },
    {
      $lookup: {
        from: 'itineraries',
        localField: 'itemId',
        foreignField: '_id',
        as: 'itinerary'
      }
    },
    {
      $unwind: '$itinerary'
    },
    {
      $match: {
        'itinerary.guideId': new mongoose.Types.ObjectId(guideId)
      }
    },
    {
      $count: 'total'
    }
  ]);

  return {
    ratings,
    total: totalCount[0]?.total || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCount[0]?.total || 0) / limit)
  };
};

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;