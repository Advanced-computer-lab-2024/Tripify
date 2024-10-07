import mongoose from "mongoose";

const ticketPriceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["foreigner", "native", "student"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});



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
    ticketPrices: [ticketPriceSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    createdBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"TourismGovernor",
    }
  },
  { timestamps: true }
);



const HistoricalPlace = mongoose.model(
  "HistoricalPlace",
  historicalPlaceSchema
);

export default HistoricalPlace;
