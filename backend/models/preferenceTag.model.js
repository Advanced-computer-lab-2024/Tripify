import mongoose from "mongoose";

const preferenceTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["historic", "beach", "family", "shopping", "budget"],
      required: true,
    },
  },
  { timestamps: true }
);

const PreferenceTag = mongoose.model("PreferenceTag", preferenceTagSchema);
export default PreferenceTag;
