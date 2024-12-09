import TourismGovernor from "../models/toursimGovernor.model.js";
import bcrypt from "bcrypt";
import HistoricalPlace from "../models/histroicalplace.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Otp from "../models/otp.model.js";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();

// Generate JWT Token
const generateToken = (governor) => {
  return jwt.sign(
    {
      _id: governor._id,
      username: governor.username,
      email: governor.email,
      role: "governor",
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Register a Tourism Governor
export const registerTourismGovernor = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingGovernor = await TourismGovernor.findOne({
      $or: [{ email }, { username }],
    });

    if (existingGovernor) {
      return res.status(400).json({
        message:
          existingGovernor.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    const newGovernor = new TourismGovernor({ username, email, password });
    await newGovernor.save();

    const token = generateToken(newGovernor);

    return res.status(201).json({
      message: "Tourism Governor registered successfully",
      governor: {
        id: newGovernor._id,
        username: newGovernor.username,
        email: newGovernor.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering tourism governor:", error);
    return res.status(500).json({
      message: "Error registering tourism governor",
      error: error.message,
    });
  }
};

// Login a Tourism Governor
// controllers/tourismGovernor.controller.js
export const loginTourismGovernor = async (req, res) => {
  console.log("Login controller called with body:", req.body);
  const { username, email, password } = req.body;

  try {
    // Find governor by username or email
    const governor = await TourismGovernor.findOne({
      $or: [{ email }, { username }],
    });

    if (!governor) {
      console.log("No governor found for:", { username, email });
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isMatch = await governor.comparePassword(password);
    if (!isMatch) {
      console.log("Password mismatch for governor:", governor._id);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(governor);
    console.log("Login successful for governor:", governor._id);

    return res.status(200).json({
      message: "Login successful",
      governor: {
        id: governor._id,
        username: governor.username,
        email: governor.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};
// Get Tourism Governor Profile
export const getTourismGovernorProfile = async (req, res) => {
  try {
    const governorId = req.user._id;

    const governor = await TourismGovernor.findById(governorId).select(
      "-password"
    );

    if (!governor) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      governor,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Get All Tourism Governors
export const getTourismGovernors = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      const governor = await TourismGovernor.findById(id).select("-password");

      if (!governor) {
        return res.status(404).json({ message: "Tourism Governor not found" });
      }
      return res.status(200).json(governor);
    } else {
      const governors = await TourismGovernor.find()
        .select("-password")
        .sort({ username: 1 });
      return res.status(200).json(governors);
    }
  } catch (error) {
    console.error("Error fetching tourism governor(s):", error);
    return res.status(500).json({
      message: "Error fetching tourism governor(s)",
      error: error.message,
    });
  }
};

// Update Tourism Governor Profile
export const updateTourismGovernorProfile = async (req, res) => {
  try {
    const governorId = req.user._id;
    const updates = req.body;

    delete updates.password;
    delete updates._id;
    delete updates.role;

    const governor = await TourismGovernor.findByIdAndUpdate(
      governorId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!governor) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      governor,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Get Governor's Historical Places
export const getGovernorPlaces = async (req, res) => {
  try {
    console.log("Fetching places for governor:", req.user._id);

    const places = await HistoricalPlace.find({ createdBy: req.user._id })
      .populate("tags")
      .sort({ createdAt: -1 });

    console.log("Found places:", places.length);
    res.status(200).json({
      message: "Places retrieved successfully",
      places,
    });
  } catch (error) {
    console.error("Error fetching governor places:", error);
    res.status(500).json({
      message: "Error fetching historical places",
      error: error.message,
    });
  }
};

// Create Historical Place
export const createHistoricalPlace = async (req, res) => {
  try {
    const placeData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const newPlace = new HistoricalPlace(placeData);
    await newPlace.save();

    const populatedPlace = await HistoricalPlace.findById(newPlace._id)
      .populate("tags")
      .populate("createdBy", "-password");

    res.status(201).json({
      message: "Historical place created successfully",
      place: populatedPlace,
    });
  } catch (error) {
    console.error("Error creating historical place:", error);
    res.status(500).json({
      message: "Error creating historical place",
      error: error.message,
    });
  }
};

// Update Historical Place
export const updateHistoricalPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const place = await HistoricalPlace.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!place) {
      return res.status(404).json({
        message: "Historical place not found or unauthorized",
      });
    }

    const updatedPlace = await HistoricalPlace.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("tags")
      .populate("createdBy", "-password");

    res.status(200).json({
      message: "Historical place updated successfully",
      place: updatedPlace,
    });
  } catch (error) {
    console.error("Error updating historical place:", error);
    res.status(500).json({
      message: "Error updating historical place",
      error: error.message,
    });
  }
};

// Delete Historical Place
export const deleteHistoricalPlace = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await HistoricalPlace.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!place) {
      return res.status(404).json({
        message: "Historical place not found or unauthorized",
      });
    }

    await place.deleteOne();

    res.status(200).json({
      message: "Historical place deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting historical place:", error);
    res.status(500).json({
      message: "Error deleting historical place",
      error: error.message,
    });
  }
};

// In tourismGovernor.controller.js

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required" });
    }

    // Find the tourism governor and explicitly select the password field
    const governor = await TourismGovernor.findById(_id).select("+password");
    if (!governor) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    // Verify current password
    const isMatch = await governor.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Set new password (it will be hashed by the pre-save middleware)
    governor.password = newPassword;
    await governor.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      message: "Error updating password",
      error: error.message,
    });
  }
};
export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists
    const governor = await TourismGovernor.findOne({ email });
    if (!governor) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Save OTP in the database
    await Otp.create({
      userId: governor._id,
      userType: 'TourismGovernor',
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Valid for 5 minutes
    });

    // Send OTP email
    const subject = "Tripify Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`;
    const html = `<p>Your OTP for password reset is: <strong>${otp}</strong>. This OTP is valid for <strong>5 minutes</strong>.</p>`;

    await sendEmail(email, subject, text, html);

    res.status(200).json({ message: "OTP sent successfully", email });
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // First find the governor to get their ID
    const governor = await TourismGovernor.findOne({ email });
    if (!governor) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    // Look up the OTP using userId and the OTP value
    const otpRecord = await Otp.findOne({ 
      userId: governor._id,
      userType: 'TourismGovernor',
      otp: otp
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await otpRecord.deleteOne(); // Clean up expired OTP
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid - you might want to mark it as used or delete it
    await otpRecord.deleteOne();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const governor = await TourismGovernor.findOne({ email });
    
    if (!governor) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    // Hash the password manually
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password directly without triggering middleware
    await TourismGovernor.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    await Otp.deleteMany({ 
      userId: governor._id,
      userType: 'TourismGovernor'
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

export default {
  registerTourismGovernor,
  loginTourismGovernor,
  getTourismGovernorProfile,
  getTourismGovernors,
  updateTourismGovernorProfile,
  getGovernorPlaces,
  createHistoricalPlace,
  updateHistoricalPlace,
  deleteHistoricalPlace,
};

