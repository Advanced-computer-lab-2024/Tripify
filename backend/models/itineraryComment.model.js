import mongoose from "mongoose";

const itineraryCommentSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tourist",
    required: true,
  },
  itinerary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Itinerary",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ItineraryComment = mongoose.model(
  "ItineraryComment",
  itineraryCommentSchema
);
export default ItineraryComment;
