import mongoose from "mongoose";
import Advertiser from "../models/advertiser.model.js";
import Activity from "../models/activity.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT Token
const generateToken = (advertiser) => {
  return jwt.sign(
    {
      _id: advertiser._id,
      username: advertiser.username,
      email: advertiser.email,
      companyName: advertiser.companyName,
      role: "advertiser",
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Register an Advertiser
export const registerAdvertiser = async (req, res) => {
  const {
    username,
    email,
    password,
    companyName,
    companyDescription,
    website,
    hotline,
    companyLogo,
  } = req.body;

  try {
    const existingAdvertiser = await Advertiser.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdvertiser) {
      return res.status(400).json({
        message:
          existingAdvertiser.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    const newAdvertiser = new Advertiser({
      username,
      email,
      password,
      companyName,
      companyDescription,
      website,
      hotline,
      companyLogo,
    });

    await newAdvertiser.save();

    const token = generateToken(newAdvertiser);

    res.status(201).json({
      message: "Advertiser registered successfully",
      advertiser: {
        id: newAdvertiser._id,
        username: newAdvertiser.username,
        email: newAdvertiser.email,
        companyName: newAdvertiser.companyName,
        companyDescription: newAdvertiser.companyDescription,
        website: newAdvertiser.website,
        hotline: newAdvertiser.hotline,
        companyLogo: newAdvertiser.companyLogo,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const advertiser = await Advertiser.findByIdAndUpdate(_id, {
      password: hashedPassword,
    });

    if (!advertiser) {
      return res.status(404).send("Admin not found");
    }

    // Compare the current password with the stored password
    const isMatch = await advertiser.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).send("Current password is incorrect");
    }

    res.status(200).send("Password updated successfully");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Login Advertiser
export const loginAdvertiser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const advertiser = await Advertiser.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!advertiser) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await advertiser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(advertiser);

    res.status(200).json({
      message: "Login successful",
      advertiser: {
        id: advertiser._id,
        username: advertiser.username,
        email: advertiser.email,
        companyName: advertiser.companyName,
        companyDescription: advertiser.companyDescription,
        website: advertiser.website,
        hotline: advertiser.hotline,
        companyLogo: advertiser.companyLogo,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Advertiser Profile (Protected Route)
export const getAdvertiserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    if (req.user.username !== username && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const advertiser = await Advertiser.findOne({ username }).select(
      "-password"
    );
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    res.status(200).json({
      id: advertiser._id,
      username: advertiser.username,
      email: advertiser.email,
      companyName: advertiser.companyName,
      companyDescription: advertiser.companyDescription,
      website: advertiser.website,
      hotline: advertiser.hotline,
      companyLogo: advertiser.companyLogo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Advertiser Profile (Protected Route)
export const updateAdvertiserByUsername = async (req, res) => {
  const { username } = req.params;
  const updates = req.body;

  try {
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const advertiser = await Advertiser.findOne({ username });
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    Object.keys(updates).forEach((update) => {
      if (update !== "password" && update !== "_id") {
        advertiser[update] = updates[update];
      }
    });

    if (updates.password) {
      advertiser.password = updates.password;
    }

    await advertiser.save();

    res.status(200).json({
      message: "Profile updated successfully",
      advertiser: {
        id: advertiser._id,
        username: advertiser.username,
        email: advertiser.email,
        companyName: advertiser.companyName,
        companyDescription: advertiser.companyDescription,
        website: advertiser.website,
        hotline: advertiser.hotline,
        companyLogo: advertiser.companyLogo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Advertiser (Protected Route)
export const deleteAdvertiser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the requesting user is the same as the one being deleted
    if (req.user._id !== id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Find the advertiser
    const advertiser = await Advertiser.findById(id);
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Update all associated activities to be inactive
    await Activity.updateMany({ createdBy: id }, { $set: { isActive: false } });

    // Delete the advertiser
    await advertiser.deleteOne();

    return res
      .status(200)
      .json({ message: "Advertiser account deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertiser:", error);
    return res.status(500).json({
      message: "Error deleting advertiser",
      error: error.message,
    });
  }
};

// Get All Advertisers (Public Route)
export const getAllAdvertisers = async (req, res) => {
  try {
    const advertisers = await Advertiser.find().select("-password");
    res.status(200).json(advertisers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Advertiser by ID (Protected Route)
export const getAdvertiserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user._id !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const advertiser = await Advertiser.findById(id)
      .select("-password")
      .populate("activeAds");

    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    res.status(200).json(advertiser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Advertiser Activities (Protected Route)
export const getAdvertiserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ createdBy: req.user._id })
      .populate("category")
      .populate("tags")
      .sort({ date: -1 });

    res.json(activities);
  } catch (error) {
    console.error("Error fetching advertiser activities:", error);
    res.status(500).json({ message: "Error fetching activities" });
  }
};
