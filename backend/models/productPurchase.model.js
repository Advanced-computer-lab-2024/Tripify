// models/productPurchase.model.js
import mongoose from "mongoose";

const productPurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tourist",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "cancelled"],
    default: "completed",
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    date: Date,
  },
});

const ProductPurchase = mongoose.model(
  "ProductPurchase",
  productPurchaseSchema
);
export default ProductPurchase;
