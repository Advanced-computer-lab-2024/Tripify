import TourGuide from "../models/tourGuide.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Itinerary from "../models/itinerary.model.js";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT Token
const generateToken = (tourGuide) => {
  return jwt.sign(
    {
      _id: tourGuide._id,
      username: tourGuide.username,
      email: tourGuide.email,
      mobileNumber: tourGuide.mobileNumber,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Register a Tour Guide
// Registration function modification
export const registerTourGuide = async (req, res) => {
  const {
    username,
    email,
    password,
    mobileNumber,
    yearsOfExperience,
    previousWork,
  } = req.body;

  try {
    // Log the registration attempt
    console.log("Registration attempt for:", username);

    const existingTourGuide = await TourGuide.findOne({
      $or: [{ email }, { username }],
    });
    if (existingTourGuide) {
      return res.status(400).json({
        message:
          existingTourGuide.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    // Hash password manually instead of relying on pre-save hook
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const newTourGuide = new TourGuide({
      username,
      email,
      password: hashedPassword, // Use the manually hashed password
      mobileNumber,
      yearsOfExperience,
      previousWork,
    });

    await newTourGuide.save();
    console.log("Tour guide saved successfully");

    const token = generateToken(newTourGuide);
    console.log("Token generated successfully");

    return res.status(201).json({
      message: "Tour guide registered successfully",
      tourguide: {
        // Changed from tourGuide to tourguide to match login response
        id: newTourGuide._id,
        username: newTourGuide.username,
        email: newTourGuide.email,
        mobileNumber: newTourGuide.mobileNumber,
        yearsOfExperience: newTourGuide.yearsOfExperience,
        previousWork: newTourGuide.previousWork,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering tour guide:", error);
    return res
      .status(500)
      .json({ message: "Error registering tour guide", error: error.message });
  }
};

// Login a Tour Guide
export const loginTourGuide = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Login attempt for:", username);

    const tourGuide = await TourGuide.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!tourGuide) {
      console.log("No tour guide found");
      return res.status(404).json({ message: "Invalid username or password" });
    }

    console.log("Tour guide found:", tourGuide.username);

    // Log password details for debugging (remove in production)
    console.log("Provided password length:", password.length);
    console.log("Stored hash length:", tourGuide.password.length);

    const isMatch = await bcrypt.compare(password, tourGuide.password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(tourGuide);
    console.log("Token generated successfully");

    return res.status(200).json({
      message: "Login successful",
      tourguide: {
        id: tourGuide._id,
        username: tourGuide.username,
        email: tourGuide.email,
        mobileNumber: tourGuide.mobileNumber,
        yearsOfExperience: tourGuide.yearsOfExperience,
        previousWork: tourGuide.previousWork,
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
// Reset Password for Tour Guide
export const resetPassword = async (req, res) => {
  const { identifier, newPassword } = req.body;

  try {
    const tourGuide = await TourGuide.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    tourGuide.password = await bcrypt.hash(newPassword, 10);
    await tourGuide.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

// Get Tour Guide Profile by Username (Protected Route)
export const getTourGuideByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourGuide = await TourGuide.findOne({ username }).select("-password");
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }
    res.status(200).json(tourGuide);
  } catch (error) {
    console.error("Error fetching tour guide:", error);
    return res
      .status(500)
      .json({ message: "Error fetching tour guide", error: error.message });
  }
};

// Update Tour Guide Profile (Protected Route)
export const updateTourGuideAccount = async (req, res) => {
  const { id } = req.params;
  const { username, email, mobileNumber, yearsOfExperience, previousWork } =
    req.body;

  try {
    if (req.user._id !== id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourGuide = await TourGuide.findById(id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    tourGuide.username = username || tourGuide.username;
    tourGuide.email = email || tourGuide.email;
    tourGuide.mobileNumber = mobileNumber || tourGuide.mobileNumber;
    tourGuide.yearsOfExperience =
      yearsOfExperience || tourGuide.yearsOfExperience;

    if (Array.isArray(previousWork)) {
      tourGuide.previousWork = previousWork.map((work) => ({
        jobTitle: work.jobTitle || "",
        company: work.company || "",
        description: work.description || "",
        startDate: work.startDate || null,
        endDate: work.endDate || null,
      }));
    }

    await tourGuide.save();

    res.status(200).json({
      message: "Tour guide updated successfully",
      tourGuide: {
        id: tourGuide._id,
        username: tourGuide.username,
        email: tourGuide.email,
        mobileNumber: tourGuide.mobileNumber,
        yearsOfExperience: tourGuide.yearsOfExperience,
        previousWork: tourGuide.previousWork,
      },
    });
  } catch (error) {
    console.error("Error updating tour guide:", error);
    return res
      .status(500)
      .json({ message: "Error updating tour guide", error: error.message });
  }
};

// Change Password (Protected Route)
export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    if (req.user._id !== id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourGuide = await TourGuide.findById(id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, tourGuide.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    tourGuide.password = await bcrypt.hash(newPassword, 10);
    await tourGuide.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};

// Get All Tour Guides
export const getAllTourGuides = async (req, res) => {
  try {
    const tourGuides = await TourGuide.find().select("-password");
    res.status(200).json(tourGuides);
  } catch (error) {
    console.error("Error fetching tour guides:", error);
    return res
      .status(500)
      .json({ message: "Error fetching tour guides", error: error.message });
  }
};

// Delete Tour Guide (Protected Route)
export const deleteTourGuide = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user._id !== id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourGuide = await TourGuide.findById(id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    await tourGuide.deleteOne();
    return res.status(200).json({ message: "Tour guide deleted successfully" });
  } catch (error) {
    console.error("Error deleting tour guide:", error);
    return res
      .status(500)
      .json({ message: "Error deleting tour guide", error: error.message });
  }
};

// Get Tour Guide Profile by Token (Protected Route)
export const getProfileByToken = async (req, res) => {
  try {
    const { _id } = req.user;

    const tourGuide = await TourGuide.findById(_id).select("-password");
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      tourGuide: {
        id: tourGuide._id,
        username: tourGuide.username,
        email: tourGuide.email,
        mobileNumber: tourGuide.mobileNumber,
        yearsOfExperience: tourGuide.yearsOfExperience,
        previousWork: tourGuide.previousWork,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

// Get Tour Guide Itineraries (Protected Route)
export const getTourGuideItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ createdBy: req.user._id })
      .populate("preferenceTags")
      .sort({ createdAt: -1 });

    res.json(itineraries);
  } catch (error) {
    console.error("Error fetching tour guide itineraries:", error);
    res.status(500).json({ message: error.message });
  }
};
