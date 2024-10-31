import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
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

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

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