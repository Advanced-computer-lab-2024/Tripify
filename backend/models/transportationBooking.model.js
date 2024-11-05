import mongoose from "mongoose";

const transportationBookingSchema = new mongoose.Schema({
  transportationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transportation",
    required: true,
  },
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tourist",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TransportationBooking = mongoose.model(
  "TransportationBooking",
  transportationBookingSchema
);
export default TransportationBooking;
