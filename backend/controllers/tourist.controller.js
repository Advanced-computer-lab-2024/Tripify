// touristController.js
import mongoose from "mongoose";
import Tourist from "../models/tourist.model.js";
import Event from "../models/event.model.js"; // Add this import
import TourGuide from "../models/tourGuide.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Booking from "../models/booking.model.js";
import Review from "../models/review.model.js";

dotenv.config();

// Generate JWT Token
const generateToken = (tourist) => {
  return jwt.sign(
    {
      _id: tourist._id,
      username: tourist.username,
      email: tourist.email,
      mobileNumber: tourist.mobileNumber,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Register Tourist
export const registerTourist = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      mobileNumber,
      nationality,
      dob,
      jobStatus,
      jobTitle,
    } = req.body;

    // Check if user already exists
    const existingUser = await Tourist.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email is already registered"
            : "Username is already taken",
      });
    }

    // Validate job status
    if (!["student", "job"].includes(jobStatus)) {
      return res.status(400).json({ message: "Invalid job status" });
    }

    if (jobStatus === "job" && !jobTitle) {
      return res
        .status(400)
        .json({ message: "Job title is required if you are employed." });
    }

    const newTourist = new Tourist({
      email,
      username,
      password,
      mobileNumber,
      nationality,
      dob: new Date(dob),
      jobStatus,
      jobTitle: jobStatus === "job" ? jobTitle : undefined,
      wallet: 0,
    });

    await newTourist.save();

    const token = generateToken(newTourist);

    res.status(201).json({
      message: "Tourist registered successfully",
      tourist: {
        id: newTourist._id,
        email: newTourist.email,
        username: newTourist.username,
        mobileNumber: newTourist.mobileNumber,
        nationality: newTourist.nationality,
        dob: newTourist.dob,
        jobStatus: newTourist.jobStatus,
        jobTitle: newTourist.jobTitle,
        wallet: newTourist.wallet,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Login Tourist
export const loginTourist = async (req, res) => {
  try {
    const { username, password } = req.body;

    const tourist = await Tourist.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!tourist) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const isMatch = await tourist.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(tourist);

    res.status(200).json({
      message: "Login successful",
      tourist: {
        id: tourist._id,
        email: tourist.email,
        username: tourist.username,
        mobileNumber: tourist.mobileNumber,
        nationality: tourist.nationality,
        dob: tourist.dob,
        jobStatus: tourist.jobStatus,
        jobTitle: tourist.jobTitle,
        wallet: tourist.wallet,
        preferences: tourist.preferences,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Tourist Profile
export const getTouristProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Check authorization using the decoded token from middleware
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourist = await Tourist.findOne({ username }).lean();

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    res.status(200).json({
      message: "Tourist profile fetched successfully",
      tourist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Tourist Profile
export const updateTouristProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Check authorization using the decoded token from middleware
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const {
      email,
      mobileNumber,
      nationality,
      jobStatus,
      jobTitle,
      preferences,
    } = req.body;

    const tourist = await Tourist.findOne({ username });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Update tourist fields
    tourist.email = email || tourist.email;
    tourist.mobileNumber = mobileNumber || tourist.mobileNumber;
    tourist.nationality = nationality || tourist.nationality;
    tourist.jobStatus = jobStatus || tourist.jobStatus;
    tourist.jobTitle = jobStatus === "job" ? jobTitle : undefined;
    tourist.preferences = preferences || tourist.preferences;

    await tourist.save();

    res.status(200).json({
      message: "Tourist profile updated successfully",
      tourist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all tourists
export const getAllTourists = async (req, res) => {
  try {
    const tourists = await Tourist.find({}, "username");
    res.status(200).json(tourists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Add money to wallet

export const deductFromWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    console.log("Deduct from wallet request:", {
      userId: id,
      amount,
      body: req.body,
    });

    if (!amount || amount <= 0) {
      console.log("Invalid amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    const tourist = await Tourist.findById(id);
    if (!tourist) {
      console.log("Tourist not found:", id);
      return res.status(404).json({ message: "Tourist not found" });
    }

    console.log("Current wallet balance:", tourist.wallet);
    console.log("Attempting to deduct:", amount);

    if (tourist.wallet < amount) {
      console.log("Insufficient funds:", {
        balance: tourist.wallet,
        required: amount,
      });

      return res.status(400).json({
        message: "Insufficient funds",
        currentBalance: tourist.wallet,
        requiredAmount: amount,
      });
    }
    // Calculate and add loyalty points based on level
    const earnedPoints = calculateLoyaltyPoints(tourist.level, amount);
    tourist.loyaltypoints += earnedPoints;

    // Update tourist level based on total points
    tourist.level = determineTouristLevel(tourist.loyaltypoints);

    tourist.wallet = tourist.wallet - amount;
    await tourist.save();

    console.log("New wallet balance:", tourist.wallet);

    res.status(200).json({
      success: true,
      message: "Amount deducted from wallet successfully",
      currentBalance: tourist.wallet,
      earnedPoints,
      totalPoints: tourist.loyaltypoints,
      newLevel: tourist.level,
    });
  } catch (error) {
    console.error("Deduct from wallet error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const addToWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    console.log("Add to wallet request:", {
      userId: id,
      amount,
      body: req.body,
    });

    if (!amount || amount <= 0) {
      console.log("Invalid amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    const tourist = await Tourist.findById(id);
    if (!tourist) {
      console.log("Tourist not found:", id);
      return res.status(404).json({ message: "Tourist not found" });
    }

    tourist.wallet = (tourist.wallet || 0) + amount;
    await tourist.save();

    console.log("New wallet balance:", tourist.wallet);

    res.status(200).json({
      success: true,
      message: "Amount added to wallet successfully",
      currentBalance: tourist.wallet,
      addedAmount: amount,
    });
  } catch (error) {
    console.error("Add to wallet error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const refundToWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    console.log("Refund to wallet request:", {
      userId: id,
      amount,
      body: req.body,
    });

    if (!amount || amount <= 0) {
      console.log("Invalid amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    const tourist = await Tourist.findById(id);
    if (!tourist) {
      console.log("Tourist not found:", id);
      return res.status(404).json({ message: "Tourist not found" });
    }

    tourist.wallet = (tourist.wallet || 0) + amount;
    await tourist.save();

    console.log("New wallet balance:", tourist.wallet);

    res.status(200).json({
      success: true,
      message: "Amount refunded to wallet successfully",
      currentBalance: tourist.wallet,
      refundedAmount: amount,
    });
  } catch (error) {
    console.error("Refund to wallet error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
const calculateLoyaltyPoints = (level, amount) => {
  const multipliers = {
    1: 0.5,
    2: 1.0,
    3: 1.5,
  };
  return Math.floor(amount * (multipliers[level] || 0.5)); // Default to level 1 multiplier if level is invalid
};

// Helper function to determine level based on loyalty points
const determineTouristLevel = (points) => {
  if (points >= 500000) return 3;
  if (points >= 100000) return 2;
  return 1;
};

// Get tourist loyalty status
export const getLoyaltyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const tourist = await Tourist.findById(id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    res.status(200).json({
      success: true,
      loyaltyStatus: {
        points: tourist.loyaltypoints,
        level: tourist.level,
        nextLevelPoints:
          tourist.level === 3 ? null : tourist.level === 2 ? 500000 : 100000,
        pointsToNextLevel:
          tourist.level === 3
            ? 0
            : tourist.level === 2
            ? 500000 - tourist.loyaltypoints
            : 100000 - tourist.loyaltypoints,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const redeemLoyaltyPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsToRedeem } = req.body;

    if (
      !pointsToRedeem ||
      pointsToRedeem < 10000 ||
      pointsToRedeem % 10000 !== 0
    ) {
      return res.status(400).json({
        message: "Points must be at least 10,000 and in multiples of 10,000",
      });
    }

    const tourist = await Tourist.findById(id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    if (tourist.loyaltypoints < pointsToRedeem) {
      return res.status(400).json({
        message: "Insufficient loyalty points",
        currentPoints: tourist.loyaltypoints,
      });
    }

    // Calculate EGP (10000 points = 100 EGP)
    const egpToAdd = (pointsToRedeem / 10000) * 100;

    // Update tourist's points and wallet
    tourist.loyaltypoints -= pointsToRedeem;
    tourist.wallet += egpToAdd;

    // Update level based on new points total
    tourist.level = determineTouristLevel(tourist.loyaltypoints);

    await tourist.save();

    res.status(200).json({
      success: true,
      message: "Points redeemed successfully",
      redeemedPoints: pointsToRedeem,
      addedAmount: egpToAdd,
      currentBalance: tourist.wallet,
      remainingPoints: tourist.loyaltypoints,
      newLevel: tourist.level,
    });
  } catch (error) {
    console.error("Redeem points error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const rateTourGuide = async (req, res) => {
  try {
    const { tourGuideId } = req.params;
    const { rating, comment } = req.body;
    const touristId = req.user._id; // Get tourist ID from the authenticated user

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Validate tourGuideId
    if (!mongoose.Types.ObjectId.isValid(tourGuideId)) {
      return res.status(400).json({ message: "Invalid tour guide ID" });
    }

    // Find the tour guide
    const tourGuide = await TourGuide.findById(tourGuideId);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }

    // Check if tourist has already reviewed this tour guide
    const existingReviewIndex = tourGuide.reviews.findIndex(
      (review) => review.reviewer.toString() === touristId.toString()
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      tourGuide.reviews[existingReviewIndex] = {
        rating,
        comment,
        reviewer: touristId,
        createdAt: new Date(),
      };
    } else {
      // Add new review
      tourGuide.reviews.push({
        rating,
        comment,
        reviewer: touristId,
      });
    }

    // Save the updated tour guide
    await tourGuide.save();

    // Calculate new average rating
    const averageRating = tourGuide.averageRating;

    res.status(200).json({
      success: true,
      message:
        existingReviewIndex !== -1
          ? "Review updated successfully"
          : "Review added successfully",
      data: {
        averageRating,
        totalReviews: tourGuide.reviews.length,
      },
    });
  } catch (error) {
    console.error("Rate tour guide error:", error);
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error rating tour guide",
      error: error.message,
    });
  }
};


// Add new delivery address
export const addDeliveryAddress = async (req, res) => {
  try {
    const touristId = req.user._id;
    const addressData = req.body;

    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // If this is the first address, make it default
    if (tourist.deliveryAddresses.length === 0) {
      addressData.isDefault = true;
    }

    // If this address is set as default, remove default from other addresses
    if (addressData.isDefault) {
      tourist.deliveryAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    tourist.deliveryAddresses.push(addressData);
    await tourist.save();

    res.status(201).json({
      success: true,
      message: "Delivery address added successfully",
      address: tourist.deliveryAddresses[tourist.deliveryAddresses.length - 1]
    });
  } catch (error) {
    console.error("Add delivery address error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding delivery address",
      error: error.message
    });
  }
};

// Get all delivery addresses
export const getDeliveryAddresses = async (req, res) => {
  try {
    const touristId = req.user._id;
    const tourist = await Tourist.findById(touristId).select('deliveryAddresses');

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    res.status(200).json({
      success: true,
      addresses: tourist.deliveryAddresses
    });
  } catch (error) {
    console.error("Get delivery addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery addresses",
      error: error.message
    });
  }
};

// Update a delivery address
export const updateDeliveryAddress = async (req, res) => {
  try {
    const touristId = req.user._id;
    const { addressId } = req.params;
    const updateData = req.body;

    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const addressIndex = tourist.deliveryAddresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If this address is being set as default, remove default from others
    if (updateData.isDefault) {
      tourist.deliveryAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update the address
    Object.assign(tourist.deliveryAddresses[addressIndex], updateData);
    await tourist.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: tourist.deliveryAddresses[addressIndex]
    });
  } catch (error) {
    console.error("Update delivery address error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery address",
      error: error.message
    });
  }
};

// Delete a delivery address
export const deleteDeliveryAddress = async (req, res) => {
  try {
    const touristId = req.user._id;
    const { addressId } = req.params;

    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const addressIndex = tourist.deliveryAddresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If deleting default address, make the first remaining address default
    const wasDefault = tourist.deliveryAddresses[addressIndex].isDefault;
    tourist.deliveryAddresses.splice(addressIndex, 1);

    if (wasDefault && tourist.deliveryAddresses.length > 0) {
      tourist.deliveryAddresses[0].isDefault = true;
    }

    await tourist.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error("Delete delivery address error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting delivery address",
      error: error.message
    });
  }
};

// Set default delivery address
export const setDefaultAddress = async (req, res) => {
  try {
    const touristId = req.user._id;
    const { addressId } = req.params;

    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Remove default from all addresses and set new default
    tourist.deliveryAddresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await tourist.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully"
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({
      success: false,
      message: "Error setting default address",
      error: error.message
    });
  }
};


// Example for tourist controller - apply similar fixes to other user controllers
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required" });
    }

    // First find the user with current password
    const user = await Tourist.findById(_id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    user.password = newPassword; // The pre-save middleware will hash this
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      message: "Error updating password",
      error: error.message,
    });
  }
};


// Update the bookmarkEvent function to handle different event types
export const bookmarkEvent = async (req, res) => {
  try {
    const { eventId, eventType } = req.body;
    const touristId = req.user._id;

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Find the tourist
    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Initialize savedEvents array if it doesn't exist
    if (!tourist.savedEvents) {
      tourist.savedEvents = [];
    }

    // Check if event is already bookmarked
    if (tourist.savedEvents.includes(eventId)) {
      return res.status(400).json({ message: "Event already bookmarked" });
    }

    // Verify the event exists based on type
    let event;
    switch (eventType) {
      case "HistoricalPlace":
        event = await mongoose.model("HistoricalPlace").findById(eventId);
        break;
      case "Activity":
        event = await mongoose.model("Activity").findById(eventId);
        break;
      case "Itinerary":
        event = await mongoose.model("Itinerary").findById(eventId);
        break;
      default:
        return res.status(400).json({ message: "Invalid event type" });
    }

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Add event to savedEvents
    tourist.savedEvents.push(eventId);
    await tourist.save();

    res.status(200).json({ 
      success: true,
      message: "Event bookmarked successfully" 
    });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error bookmarking event", 
      error: error.message 
    });
  }
};

// Update getSavedEvents to populate based on event type
export const getSavedEvents = async (req, res) => {
  try {
    const touristId = req.user._id;

    // First, get the tourist with their saved event IDs
    const tourist = await Tourist.findById(touristId).select('savedEvents');
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Get all saved events from different collections
    const [historicalPlaces, activities, itineraries] = await Promise.all([
      mongoose.model('HistoricalPlace').find({ _id: { $in: tourist.savedEvents } }),
      mongoose.model('Activity').find({ _id: { $in: tourist.savedEvents } }),
      mongoose.model('Itinerary').find({ _id: { $in: tourist.savedEvents } })
    ]);

    // Combine and format all events
    const savedEvents = [
      ...historicalPlaces.map(place => ({
        ...place.toObject(),
        eventType: 'HistoricalPlace'
      })),
      ...activities.map(activity => ({
        ...activity.toObject(),
        eventType: 'Activity'
      })),
      ...itineraries.map(itinerary => ({
        ...itinerary.toObject(),
        eventType: 'Itinerary'
      }))
    ];

    res.status(200).json({ 
      success: true,
      savedEvents
    });
  } catch (error) {
    console.error('Get saved events error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching saved events", 
      error: error.message 
    });
  }
};
// Update removeBookmark with better error handling
export const removeBookmark = async (req, res) => {
  try {
    const { eventId } = req.params;
    const touristId = req.user._id;

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Check if event exists in savedEvents
    if (!tourist.savedEvents?.includes(eventId)) {
      return res.status(404).json({ message: "Event not found in bookmarks" });
    }

    // Remove the event
    tourist.savedEvents = tourist.savedEvents.filter(
      event => event.toString() !== eventId
    );
    
    await tourist.save();

    res.status(200).json({ 
      success: true,
      message: "Event bookmark removed successfully" 
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error removing bookmark", 
      error: error.message 
    });
  }
};

// Check if tourist can delete their account
export const checkDeletionEligibility = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for upcoming bookings
    const upcomingBookings = await Booking.find({
      userId: id,
      bookingDate: { $gt: new Date() },
      status: { $ne: "cancelled" },
    });

    if (upcomingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        canDelete: false,
        message:
          "Cannot delete account: You have upcoming bookings. Please cancel them first.",
      });
    }

    // Check for paid bookings that haven't happened yet
    const paidUpcomingBookings = await Booking.find({
      userId: id,
      bookingDate: { $gt: new Date() },
      status: "confirmed",
    });

    if (paidUpcomingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        canDelete: false,
        message:
          "Cannot delete account: You have paid bookings that haven't occurred yet. Please contact support for assistance.",
      });
    }

    res.status(200).json({
      success: true,
      canDelete: true,
      message: "Account is eligible for deletion",
    });
  } catch (error) {
    console.error("Error checking deletion eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Error checking account deletion eligibility",
      error: error.message,
    });
  }
};

// Delete tourist account
export const deleteTouristAccount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Final eligibility check
    const upcomingBookings = await Booking.find({
      userId: id,
      bookingDate: { $gt: new Date() },
      status: { $nin: ["cancelled"] },
    }).session(session);

    if (upcomingBookings.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot delete account due to existing bookings",
      });
    }

    // Mark past bookings as associated with a deleted account
    await Booking.updateMany(
      { userId: id },
      { $set: { status: "account_deleted" } },
      { session }
    );

    // Delete reviews
    await Review.deleteMany({ userId: id }, { session });

    // Delete the tourist account
    const deletedTourist = await Tourist.findByIdAndDelete(id).session(session);

    if (!deletedTourist) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Tourist account not found",
      });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Account successfully deleted",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
