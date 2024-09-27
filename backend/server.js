import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import activityRoutes from "./routes/activity.route.js";
import activityCategoryRoutes from "./routes/ActivityCategory.route.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed. Server not started.", error);
    process.exit(1);
  });

app.use("/api/activity-categories", activityCategoryRoutes);

app.use("/api/activities", activityRoutes);
