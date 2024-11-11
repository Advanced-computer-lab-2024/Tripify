import TourismGovernor from "../models/toursimGovernor.model.js";
import bcrypt from "bcrypt";
import HistoricalPlace from "../models/histroicalplace.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
export const loginTourismGovernor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const governor = await TourismGovernor.findOne({ email });
    if (!governor) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await governor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(governor);

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
    console.error("Error logging in:", error);
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

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { _id } = req.user;

  if (!currentPassword || !newPassword) {
    return res.status(400).send("Both current and new passwords are required");
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const governor = await TourismGovernor.findByIdAndUpdate(_id, {
      password: hashedPassword,
    });

    if (!governor) {
      return res.status(404).send("Admin not found");
    }

    // Compare the current password with the stored password
    const isMatch = await governor.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).send("Current password is incorrect");
    }

    res.status(200).send("Password updated successfully");
  } catch (err) {
    res.status(500).send("Server error");
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
