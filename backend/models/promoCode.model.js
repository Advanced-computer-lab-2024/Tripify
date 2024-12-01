import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Ensure the promo code is unique
    },
    discount: {
      type: Number, // Can be percentage or fixed amount
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Promo code is active by default
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1, // Default is 1 use
    },
    usedCount: {
      type: Number,
      default: 0, // Initially no usage
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Ensure the promo code doesn't expire and usedCount is not exceeded
promoCodeSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.expiryDate > now &&
    this.usedCount < this.usageLimit
  );
};

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;
