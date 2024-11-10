// routes/terms.routes.js
import express from "express";
import TourGuide from "../models/tourguide.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Endpoint to accept terms and conditions
router.post("/accept", authMiddleware, async (req, res) => {
  const { role, userId } = req.user; // JWT should include role and userId

  try {
    let userModel;
    if (role === "tourguide") {
      userModel = TourGuide;
    } else if (role === "advertiser") {
      userModel = Advertiser;
    } else if (role === "seller") {
      userModel = Seller;
    } else {
      return res.status(400).json({ message: "Invalid user role for terms acceptance." });
    }

    // Update the user to mark terms as accepted
    const user = await userModel.findByIdAndUpdate(
      userId,
      { acceptedTerms: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Terms and conditions accepted successfully",
      user: { id: user._id, acceptedTerms: user.acceptedTerms }
    });
  } catch (error) {
    console.error("Error accepting terms:", error);
    res.status(500).json({ message: "Error accepting terms", error: error.message });
  }
});

export default router;
