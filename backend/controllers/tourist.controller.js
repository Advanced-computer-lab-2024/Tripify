// touristController.js

import Tourist from "../models/tourist.model.js";
import Booking from "../models/booking.model.js";
import Activity from "../models/activity.model.js";
import Itinerary from "../models/itinerary.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

export const requestDeletion = async (req, res) => {
    try {
        const { _id } = req.user;

        const tourist = await Tourist.findById(_id);
        
        if (!tourist) {
            return res.status(404).json({ message: "Tourist not found" });
        }

        if (tourist.isDeletionRequested) {
            return res.status(400).json({ message: "Deletion already requested" });
        }

        // Check for upcoming bookings that are confirmed and paid
        const hasUpcomingConfirmedPaidBookings = await Booking.exists({
            user: _id,
            date: { $gte: new Date() }, // Only future bookings
            status: "paid", // Ensure booking status is 'paid'
            confirmed: true // Check that booking is confirmed
        });

        if (hasUpcomingConfirmedPaidBookings) {
            return res.status(400).json({
                message: "Cannot request deletion with upcoming confirmed and paid bookings."
            });
        }

        // Update tourist to request deletion
        tourist.isDeletionRequested = true;
        await tourist.save();

        res.status(200).json({
            message: "Deletion request submitted successfully",
            tourist: { id: tourist._id, isDeletionRequested: tourist.isDeletionRequested }
        });
    } catch (error) {
        console.error("Error requesting account deletion:", error);
        res.status(500).json({ message: "Error requesting deletion", error: error.message });
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

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check authorization using the decoded token from middleware
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourist = await Tourist.findOne({ username });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const isMatch = await tourist.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    tourist.password = newPassword; // Ensure password is hashed within the model or before saving
    await tourist.save();

    res.status(200).json({ message: "Password changed successfully" });
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

    // Check if amount is a number
    if (isNaN(amount) || typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number" });
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
      newLevel: tourist.level
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

    // Check if amount is a number
    if (isNaN(amount) || typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number" });
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

    // Check if amount is a number
    if (isNaN(amount) || typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number" });
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
    3: 1.5
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
        nextLevelPoints: tourist.level === 3 ? null : (tourist.level === 2 ? 500000 : 100000),
        pointsToNextLevel: tourist.level === 3 ? 0 : (tourist.level === 2 ? 500000 - tourist.loyaltypoints : 100000 - tourist.loyaltypoints)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
    }
    };
    // Delete Tourist (Protected Route)
    export const deleteTourist = async (req, res) => {
    const { id } = req.params;
    try {
    const tourist = await Tourist.findById(id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    if (!tourist.isDeletionRequested) {
      return res.status(400).json({ message: "Deletion not requested by user" });  
    }
    
    // Check for upcoming events, activities, or itineraries with paid bookings
    const hasUpcomingBookings = await Booking.exists({
      user: id,
      date: { $gte: new Date() },
      status: "paid"
    });
    
    const hasUpcomingActivities = await Activity.exists({
      participants: id,
      date: { $gte: new Date() },
      "bookings.status": "paid"
    });
    
    const hasUpcomingItineraries = await Itinerary.exists({
      createdBy: id,
      date: { $gte: new Date() },
      "bookings.status": "paid"
    });
    
    if (hasUpcomingBookings || hasUpcomingActivities || hasUpcomingItineraries) {
      return res.status(400).json({
        message: "Cannot delete account with upcoming paid events, activities, or itineraries."
      });
    }
    
    // Optionally mark associated events, activities, or itineraries as inactive
    await Activity.updateMany({ participants: id }, { $pull: { participants: id } });
    await Itinerary.updateMany({ createdBy: id }, { visible: false });
    
    // Delete tourist account
    await Tourist.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Tourist deleted successfully" });
  } catch (error) {
    console.error("Error deleting tourist:", error);
    res.status(500).json({ message: "Error deleting tourist", error: error.message });
    }
    };
    export const redeemLoyaltyPoints = async (req, res) => {
    try {
    const { id } = req.params;
    const { pointsToRedeem } = req.body;
    if (!pointsToRedeem || pointsToRedeem < 10000 || pointsToRedeem % 10000 !== 0) {
      return res.status(400).json({ 
        message: "Points must be at least 10,000 and in multiples of 10,000" 
      });
    }
    
    // Check if pointsToRedeem is a number
    if (isNaN(pointsToRedeem) || typeof pointsToRedeem !== "number") {
      return res.status(400).json({ message: "Points must be a number" });
    }
    
    const tourist = await Tourist.findById(id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    
    if (tourist.loyaltypoints < pointsToRedeem) {
      return res.status(400).json({ 
        message: "Insufficient loyalty points",
        currentPoints: tourist.loyaltypoints
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
      newLevel: tourist.level
    });
  } catch (error) {
    console.error("Redeem points error:", error);
    res.status(500).json({
    message: "Server error",
    error: error.message
    });
    }
    };