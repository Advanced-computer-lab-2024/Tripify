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
    enum: ["processing", "on_the_way", "delivered", "cancelled"],
    default: "processing",
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  estimatedDeliveryDate: {
    type: Date,
    default: function () {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      return date;
    },
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
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
  trackingUpdates: [
    {
      status: {
        type: String,
        enum: [
          "order_placed",
          "processing",
          "on_the_way",
          "delivered",
          "cancelled",
        ], // Added cancelled
      },
      promoCode: {
        type: String,
        default: null,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      message: String,
    },
  ],
});

// Updated pre-save hook to handle cancelled status
productPurchaseSchema.pre("save", function (next) {
  if (this.isNew) {
    this.trackingUpdates.push({
      status: "order_placed",
      message: "Order has been placed successfully",
      timestamp: new Date(),
    });
  }

  if (this.isModified("status")) {
    const message =
      this.status === "cancelled"
        ? "Order has been cancelled and refunded"
        : `Order is ${this.status.replace("_", " ")}`;

    this.trackingUpdates.push({
      status: this.status,
      message: message,
      timestamp: new Date(),
    });
  }

  next();
});

const ProductPurchase = mongoose.model(
  "ProductPurchase",
  productPurchaseSchema
);
export default ProductPurchase;
