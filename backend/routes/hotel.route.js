import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import HotelBooking from "../models/HotelBooking.model.js";

dotenv.config();
const router = express.Router();

// Get token and cache it
let accessToken = null;
let tokenExpiration = null;

const getAccessToken = async () => {
  try {
    // Check if we have a valid token
    if (accessToken && tokenExpiration && new Date() < tokenExpiration) {
      return accessToken;
    }

    // Create URLSearchParams object for proper encoding
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.REACT_APP_AMADEUS_API_KEY);
    params.append("client_secret", process.env.REACT_APP_AMADEUS_API_SECRET);

    const response = await axios({
      method: "POST",
      url: "https://test.api.amadeus.com/v1/security/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: params,
    });

    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      tokenExpiration = new Date(
        new Date().getTime() + response.data.expires_in * 1000
      );
      console.log("New token generated:", accessToken);
      return accessToken;
    } else {
      throw new Error("Failed to get access token from Amadeus");
    }
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message
    );
    throw new Error("Authentication with Amadeus failed");
  }
};

router.post("/search", async (req, res) => {
  try {
    console.log("Search params:", req.body);
    const { cityCode, checkInDate, checkOutDate, adults, rooms } = req.body;

    if (!cityCode || !checkInDate || !checkOutDate || !adults || !rooms) {
      return res.status(400).json({
        error: [{ detail: "Missing required search parameters" }],
      });
    }

    // Get token
    const token = await getAccessToken();
    console.log("Using token:", token);

    // Get hotels in city
    const hotelsListResponse = await axios({
      method: "GET",
      url: "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        cityCode: cityCode.toUpperCase(),
        radius: 50,
        radiusUnit: "KM",
        hotelSource: "ALL",
      },
    });

    if (
      !hotelsListResponse.data.data ||
      hotelsListResponse.data.data.length === 0
    ) {
      return res.status(404).json({
        error: [{ detail: "No hotels found in the specified city" }],
      });
    }

    // Get hotel offers
    const allHotelIds = hotelsListResponse.data.data
      .slice(0, 20)
      .map((hotel) => hotel.hotelId);

    const offersResponse = await axios({
      method: "GET",
      url: "https://test.api.amadeus.com/v3/shopping/hotel-offers",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        hotelIds: allHotelIds.join(","),
        adults,
        roomQuantity: rooms,
        checkInDate,
        checkOutDate,
        currency: "USD",
        bestRateOnly: true,
      },
    });

    console.log("Hotel search successful");
    res.json(offersResponse.data);
  } catch (error) {
    console.error("Search error:", error.response?.data || error);

    if (error.response?.status === 401) {
      accessToken = null;
      tokenExpiration = null;
    }

    res.status(error.response?.status || 500).json({
      error: [
        {
          detail:
            error.response?.data?.errors?.[0]?.detail ||
            "Error searching hotels",
        },
      ],
    });
  }
});

// Book a hotel
router.post("/book", async (req, res) => {
  try {
    console.log("Booking params:", req.body);
    const {
      guests,
      userId,
      hotelDetails,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      totalPrice,
      offerId,
    } = req.body;

    // Validate required fields
    if (
      !guests ||
      !Array.isArray(guests) ||
      guests.length === 0 ||
      !userId ||
      !hotelDetails
    ) {
      return res.status(400).json({
        error: [{ detail: "Missing required booking parameters" }],
      });
    }

    // Create booking in database
    const hotelBooking = await HotelBooking.create({
      userId,
      hotelDetails,
      offerId, // This is now optional in the schema
      checkInDate,
      checkOutDate,
      guests,
      numberOfGuests,
      numberOfRooms,
      totalPrice,
      status: "confirmed",
    });

    res.json({
      success: true,
      data: {
        id: hotelBooking._id,
        booking: hotelBooking,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      error: [
        {
          detail: "Unable to complete booking. Please try again.",
        },
      ],
    });
  }
});

// Add test endpoint
router.get("/test-auth", async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({
      message: "Authentication successful",
      token_preview: `${token.substring(0, 10)}...`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
});
// In hotel.route.js
router.get("/bookings/:userId", async (req, res) => {
  try {
    console.log("Fetching hotel bookings for user:", req.params.userId);
    const bookings = await HotelBooking.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 }); // Sort by newest first

    console.log(`Found ${bookings.length} hotel bookings`);
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching hotel bookings:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching hotel bookings",
    });
  }
});
router.patch("/bookings/:bookingId/cancel", async (req, res) => {
  try {
    const booking = await HotelBooking.findByIdAndUpdate(
      req.params.bookingId,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling hotel booking:", error);
    res.status(500).json({
      success: false,
      error: "Error cancelling booking",
    });
  }
});

export default router;
