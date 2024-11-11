import Advertiser from "../models/advertiser.model.js";
import Activity from "../models/activity.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token
const generateToken = (advertiser) => {
  return jwt.sign(
    {
      _id: advertiser._id,
      username: advertiser.username,
      email: advertiser.email,
      companyName: advertiser.companyName,
      role: 'advertiser'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const requestDeletion = async (req, res) => {
  try {
      const { _id } = req.user; // Assume user is authenticated and _id is in req.user

      // Check for upcoming activities with confirmed and paid bookings
      const hasUpcomingConfirmedPaidActivities = await Activity.exists({
          createdBy: _id,
          date: { $gte: new Date() }, // Check if the activity is upcoming
          "bookings.status": "paid", // Confirm booking is paid
          "bookings.confirmed": true  // Check that the booking is confirmed
      });

      if (hasUpcomingConfirmedPaidActivities) {
          return res.status(400).json({
              message: "Cannot delete account with upcoming confirmed and paid activities or bookings."
          });
      }

      // If no upcoming confirmed and paid activities, proceed with marking account for deletion
      const advertiser = await Advertiser.findByIdAndUpdate(
          _id,
          { isDeletionRequested: true },
          { new: true }
      );

      if (!advertiser) {
          return res.status(404).json({ message: "Advertiser not found" });
      }

      res.status(200).json({
          message: "Deletion request submitted successfully",
          advertiser: { id: advertiser._id, isDeletionRequested: advertiser.isDeletionRequested }
      });
  } catch (error) {
      console.error("Error requesting account deletion:", error);
      res.status(500).json({ message: "Error requesting deletion", error: error.message });
  }
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
      $or: [{ email }, { username }] 
    });

    if (existingAdvertiser) {
      return res.status(400).json({ 
        message: existingAdvertiser.email === email ? 
          "Email already exists" : 
          "Username already taken" 
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
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Advertiser
export const loginAdvertiser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const advertiser = await Advertiser.findOne({ 
      $or: [{ username }, { email: username }] 
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
        termsAccepted: advertiser.termsAccepted, // Include this so frontend knows the status
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Reset Password for Advertiser
export const resetPassword = async (req, res) => {
  const { identifier, newPassword } = req.body;

  try {
    // Find advertiser by email or username
    const advertiser = await Advertiser.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Hash and update the new password
    advertiser.password = await bcrypt.hash(newPassword, 10);
    await advertiser.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};

// Change Password for Advertiser (Protected Route)
export const changeAdvertiserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const advertiser = await Advertiser.findById(req.user._id);
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, advertiser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    advertiser.password = await bcrypt.hash(newPassword, 10);
    await advertiser.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
};

// Get Advertiser Profile (Protected Route)
export const getAdvertiserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    if (req.user.username !== username && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const advertiser = await Advertiser.findOne({ username }).select('-password');
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
      if (update !== 'password' && update !== '_id') {
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
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//accept terms and conditions
// Accept Terms for Advertiser
export const acceptTerms = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.user._id);
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    advertiser.termsAccepted = true;
    await advertiser.save();

    res.status(200).json({ message: "Terms accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting terms", error: error.message });
  }
};

// Delete Advertiser (Protected Route)
export const deleteAdvertiser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the requesting user is the advertiser or an admin
    if (req.user._id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Check for upcoming activities with paid bookings
    const hasUpcomingActivities = await Activity.exists({
      createdBy: id,
      date: { $gte: new Date() },
      "bookings.status": "paid", // Assumes a 'bookings' array with 'status' field
    });

    if (hasUpcomingActivities) {
      return res.status(400).json({
        message: "Cannot delete account with upcoming paid activities or bookings."
      });
    }

    // Delete all activities associated with the advertiser
    await Activity.deleteMany({ createdBy: id });

    // Delete the advertiser profile
    const deletedAdvertiser = await Advertiser.findByIdAndDelete(id);
    if (!deletedAdvertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    res.status(200).json({ message: "Advertiser and associated activities deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertiser:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Advertisers (Public Route)
export const getAllAdvertisers = async (req, res) => {
  try {
    const advertisers = await Advertiser.find().select('-password');
    res.status(200).json(advertisers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Advertiser by ID (Protected Route)
export const getAdvertiserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user._id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const advertiser = await Advertiser.findById(id)
      .select('-password')
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
          .populate('category')
          .populate('tags')
          .sort({ date: -1 });
      
      res.json(activities);
  } catch (error) {
      console.error('Error fetching advertiser activities:', error);
      res.status(500).json({ message: 'Error fetching activities' });
  }
};
