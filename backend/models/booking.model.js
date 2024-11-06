import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Who made the booking
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },

    // What type of item was booked
    bookingType: {
      type: String,
      required: true,
      enum: ["HistoricalPlace", "Itinerary", "Activity"],
    },
    
    // Reference to the booked item
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "bookingType",
    },

    // Date of the booking
    bookingDate: {
      type: Date,
      required: true,
    },

    // Basic status tracking
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    }
  },
  { timestamps: true }
);

// Indexes for common queries
bookingSchema.index({ userId: 1, bookingDate: 1 });
bookingSchema.index({ bookingType: 1, itemId: 1, bookingDate: 1 });

// Prevent booking dates in the past
bookingSchema.pre('save', function(next) {
  if (this.bookingDate < new Date()) {
    next(new Error('Cannot book for a past date'));
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;