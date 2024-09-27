import mongoose from "mongoose";

const activityCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: false,
      default: "Admin",
    },
    updatedBy: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ActivityCategory = mongoose.model(
  "ActivityCategory",
  activityCategorySchema
);

export default ActivityCategory;
