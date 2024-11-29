import mongoose from "mongoose";
import TourGuide from "../models/tourGuide.model.js";
import Itinerary from "../models/itinerary.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from 'fs';

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
export const registerTourGuide = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      mobileNumber,
      yearsOfExperience,
      previousWork,
    } = req.body;

    console.log("Registration attempt for:", username);

    // Validate required files
    if (
      !req.files ||
      !req.files.identificationDocument ||
      !req.files.certificate
    ) {
      return res.status(400).json({
        message: "Both ID document and certificate are required",
        details: {
          identificationDocument: !req.files?.identificationDocument,
          certificate: !req.files?.certificate,
        },
      });
    }

    const existingTourGuide = await TourGuide.findOne({
      $or: [{ email }, { username }],
    });
    if (existingTourGuide) {
      // Delete uploaded files if registration fails
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            try {
              fs.unlinkSync(file.path);
            } catch (error) {
              console.error("Error deleting file:", error);
            }
          });
        });
      }
      return res.status(400).json({
        message:
          existingTourGuide.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    // Process file uploads
    const fileData = {
      identificationDocument: {
        filename: req.files.identificationDocument[0].filename,
        path: req.files.identificationDocument[0].path,
        mimetype: req.files.identificationDocument[0].mimetype,
        size: req.files.identificationDocument[0].size,
        uploadDate: new Date(),
        isVerified: false,
      },
      certificate: {
        filename: req.files.certificate[0].filename,
        path: req.files.certificate[0].path,
        mimetype: req.files.certificate[0].mimetype,
        size: req.files.certificate[0].size,
        uploadDate: new Date(),
        isVerified: false,
      },
    };

    const newTourGuide = new TourGuide({
      username,
      email,
      password, // Password will be hashed by pre-save middleware
      mobileNumber,
      yearsOfExperience,
      previousWork,
      ...fileData,
    });

    await newTourGuide.save();
    console.log("Tour guide saved successfully");

    const token = generateToken(newTourGuide);
    console.log("Token generated successfully");

    return res.status(201).json({
      message: "Tour guide registered successfully",
      tourguide: {
        id: newTourGuide._id,
        username: newTourGuide.username,
        email: newTourGuide.email,
        mobileNumber: newTourGuide.mobileNumber,
        yearsOfExperience: newTourGuide.yearsOfExperience,
        previousWork: newTourGuide.previousWork,
        identificationDocument: newTourGuide.identificationDocument.path,
        certificate: newTourGuide.certificate.path,
        TandC: newTourGuide.TandC,
      },
      token,
    });
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        });
      });
    }

    console.error("Error registering tour guide:", error);
    return res
      .status(500)
      .json({ message: "Error registering tour guide", error: error.message });
  }
};

// Login a Tour Guide
export const loginTourGuide = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for:", username);

    const tourGuide = await TourGuide.findOne({
      $or: [{ username }, { email: username }],
    }).select('+password');

    if (!tourGuide) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await tourGuide.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(tourGuide);

    return res.status(200).json({
      message: "Login successful",
      tourguide: {
        id: tourGuide._id,
        username: tourGuide.username,
        email: tourGuide.email,
        mobileNumber: tourGuide.mobileNumber,
        yearsOfExperience: tourGuide.yearsOfExperience,
        previousWork: tourGuide.previousWork,
        TandC: tourGuide.TandC,
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

    tourGuide.password = newPassword; // Will be hashed by pre-save middleware
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
// Update Tour Guide Profile (Protected Route)
export const updateTourGuideAccount = async (req, res) => {
  const { username } = req.params;
  const { email, mobileNumber, yearsOfExperience, previousWork, TandC } = req.body;

  try {
    // Check if the requesting user matches the username from token
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourGuide = await TourGuide.findOne({ username: username });
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    // Only update fields that are provided
    if (email) tourGuide.email = email;
    if (mobileNumber) tourGuide.mobileNumber = mobileNumber;
    if (yearsOfExperience) tourGuide.yearsOfExperience = yearsOfExperience;
    if (TandC !== undefined) tourGuide.TandC = TandC;

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
        TandC: tourGuide.TandC,
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
  const { currentPassword, newPassword } = req.body;
  const { _id } = req.user;

  try {
    const tourGuide = await TourGuide.findById(_id).select('+password');
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    const isMatch = await tourGuide.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    tourGuide.password = newPassword; // Will be hashed by pre-save middleware
    await tourGuide.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Verify the requesting user is the same as the one being deleted
    if (req.user._id !== id) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const tourGuide = await TourGuide.findById(id).session(session);
    if (!tourGuide) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Tour guide not found" });
    }

    // Find and update all associated itineraries to be inactive
    await Itinerary.updateMany(
      { createdBy: id },
      { $set: { isActive: false } },
      { session }
    );

    // Delete the tour guide
    await tourGuide.deleteOne({ session });

    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "Tour guide account deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting tour guide:", error);
    return res.status(500).json({
      message: "Error deleting tour guide",
      error: error.message,
    });
  } finally {
    session.endSession();
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
        TandC: tourGuide.TandC,
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

// Handle profile picture upload
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const tourGuide = await TourGuide.findById(req.user._id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    // Delete old profile picture if it exists
    if (tourGuide.profilePicture?.path) {
      try {
        fs.unlinkSync(tourGuide.profilePicture.path);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    // Update with new profile picture
    tourGuide.profilePicture = {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
    };

    await tourGuide.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: tourGuide.profilePicture,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};

export default {
  registerTourGuide,
  loginTourGuide,
  resetPassword,
  getTourGuideByUsername,
  updateTourGuideAccount,
  changePassword,
  getAllTourGuides,
  deleteTourGuide,
  getProfileByToken,
  getTourGuideItineraries,
  uploadProfilePicture,
};
