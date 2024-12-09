import mongoose from "mongoose";

const flightBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },
    flightDetails: {
      id: {
        type: String,
        required: true,
      },
      itineraries: [
        {
          duration: String,
          segments: [
            {
              departure: {
                iataCode: String,
                at: Date,
              },
              arrival: {
                iataCode: String,
                at: Date,
              },
              carrierCode: String,
              number: String,
              duration: String,
            },
          ],
        },
      ],
      price: {
        currency: String,
        total: Number,
      },
    },
    passengers: [
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
        passport: {
          number: {
            type: String,
            required: true,
          },
          expiryDate: {
            type: Date,
            required: true,
          },
          issuingCountry: {
            type: String,
            required: true,
          },
          nationality: {
            type: String,
            required: true,
          },
        },
        dateOfBirth: {
          type: Date,
          required: true,
        },
      },
    ],
    numberOfPassengers: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    bookingReference: {
      type: String,
      default: () => `FLT-${Date.now()}`,
    },
  },
  { timestamps: true }
);

const FlightBooking = mongoose.model("FlightBooking", flightBookingSchema);

export default FlightBooking;
