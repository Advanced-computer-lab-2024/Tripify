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
    totalSales: {
      type: Number,
      required: true,
      default: 0, 
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
    // Add these new fields
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: {
      type: Date,
      default: null
    },
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Add this middleware to handle archive date
productSchema.pre('save', function(next) {
  if (this.isModified('isArchived') && this.isArchived) {
    this.archivedAt = new Date();
  } else if (this.isModified('isArchived') && !this.isArchived) {
    this.archivedAt = null;
    this.archivedBy = null;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;