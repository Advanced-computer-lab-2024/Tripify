import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import FlightBooking from "../models/FlightBooking.model.js"; // Make sure to create this model

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
    params.append("client_id", process.env.REACT_APP_AMADEUS_API_KEY); // Use env variable
    params.append("client_secret", process.env.REACT_APP_AMADEUS_API_SECRET); // Use env variable

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
      console.log("New token generated:", accessToken); // For debugging
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
    console.log("Search params:", req.body); // For debugging

    // Validate required fields
    const { origin, destination, departureDate, adults } = req.body;
    if (!origin || !destination || !departureDate || !adults) {
      return res.status(400).json({
        error: [{ detail: "Missing required search parameters" }],
      });
    }

    // Get token
    const token = await getAccessToken();
    console.log("Using token:", token); // For debugging

    // Make search request
    const searchResponse = await axios({
      method: "GET",
      url: "https://test.api.amadeus.com/v2/shopping/flight-offers",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: adults,
        max: 5,
        currencyCode: "USD", // Add currency code
      },
    });

    // Log successful response
    console.log("Amadeus search successful");
    res.json(searchResponse.data);
  } catch (error) {
    console.error("Search error:", error.response?.data || error.message);

    // Handle different types of errors
    if (error.response?.status === 401) {
      // Clear cached token on authentication errors
      accessToken = null;
      tokenExpiration = null;
      res.status(401).json({
        error: [{ detail: "Authentication failed. Please try again." }],
      });
    } else if (error.response?.data?.errors) {
      res.status(error.response.status).json({
        error: error.response.data.errors,
      });
    } else {
      res.status(500).json({
        error: [{ detail: "Error searching flights. Please try again later." }],
      });
    }
  }
});

// Add a test endpoint to verify credentials
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

// 1. Price verification endpoint
router.post("/verify-price", async (req, res) => {
  try {
    const { flightOffers } = req.body;
    if (!flightOffers) {
      return res.status(400).json({
        error: [{ detail: "Flight offer data is required" }],
      });
    }

    const token = await getAccessToken();

    const response = await axios({
      method: "POST",
      url: "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flightOffers],
        },
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Price verification error:", error.response?.data || error);
    res.status(500).json({
      error: [{ detail: "Error verifying price" }],
    });
  }
});

// 2. Create booking endpoint

// routes/flight.route.js
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Helper function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/book", async (req, res) => {
  let retryCount = 0;

  const attemptBooking = async () => {
    try {
      const { flightOffer, travelers } = req.body;
      const token = await getAccessToken();

      // 1. First validate the flight offer is still available
      const validateResponse = await axios({
        method: "POST",
        url: "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          data: {
            type: "flight-offers-pricing",
            flightOffers: [flightOffer],
          },
        },
      });

      console.log("Price validation successful");

      // 2. Initialize booking process
      const bookingData = {
        data: {
          type: "flight-order",
          flightOffers: [validateResponse.data.data.flightOffers[0]],
          travelers: travelers,
          remarks: {
            general: [
              {
                subType: "GENERAL_MISCELLANEOUS",
                text: "TEST BOOKING DO NOT TICKET",
              },
            ],
          },
          contacts: [
            {
              addresseeName: {
                firstName: travelers[0].name.firstName,
                lastName: travelers[0].name.lastName,
              },
              purpose: "STANDARD",
              phones: travelers[0].contact.phones,
              emailAddress: travelers[0].contact.emailAddress,
              address: {
                lines: ["123 Test Street"],
                postalCode: "12345",
                countryCode: "US",
                cityName: "Test City",
              },
            },
          ],
        },
      };

      console.log("Attempting to create booking...");

      // 3. Create the booking
      const bookingResponse = await axios({
        method: "POST",
        url: "https://test.api.amadeus.com/v1/booking/flight-orders",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: bookingData,
      });

      console.log("Booking successful");
      return bookingResponse.data;
    } catch (error) {
      console.error("Booking attempt failed:", {
        attempt: retryCount + 1,
        error: error.response?.data || error.message,
      });

      if (error.response?.status === 500) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying booking attempt ${retryCount}...`);
          await delay(RETRY_DELAY);
          return attemptBooking();
        }
      }

      // If we get here, either we've exhausted retries or it's a non-500 error
      throw error;
    }
  };

  try {
    const result = await attemptBooking();
    res.json(result);
  } catch (error) {
    console.error("Final booking error:", error.response?.data || error);

    // Handle different error types
    if (error.response?.status === 400) {
      res.status(400).json({
        errors: [
          {
            status: 400,
            code: "INVALID_REQUEST",
            title: "Invalid Request",
            detail: "Please check your booking details and try again.",
          },
        ],
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({
        errors: [
          {
            status: 404,
            code: "FLIGHT_NOT_FOUND",
            title: "Flight Not Available",
            detail:
              "The selected flight is no longer available. Please search for new flights.",
          },
        ],
      });
    } else {
      res.status(error.response?.status || 500).json({
        errors: [
          {
            status: error.response?.status || 500,
            code: "BOOKING_ERROR",
            title: "Booking Failed",
            detail: "Unable to complete booking. Please try again later.",
          },
        ],
      });
    }
  }
});

// Update the verify-price endpoint as well
router.post("/verify-price", async (req, res) => {
  try {
    const { flightOffers } = req.body;
    const token = await getAccessToken();

    console.log("Verifying price for flight offer:", flightOffers.id);

    const response = await axios({
      method: "POST",
      url: "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flightOffers],
        },
      },
    });

    console.log("Price verification successful");
    res.json(response.data);
  } catch (error) {
    console.error("Price verification error:", error.response?.data || error);
    res.status(error.response?.status || 500).json({
      errors: [
        {
          status: error.response?.status || 500,
          code: "PRICE_VERIFICATION_ERROR",
          title: "Price Verification Failed",
          detail: "Unable to verify flight price. Please try again.",
        },
      ],
    });
  }
});

// Get flight bookings for a user
router.get("/bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await FlightBooking.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching flight bookings:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching flight bookings",
    });
  }
});

// Create a new flight booking
router.post("/bookings", async (req, res) => {
  try {
    const {
      userId,
      flightDetails,
      passengers,
      numberOfPassengers,
      status = "confirmed",
    } = req.body;

    const newBooking = await FlightBooking.create({
      userId,
      flightDetails,
      passengers,
      numberOfPassengers,
      status,
      bookingReference: `FLT-${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      data: newBooking,
    });
  } catch (error) {
    console.error("Error creating flight booking:", error);
    res.status(500).json({
      success: false,
      error: "Error creating flight booking",
    });
  }
});
export default router;
