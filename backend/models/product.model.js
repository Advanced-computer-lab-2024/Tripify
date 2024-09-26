import mongoose from "mongoose";

export const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: String,
      enum: ["VTP", "External seller"],
      required: true,
    },
    ratings: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: String,
  },
  { timestamps: true }
);
