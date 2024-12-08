import mongoose from "mongoose";

// Ticket Price Schema
const ticketPriceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["foreigner", "native", "student"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be a positive number"], // Ensures price is non-negative
  },
});

// Historical Place Schema
const historicalPlaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    openingHours: {
      type: String,
      required: true,
    },
    ticketPrices: {
      type: [ticketPriceSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0; // Ensures there is at least one ticket price
        },
        message: "At least one ticket price is required",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        required: true, // Ensure tags are provided for each historical place
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourismGovernor",
      required: true, // Ensures the creator is mandatory
    },
    dailyCapacity: {
      type: Number,
      required: true,
      min: [1, "Daily capacity must be at least 1"],
      default: 100,
    },
  },
  { timestamps: true }
);

// Add indexes for faster querying on `tags` and `createdBy`
historicalPlaceSchema.index({ tags: 1 });
historicalPlaceSchema.index({ createdBy: 1 });

// Create and export the HistoricalPlace model
const HistoricalPlace = mongoose.model(
  "HistoricalPlace",
  historicalPlaceSchema
);

export default HistoricalPlace;

historicalPlaceSchema.statics.checkDailyAvailability = async function (
  placeId,
  date
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const place = await this.findById(placeId);
  if (!place) return { available: false, message: "Place not found" };

  const bookingCount = await mongoose.model("Booking").countDocuments({
    itemId: placeId,
    bookingType: "HistoricalPlace",
    bookingDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $ne: "cancelled" },
  });

  return {
    available: bookingCount < place.dailyCapacity,
    remainingSpots: place.dailyCapacity - bookingCount,
  };
};
