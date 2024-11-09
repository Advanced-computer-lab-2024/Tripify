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

bookingSchema.index({ userId: 1, bookingDate: 1 });
bookingSchema.index({ bookingType: 1, itemId: 1, bookingDate: 1 });

// Modified pre-save hook to allow past dates when explicitly set
bookingSchema.pre('save', function(next) {
  // Only check for future dates if it's a new booking and not specifically marked for testing
  if (this.isNew && !this._allowPastDate && this.bookingDate < new Date()) {
    next(new Error('Cannot book for a past date'));
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;