import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewerName: { type: mongoose.Schema.Types.ObjectId, ref: "Tourist" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  // isVerified: {
  //   type: Boolean,
  //   default: false
  // }
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
    productImage: [fileSchema],
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("isArchived") && this.isArchived) {
    this.archivedAt = new Date();
  } else if (this.isModified("isArchived") && !this.isArchived) {
    this.archivedAt = null;
    this.archivedBy = null;
  }
  next();
});


const Product = mongoose.model("Product", productSchema);

export default Product;
