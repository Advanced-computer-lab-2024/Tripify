import mongoose from "mongoose";

//TODO implement user authentication middleware

const activitySchema = new mongoose.Schema(
  
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
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
    tags: {
      type: [String],
    },
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
        enum: ["Point"], // 'Point' for GeoJSON
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true, // [longitude, latitude]
      },
    },
  },
  { timestamps: true }
);

activitySchema.index({ location: "2dsphere" });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
