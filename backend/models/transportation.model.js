import mongoose from "mongoose";

const transportationSchema = new mongoose.Schema({
  advertiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertiser",
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["Car", "Van", "Bus", "Minibus", "Limousine"],
  },
  model: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  availabilityStart: {
    type: Date,
    required: true,
  },
  availabilityEnd: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  dropoffLocation: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ["available", "booked", "maintenance", "inactive"],
    default: "available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transportation = mongoose.model("Transportation", transportationSchema);
export default Transportation;
