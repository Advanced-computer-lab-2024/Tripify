import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },
    hotelDetails: {
      hotelId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      cityCode: {
        type: String,
        required: true,
      },
      rating: Number,
    },
    // Make offerId optional
    offerId: {
      type: String,
      required: false,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    guests: [
      {
        name: {
          title: String,
          firstName: String,
          lastName: String,
        },
        contact: {
          phone: String,
          email: String,
        },
      },
    ],
    numberOfGuests: {
      type: Number,
      required: true,
    },
    numberOfRooms: {
      type: Number,
      required: true,
    },
    totalPrice: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    bookingReference: String,
  },
  { timestamps: true }
);

const HotelBooking = mongoose.model("HotelBooking", hotelBookingSchema);
export default HotelBooking;
