import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    seller: {
      type: String,
      enum: ["VTP", "External seller"],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    review: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
