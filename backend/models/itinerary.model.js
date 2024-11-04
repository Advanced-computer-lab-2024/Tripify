import mongoose from "mongoose";
import Activity from "./activity.model.js";
import PreferenceTag from "./preferenceTag.model.js"; // Import the PreferenceTag model

const itinerarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    timeline: [
      {
        activity: String,
        startTime: String,
        endTime: String,
      },
    ],
    language: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    availableDates: [
      {
        date: Date,
        availableTimes: [String],
      },
    ],
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      hearingImpaired: { type: Boolean, default: false },
      visuallyImpaired: { type: Boolean, default: false },
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourGuide",
      //   required: true,
    },
    // bookings: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Booking",
    //   },
    // ],
    isActive: {
      type: Boolean,
      default: true,
    },
    preferenceTags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PreferenceTag",
      },
    ],
    flagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Remove the 2dsphere index since we're no longer using GeoJSON
// itinerarySchema.index({
//   pickupLocation: "2dsphere",
//   dropoffLocation: "2dsphere",
// });

itinerarySchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    if (this.bookings && this.bookings.length > 0) {
      next(new Error("Cannot delete itinerary with existing bookings"));
    } else {
      next();
    }
  }
);

// Static method to create a new itinerary
itinerarySchema.statics.createItinerary = async function (
  itineraryData,
  tourGuideId
) {
  const itinerary = new this({
    ...itineraryData,
    createdBy: tourGuideId,
  });
  return await itinerary.save();
};

// Instance method to check if the itinerary can be deleted
itinerarySchema.methods.canDelete = function () {
  return this.bookings.length === 0;
};

const Itinerary = mongoose.model("Itinerary", itinerarySchema);

export default Itinerary;
