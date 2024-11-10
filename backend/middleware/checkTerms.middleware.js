// checkTerms.middleware.js
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
import TourGuide from "../models/tourguide.model.js";

const checkTermsMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id; // Assume `req.user` has been set by an auth middleware
    const userRole = req.user.role; // Assume `req.user.role` holds the user's role (advertiser, seller, or tourguide)
    
    let user;

    // Check user role and find the corresponding user model
    if (userRole === "advertiser") {
      user = await Advertiser.findById(userId);
    } else if (userRole === "seller") {
      user = await Seller.findById(userId);
    } else if (userRole === "tourguide") {
      user = await TourGuide.findById(userId);
    }

    // If the user isn't found or hasn't accepted the terms, deny access
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.acceptedTerms) {
      return res.status(403).json({ message: "Access denied. Please accept the terms and conditions to proceed." });
    }

    // If terms are accepted, proceed to the next middleware or route
    next();
  } catch (error) {
    console.error("Error in checkTermsMiddleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default checkTermsMiddleware;
