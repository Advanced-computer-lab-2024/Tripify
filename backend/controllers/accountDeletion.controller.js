import Tourist from "../models/tourist.model.js";
import TourGuide from "../models/tourguide.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
import Activity from "../models/activity.model.js";
import Booking from "../models/booking.model.js";
import Itinerary from "../models/itinerary.model.js";

// Helper function to check if deletion is possible
const canDeleteAccount = async (userId, userType) => {
  const currentDate = new Date();

  switch (userType) {
    case 'tourist':
      // Check tourist's active bookings
      const activeBookings = await Booking.find({
        tourist: userId,
        date: { $gt: currentDate },
        status: 'paid'
      });
      return activeBookings.length === 0;

    case 'tourguide':
      // Check tour guide's upcoming itineraries with bookings
      const upcomingItineraries = await Itinerary.find({
        tourGuide: userId,
        date: { $gt: currentDate },
        'bookings.status': 'paid'
      });
      return upcomingItineraries.length === 0;

    case 'advertiser':
      // Check advertiser's upcoming activities with bookings
      const upcomingActivities = await Activity.find({
        advertiser: userId,
        date: { $gt: currentDate },
        'bookings.status': 'paid'
      });
      return upcomingActivities.length === 0;

    case 'seller':
      // Check seller's active product orders
      const activeOrders = await Booking.find({
        seller: userId,
        status: 'paid',
        deliveryDate: { $gt: currentDate }
      });
      return activeOrders.length === 0;

    default:
      return false;
  }
};

// Helper function to get user model based on type
const getUserModel = (userType) => {
  switch (userType.toLowerCase()) {
    case 'tourist':
      return Tourist;
    case 'tourguide':
      return TourGuide;
    case 'advertiser':
      return Advertiser;
    case 'seller':
      return Seller;
    default:
      return null;
  }
};

// Process account deletion request
export const processAccountDeletion = async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  if (!['tourist', 'tourguide', 'advertiser', 'seller'].includes(userRole)) {
    return res.status(403).json({ 
      message: "Account deletion not available for this user type" 
    });
  }

  try {
    const UserModel = getUserModel(userRole);
    if (!UserModel) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if account can be deleted
    const deletionPossible = await canDeleteAccount(userId, userRole);
    
    if (!deletionPossible) {
      return res.status(400).json({
        message: "Account cannot be deleted due to active bookings or upcoming events",
        canBeDeleted: false
      });
    }

    // Perform deletion actions based on user type
    switch (userRole) {
      case 'tourist':
        // Cancel any pending bookings
        await Booking.updateMany(
          { tourist: userId, status: 'pending' },
          { status: 'cancelled' }
        );
        break;

      case 'tourguide':
        // Hide itineraries
        await Itinerary.updateMany(
          { tourGuide: userId },
          { isVisible: false }
        );
        break;

      case 'advertiser':
        // Hide activities
        await Activity.updateMany(
          { advertiser: userId },
          { isVisible: false }
        );
        break;

      case 'seller':
        // Hide products
        await Product.updateMany(
          { seller: userId },
          { isVisible: false }
        );
        break;
    }

    // Delete the user account
    await UserModel.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Account successfully deleted",
      canBeDeleted: true
    });
  } catch (error) {
    console.error('Error processing account deletion:', error);
    return res.status(500).json({
      message: "Error processing account deletion",
      error: error.message
    });
  }
};