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
      default: 0,
      min: 0,
      max: 5,
    },
    review: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "attended"],
      default: "pending",
    },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourGuide",
      // isrequired: true,
    },
  },
  { timestamps: true }
);

// Static method to get ratings for any bookable item
bookingSchema.statics.getItemRatings = async function (itemId, bookingType) {
  try {
    const ratings = await this.aggregate([
      {
        $match: {
          bookingType: bookingType,
          itemId: new mongoose.Types.ObjectId(itemId),
          status: "attended",
          rating: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ["$averageRating", 1] },
          totalRatings: 1,
        },
      },
    ]);

    return ratings[0] || { averageRating: 0, totalRatings: 0 };
  } catch (error) {
    console.error("Error calculating item ratings:", error);
    throw error;
  }
};

// Static method to get paginated ratings for a specific item
bookingSchema.statics.getItemRatingsPaginated = async function (
  itemId,
  bookingType,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  try {
    const [ratings, totalCount] = await Promise.all([
      this.find({
        itemId,
        bookingType,
        status: "attended",
        rating: { $gt: 0 },
      })
        .populate("userId", "username")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .select("rating review createdAt userId"),

      this.countDocuments({
        itemId,
        bookingType,
        status: "attended",
        rating: { $gt: 0 },
      }),
    ]);

    const stats = await this.getItemRatings(itemId, bookingType);

    return {
      ratings,
      totalCount,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error getting paginated ratings:", error);
    throw error;
  }
};

// Static method to get guide ratings
bookingSchema.statics.getGuideRatings = async function (guideId) {
  try {
    const ratings = await this.aggregate([
      {
        $match: {
          bookingType: "Itinerary",
          status: "attended",
          rating: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "itineraries",
          localField: "itemId",
          foreignField: "_id",
          as: "itinerary",
        },
      },
      {
        $unwind: "$itinerary",
      },
      {
        $match: {
          "itinerary.createdBy": new mongoose.Types.ObjectId(guideId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ["$averageRating", 1] },
          totalRatings: 1,
        },
      },
    ]);

    return ratings[0] || { averageRating: 0, totalRatings: 0 };
  } catch (error) {
    console.error("Error calculating guide ratings:", error);
    throw error;
  }
};

// Pre-save middleware to set guideId from Itinerary
bookingSchema.pre("save", async function (next) {
  try {
    if (this.bookingType === "Itinerary" && !this.guideId) {
      const Itinerary = mongoose.model("Itinerary");
      const itinerary = await Itinerary.findById(this.itemId);
      if (itinerary) {
        this.guideId = itinerary.createdBy;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
