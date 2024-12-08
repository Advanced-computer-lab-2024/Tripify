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
    min: [0, 'Price must be a positive number'], // Ensures price is non-negative
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
  },
  { timestamps: true }
);

// Add indexes for faster querying on `tags` and `createdBy`
historicalPlaceSchema.index({ tags: 1 });
historicalPlaceSchema.index({ createdBy: 1 });

// Create and export the HistoricalPlace model
const HistoricalPlace = mongoose.model("HistoricalPlace", historicalPlaceSchema);

export default HistoricalPlace;
