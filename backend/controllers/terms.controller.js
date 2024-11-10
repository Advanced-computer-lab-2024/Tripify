// terms.controller.js

import Advertiser from "../models/advertiser.model.js";
import TourGuide from "../models/tourguide.model.js";
import Seller from "../models/seller.model.js";

export const acceptTerms = async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role; // Assuming role is stored in the token

    try {
        let user;
        if (userRole === 'advertiser') {
            user = await Advertiser.findById(userId);
        } else if (userRole === 'tourGuide') {
            user = await TourGuide.findById(userId);
        } else if (userRole === 'seller') {
            user = await Seller.findById(userId);
        }

        if (!user) return res.status(404).json({ message: "User not found" });

        user.termsAccepted = true;
        await user.save();

        res.status(200).json({ message: "Terms and conditions accepted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error updating terms acceptance", error: error.message });
    }
};
