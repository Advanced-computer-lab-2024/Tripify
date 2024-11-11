// Import necessary modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { configureFileUploads } from "./config/fileUpload.js";
import path from 'path';
import { fileURLToPath } from 'url';
import Preference from "./models/preference.model.js";

// Route imports
import activityRoutes from "./routes/activity.route.js";
import itineraryRoutes from "./routes/itinerary.route.js";
import historicalplacesRoutes from "./routes/historicalplaces.route.js";
import touristRoutes from "./routes/tourist.route.js";
import tourguideRoutes from "./routes/tourGuide.route.js";
import sellerRoutes from "./routes/seller.route.js";
import adminRoutes from "./routes/admin.route.js";
import advertiserRoutes from "./routes/advertiser.route.js";
import tourismGovernorRoutes from "./routes/toursimGovernor.route.js";
import preferenceTagRoutes from "./routes/preferenceTag.route.js";
import tagRoutes from "./routes/tag.route.js";
import productRoutes from "./routes/product.route.js";
import complaintRoutes from "./routes/complaints.route.js";
import flightRoutes from "./routes/flight.route.js";
import hotelRoutes from "./routes/hotel.route.js";
import bookingRoutes from "./routes/booking.route.js";
import transportationRoutes from "./routes/transportation.route.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Configure file uploads
configureFileUploads(app);

// Database connection
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server started at http://localhost:${process.env.PORT || 5000}`
      );
    });
  })
  .catch((error) => {
    console.error("Database connection failed. Server not started.", error);
    process.exit(1);
  });

// Routes configuration
app.use("/api/activities", activityRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/historicalplace", historicalplacesRoutes);
app.use("/api/tourist", touristRoutes);
app.use("/api/tourguide", tourguideRoutes);
app.use("/api/tourismGovernor", tourismGovernorRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advertiser", advertiserRoutes);
app.use("/api/preference-tags", preferenceTagRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/products", productRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/transportation", transportationRoutes);

// Tourist preferences routes
const router = express.Router();

// Create or update preferences for a tourist
router.put("/preferences/:userId", async (req, res) => {
  const { userId } = req.params;
  const { tripTypes, budgetLimit, preferredDestinations } = req.body;
  try {
    let preference = await Preference.findOne({ user: userId });
    if (preference) {
      preference.tripTypes = tripTypes;
      preference.budgetLimit = budgetLimit;
      preference.preferredDestinations = preferredDestinations;
    } else {
      preference = new Preference({
        user: userId,
        tripTypes,
        budgetLimit,
        preferredDestinations,
      });
    }
    await preference.save();
    res.status(200).json(preference);
  } catch (error) {
    res.status(500).json({ message: "Error updating preferences", error });
  }
});

// Get preferences for a tourist
router.get("/preferences/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const preferences = await Preference.findOne({ user: userId });
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    res.status(200).json(preferences);
  } catch (error) {
    res.status(500).json({ message: "Error fetching preferences", error });
  }
});

// Attach preferences routes to the application
app.use("/api/tourist", router);

export default app;