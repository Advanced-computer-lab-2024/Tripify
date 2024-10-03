import mongoose from "mongoose";

const preferenceTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const PreferenceTag = mongoose.model("PreferenceTag", preferenceTagSchema);
export default PreferenceTag;
