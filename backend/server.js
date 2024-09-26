import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database before starting the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // Change this line
      console.log(`Server started at http://localhost:${PORT}`); // Update this line
    });
  })
  .catch((error) => {
    console.error("Database connection failed. Server not started.", error);
    process.exit(1);
  });
