import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewerName: { type: mongoose.Schema.Types.ObjectId, ref: "Tourist" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

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
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
