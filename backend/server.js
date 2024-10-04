import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import activityRoutes from "./routes/activity.route.js";
import preferenceTagRoutes from "./routes/preferenceTag.route.js";
import tagRoutes from "./routes/tag.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

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

app.use("/api/activities", activityRoutes);
app.use("/api/preference-tags", preferenceTagRoutes);
app.use("/api/tags", tagRoutes);
