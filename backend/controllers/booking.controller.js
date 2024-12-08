import Booking from "../models/booking.model.js";
import Activity from "../models/activity.model.js";
import HistoricalPlace from "../models/histroicalplace.model.js";
import Itinerary from "../models/itinerary.model.js";
import mongoose from "mongoose";

const validateBookingDate = async (eventItem, bookingType, requestedDate) => {
  console.log("Validating date:", {
    bookingType,
    requestedDate,
    requestedDateISO: requestedDate.toISOString(),
    eventItemDate: eventItem?.date,
    eventItemDateParsed: new Date(eventItem?.date),
  });

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  if (requestedDate < currentDate) {
    return {
      success: false,
      message: "Cannot book for past dates",
    };
  }

  switch (bookingType) {
    case "Activity":
      const activityDate = new Date(eventItem.date);
      activityDate.setHours(0, 0, 0, 0);

      // Convert both dates to UTC midnight for comparison
      const requestedUTC = new Date(
        Date.UTC(
          requestedDate.getFullYear(),
          requestedDate.getMonth(),
          requestedDate.getDate()
        )
      );

      const activityUTC = new Date(
        Date.UTC(
          activityDate.getFullYear(),
          activityDate.getMonth(),
          activityDate.getDate()
        )
      );

      console.log("Comparing dates:", {
        requestedUTC: requestedUTC.toISOString(),
        activityUTC: activityUTC.toISOString(),
        areEqual: requestedUTC.getTime() === activityUTC.getTime(),
      });

      if (requestedUTC.getTime() !== activityUTC.getTime()) {
        return {
          success: false,
          message: `This activity is only available on ${activityDate.toLocaleDateString(
            "en-GB"
          )}`,
          debug: {
            requestedDate: requestedUTC.toISOString(),
            activityDate: activityUTC.toISOString(),
          },
        };
      }
      break;

    case "Itinerary":
      // For itineraries, check if the date is in availableDates
      const isAvailableDate = eventItem.availableDates?.some((dateObj) => {
        const availableDate = new Date(dateObj.date);
        availableDate.setHours(0, 0, 0, 0);
        return availableDate.getTime() === requestedDate.getTime();
      });

      // Commented out date validation for now
      // if (!isAvailableDate) {
      //   return {
      //     success: false,
      //     message: 'Selected date is not available for this itinerary',
      //   };
      // }
      break;

    case "HistoricalPlace":
      // For historical places, check opening hours or specific available dates if needed
      break;
  }

  return { success: true };
};

export const bookingController = {
  createBooking: async (req, res) => {
    try {
      const { userId, bookingType, itemId, bookingDate } = req.body;
      console.log("Received booking request:", {
        originalBookingDate: bookingDate,
        parsedDate: new Date(bookingDate),
        isoString: new Date(bookingDate).toISOString(),
        localString: new Date(bookingDate).toLocaleDateString(),
      });

      // Only validate that the item exists and the date is valid
      let eventItem;
      switch (bookingType) {
        case "Activity":
          eventItem = await Activity.findById(itemId);
          console.log("Activity details:", {
            activityDate: eventItem?.date,
            parsedActivityDate: new Date(eventItem?.date),
            activityISOString: new Date(eventItem?.date).toISOString(),
            activityLocalString: new Date(eventItem?.date).toLocaleDateString(),
          });
          break;
        case "HistoricalPlace":
          eventItem = await HistoricalPlace.findById(itemId);
          break;
        case "Itinerary":
          eventItem = await Itinerary.findById(itemId);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid booking type",
          });
      }

      if (!eventItem) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      // Validate booking date
      const dateValidation = await validateBookingDate(
        eventItem,
        bookingType,
        new Date(bookingDate)
      );
      if (!dateValidation.success) {
        return res.status(400).json({
          success: false,
          message: dateValidation.message,
        });
      }

      // Create the booking without any capacity checks
      const booking = await Booking.create({
        userId,
        bookingType,
        itemId,
        bookingDate,
        status: "confirmed",
      });

      res.status(201).json({
        success: true,
        data: booking,
        message: "Booking confirmed successfully",
      });
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error creating booking",
      });
    }
  },
  getUserBookings: async (req, res) => {
    try {
      const { userId } = req.params;
      const bookings = await Booking.find({ userId })
        .populate("itemId")
        .sort("-bookingDate");

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
  getGuideSalesReport: async (req, res) => {
    try {
      const { guideId } = req.params;

      const bookings = await Booking.find({
        bookingType: "Itinerary",
        status: { $in: ["confirmed", "attended"] },
      })
        .populate({
          path: "itemId",
          match: { createdBy: guideId },
          select: "totalPrice name createdBy",
        })
        .sort("-bookingDate");

      // Filter out bookings where itemId is null (not created by this guide)
      const validBookings = bookings.filter((booking) => booking.itemId);

      // Calculate totals including platform fee
      const salesData = validBookings.map((booking) => ({
        ...booking.toObject(),
        platformFee: booking.itemId.totalPrice * 0.1,
        netAmount: booking.itemId.totalPrice * 0.9,
      }));

      const summary = {
        totalRevenue: validBookings.reduce(
          (sum, b) => sum + b.itemId.totalPrice,
          0
        ),
        platformFees: validBookings.reduce(
          (sum, b) => sum + b.itemId.totalPrice * 0.1,
          0
        ),
        netRevenue: validBookings.reduce(
          (sum, b) => sum + b.itemId.totalPrice * 0.9,
          0
        ),
        totalBookings: validBookings.length,
      };

      res.status(200).json({
        success: true,
        data: {
          bookings: salesData,
          summary,
        },
      });
    } catch (error) {
      console.error("Error fetching guide sales:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error fetching sales data",
      });
    }
  },

  getUpcomingBookings: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const bookings = await Booking.find({
        userId,
        bookingDate: { $gte: currentDate },
        status: { $ne: "cancelled" },
      })
        .populate("itemId")
        .sort("bookingDate");

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  getItemBookings: async (req, res) => {
    try {
      const { bookingType, itemId } = req.params;
      const bookings = await Booking.find({
        bookingType,
        itemId,
        status: { $ne: "cancelled" },
      })
        .sort("-bookingDate")
        .populate("userId", "name email");

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  updateBookingStatus: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      if (!["confirmed", "cancelled", "attended"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
      ).populate("itemId");

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const currentDate = new Date();
      const bookingDate = new Date(booking.bookingDate);
      const timeDifference = bookingDate.getTime() - currentDate.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24);

      if (daysDifference < 1) {
        return res.status(400).json({
          success: false,
          message:
            "Cancellation is not allowed less than 24 hours before the booking",
        });
      }

      booking.status = "cancelled";
      await booking.save();

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  checkAvailability: async (req, res) => {
    try {
      const { bookingType, itemId, bookingDate } = req.query;

      if (!bookingType || !itemId || !bookingDate) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters",
        });
      }

      const requestedDate = new Date(bookingDate);
      requestedDate.setHours(0, 0, 0, 0);

      let eventItem;
      switch (bookingType) {
        case "Activity":
          eventItem = await Activity.findById(itemId);
          console.log("Activity details:", {
            activityDate: eventItem?.date,
            parsedActivityDate: new Date(eventItem?.date),
            activityISOString: new Date(eventItem?.date).toISOString(),
            activityLocalString: new Date(eventItem?.date).toLocaleDateString(),
          });
          break;
        case "HistoricalPlace":
          eventItem = await HistoricalPlace.findById(itemId);
          break;
        case "Itinerary":
          eventItem = await Itinerary.findById(itemId);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid booking type",
          });
      }

      if (!eventItem) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      const dateValidation = await validateBookingDate(
        eventItem,
        bookingType,
        requestedDate
      );
      console.log("Date validation result:", dateValidation);

      if (!dateValidation.success) {
        return res.status(400).json({
          success: false,
          message: dateValidation.message,
          available: false,
        });
      }

      const startDate = new Date(requestedDate);
      const endDate = new Date(requestedDate);
      endDate.setHours(23, 59, 59, 999);

      const existingBookings = await Booking.find({
        bookingType,
        itemId,
        bookingDate: {
          $gte: startDate,
          $lte: endDate,
        },
        status: { $ne: "cancelled" },
      });

      res.status(200).json({
        success: true,
        available: existingBookings.length === 0,
        existingBookings: existingBookings.length,
      });
    } catch (error) {
      console.error("Availability check error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error checking availability",
      });
    }
  },

  addRating: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { rating, review } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const booking = await Booking.findById(bookingId).populate({
        path: "itemId",
        populate: {
          path: "createdBy",
          model: "TourGuide",
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (
        !["Itinerary", "HistoricalPlace", "Activity"].includes(
          booking.bookingType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Ratings can only be given for Itinerary, Historical Place, or Activity bookings",
        });
      }

      if (booking.status !== "attended") {
        return res.status(400).json({
          success: false,
          message: "Can only rate attended bookings",
        });
      }

      if (booking.rating > 0) {
        return res.status(400).json({
          success: false,
          message: "This booking has already been rated",
        });
      }

      booking.rating = rating;
      booking.review = review || "";
      await booking.save();

      let responseData = {
        success: true,
        data: {
          booking,
        },
      };

      switch (booking.bookingType) {
        case "Itinerary":
          const guideRatings = await Booking.getGuideRatings(
            booking.itemId.createdBy._id
          );
          responseData.data.guideStats = {
            averageRating: guideRatings.averageRating,
            totalRatings: guideRatings.totalRatings,
          };
          break;

        case "HistoricalPlace":
          const placeRatings = await Booking.getItemRatings(
            booking.itemId._id,
            "HistoricalPlace"
          );
          responseData.data.placeStats = {
            averageRating: placeRatings.averageRating,
            totalRatings: placeRatings.totalRatings,
          };
          break;

        case "Activity":
          const activityRatings = await Booking.getItemRatings(
            booking.itemId._id,
            "Activity"
          );
          responseData.data.activityStats = {
            averageRating: activityRatings.averageRating,
            totalRatings: activityRatings.totalRatings,
          };
          break;
      }

      res.status(200).json(responseData);
    } catch (error) {
      console.error("Error adding rating:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error adding rating",
      });
    }
  },

  getActivityRatings: async (req, res) => {
    try {
      const { activityId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const ratingsData = await Booking.getItemRatingsPaginated(
        activityId,
        "Activity",
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: ratingsData,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  getHistoricalPlaceRatings: async (req, res) => {
    try {
      const { placeId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const ratingsData = await Booking.getItemRatingsPaginated(
        placeId,
        "HistoricalPlace",
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: ratingsData,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  getGuideRatings: async (req, res) => {
    try {
      const { guideId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const ratingsData = await Booking.getGuideRatingsPaginated(
        guideId,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: ratingsData,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  getGuideRatingStats: async (req, res) => {
    try {
      const { guideId } = req.params;

      const ratings = await Booking.aggregate([
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
            "itinerary.guideId": new mongoose.Types.ObjectId(guideId),
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
            ratingDistribution: {
              $push: "$rating",
            },
          },
        },
        {
          $project: {
            _id: 0,
            averageRating: { $round: ["$averageRating", 1] },
            totalRatings: 1,
            ratingDistribution: {
              1: {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 1] },
                  },
                },
              },
              2: {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 2] },
                  },
                },
              },
              3: {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 3] },
                  },
                },
              },
              4: {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 4] },
                  },
                },
              },
              5: {
                $size: {
                  $filter: {
                    input: "$ratingDistribution",
                    cond: { $eq: ["$$this", 5] },
                  },
                },
              },
            },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: ratings[0] || {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  updateRating: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { rating, review } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const booking = await Booking.findById(bookingId).populate({
        path: "itemId",
        populate: {
          path: "createdBy",
          model: "TourGuide",
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.rating === 0) {
        return res.status(400).json({
          success: false,
          message: "No existing rating to update",
        });
      }

      booking.rating = rating;
      booking.review = review || booking.review;
      await booking.save();

      let responseData = {
        success: true,
        data: {
          booking,
        },
      };

      // Get updated stats based on booking type
      switch (booking.bookingType) {
        case "Itinerary":
          const guideRatings = await Booking.getGuideRatings(
            booking.itemId.createdBy._id
          );
          responseData.data.guideStats = guideRatings;
          break;
        case "HistoricalPlace":
          const placeRatings = await Booking.getItemRatings(
            booking.itemId._id,
            "HistoricalPlace"
          );
          responseData.data.placeStats = placeRatings;
          break;
        case "Activity":
          const activityRatings = await Booking.getItemRatings(
            booking.itemId._id,
            "Activity"
          );
          responseData.data.activityStats = activityRatings;
          break;
      }

      res.status(200).json(responseData);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

// Add this to your existing booking.controller.js
const checkAvailability = async (itemId, bookingType, bookingDate) => {
  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(bookingDate);
  endOfDay.setHours(23, 59, 59, 999);

  switch (bookingType) {
    case "Activity": {
      const activity = await Activity.findById(itemId);
      if (!activity) return { available: false, message: "Activity not found" };

      // Always return available=true for unlimited bookings
      return {
        available: true,
        remainingSpots: Infinity,
        message: "Available for booking",
      };
    }

    case "HistoricalPlace": {
      const place = await HistoricalPlace.findById(itemId);
      if (!place)
        return { available: false, message: "Historical place not found" };

      // Always return available=true for unlimited bookings
      return {
        available: true,
        remainingSpots: Infinity,
        message: "Available for booking",
      };
    }

    case "Itinerary": {
      const itinerary = await Itinerary.findById(itemId);
      if (!itinerary)
        return { available: false, message: "Itinerary not found" };

      // Only check date availability for itineraries, no capacity limit
      const isAvailableDate = itinerary.availableDates?.some((dateObj) => {
        const availableDate = new Date(dateObj.date);
        availableDate.setHours(0, 0, 0, 0);
        return availableDate.getTime() === startOfDay.getTime();
      });

      return {
        available: isAvailableDate,
        remainingSpots: Infinity,
        message: isAvailableDate
          ? "Available for booking"
          : "Date not available for this itinerary",
      };
    }

    default:
      return { available: false, message: "Invalid booking type" };
  }
};

// Export the function to be used in the controller
export const validateAndCheckAvailability = async (
  eventItem,
  bookingType,
  bookingDate
) => {
  // Only validate the basic booking date
  const dateValidation = await validateBookingDate(
    eventItem,
    bookingType,
    bookingDate
  );
  if (!dateValidation.success) {
    return dateValidation;
  }

  // Always return success for availability
  return {
    success: true,
    message: "Available for booking",
    remainingSpots: Infinity,
  };
};
