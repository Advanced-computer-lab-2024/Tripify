import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActivityCategory",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    discounts: {
      type: String,
    },
    bookingOpen: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser",
      required: true,
    },
    flagged: {
      type: Boolean,
      default: false,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1"],
      default: 1,
    },
    bookedCount: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

activitySchema.index({ location: "2dsphere" });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
activitySchema.methods.hasAvailableSpots = function () {
  return this.bookedCount < this.capacity;
};

activitySchema.methods.getRemainingSpots = function () {
  return this.capacity - this.bookedCount;
};
