import mongoose from "mongoose";
import Advertiser from "../models/advertiser.model.js";
import Activity from "../models/activity.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import Otp from "../models/otp.model.js";
import sendEmail from "../utils/sendEmail.js";
import Booking from "../models/booking.model.js";
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
  try {
    const {
      username,
      email,
      password,
      companyName,
      companyDescription,
      website,
      hotline,
    } = req.body;

    console.log("Registration attempt for advertiser:", username);

    // Validate required files
    if (
      !req.files ||
      !req.files.businessLicense ||
      !req.files.identificationDocument
    ) {
      return res.status(400).json({
        message: "Both business license and ID document are required",
        details: {
          businessLicense: !req.files?.businessLicense,
          identificationDocument: !req.files?.identificationDocument,
        },
      });
    }

    // Check for existing advertiser
    const existingAdvertiser = await Advertiser.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdvertiser) {
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
          existingAdvertiser.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    // Process file uploads
    const fileData = {
      businessLicense: {
        filename: req.files.businessLicense[0].filename,
        path: req.files.businessLicense[0].path,
        mimetype: req.files.businessLicense[0].mimetype,
        size: req.files.businessLicense[0].size,
        uploadDate: new Date(),
        isVerified: false,
      },
      identificationDocument: {
        filename: req.files.identificationDocument[0].filename,
        path: req.files.identificationDocument[0].path,
        mimetype: req.files.identificationDocument[0].mimetype,
        size: req.files.identificationDocument[0].size,
        uploadDate: new Date(),
        isVerified: false,
      },
    };

    // Create new advertiser
    const newAdvertiser = new Advertiser({
      username,
      email,
      password,
      companyName,
      companyDescription,
      website,
      hotline,
      ...fileData,
    });

    await newAdvertiser.save();
    console.log("Advertiser saved successfully");

    const token = generateToken(newAdvertiser);
    console.log("Token generated successfully");

    return res.status(201).json({
      message: "Advertiser registered successfully",
      advertiser: {
        id: newAdvertiser._id,
        username: newAdvertiser.username,
        email: newAdvertiser.email,
        companyName: newAdvertiser.companyName,
        companyDescription: newAdvertiser.companyDescription,
        website: newAdvertiser.website,
        hotline: newAdvertiser.hotline,
        businessLicense: newAdvertiser.businessLicense.path,
        identificationDocument: newAdvertiser.identificationDocument.path,
      },
      token,
    });
  } catch (error) {
    // Clean up uploaded files in case of error
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
    console.error("Error registering advertiser:", error);
    return res
      .status(500)
      .json({ message: "Error registering advertiser", error: error.message });
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
    console.log('Login attempt for username/email:', username);
    
    const advertiser = await Advertiser.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!advertiser) {
      console.log('No advertiser found for:', username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log('Found advertiser:', advertiser.email);
    console.log('Stored hashed password:', advertiser.password);
    console.log('Attempting to match with provided password');

    const isMatch = await bcrypt.compare(password, advertiser.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password match failed');
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(advertiser);
    console.log('Login successful, token generated');

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
    console.error('Login error:', error);
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
      TandC: advertiser.TandC, // Add this line
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update Advertiser Profile (Protected Route)
// Update Advertiser Profile (Protected Route)
export const updateAdvertiserByUsername = async (req, res) => {
  const { username } = req.params;
  const updates = req.body;

  try {
    // Ensure the user is authorized to update the profile
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Find the advertiser by username
    const advertiser = await Advertiser.findOne({ username });
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Update fields in the advertiser object
    Object.keys(updates).forEach((update) => {
      if (update !== "password" && update !== "_id") {
        advertiser[update] = updates[update];
      }
    });

    // Update T&C field if provided
    if (typeof updates.TandC !== "undefined") {
      advertiser.TandC = updates.TandC;
    }

    // Hash and update password if provided
    if (updates.password) {
      advertiser.password = await bcrypt.hash(updates.password, 10);
    }

    // Save the updated advertiser document
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
        TandC: advertiser.TandC, // Include updated T&C status
        companyLogo: advertiser.companyLogo,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
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
export const getAdvertiserSalesReport = async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await Activity.find({
      createdBy: id,
      flagged: { $ne: true },
    });

    const activityIds = activities.map((activity) => activity._id);

    const bookings = await Booking.find({
      bookingType: "Activity",
      itemId: { $in: activityIds },
      status: { $in: ["confirmed", "attended"] },
    }).populate({
      path: "itemId",
      select: "price name",
       model: 'Activity'
    });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        activities,
      },
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching sales data",
    });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists
    const advertiser = await Advertiser.findOne({ email });
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Save OTP in the database, adding userType and userId
    await Otp.create({
      userId: advertiser._id,  // The advertiser's ID
      userType: 'Advertiser',  // The user type (hardcoded as Advertiser here)
      otp,  // The OTP
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
    // First find the advertiser to get their ID
    const advertiser = await Advertiser.findOne({ email });
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Look up the OTP using userId and the OTP value
    const otpRecord = await Otp.findOne({ 
      userId: advertiser._id,
      userType: 'Advertiser',
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
    const advertiser = await Advertiser.findOne({ email });
    
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Hash the password manually
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password directly without triggering middleware
    await Advertiser.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    await Otp.deleteMany({ 
      userId: advertiser._id,
      userType: 'Advertiser'
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

export const getTouristReport = async (req, res) => {
  try {
    const { id } = req.params; // Advertiser ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Advertiser ID is required.",
      });
    }
    // Fetch all activities created by the advertiser
    const activities = await Activity.find({ createdBy: id });
    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No activities found for the advertiser.",
      });
    }
    // Extract activity IDs
    const activityIds = activities.map((activity) => activity._id);
    // Fetch confirmed or attended bookings related to these activities
    const bookings = await Booking.find({
      itemId: { $in: activityIds },
      bookingType: "Activity",
      status: "attended",
    }).populate("itemId", "_id name");
    
    // Count tourists
    const totalTourists = bookings.length;
    // Prepare response data
    const responseData = {
      totalTourists,
      activitiesCount: activities.length,
      bookingsCount: bookings.length,
      activities,
      bookings,
    };
    return res.status(200).json({
      success: true,
      message: "Tourist report fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error generating tourist report:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating the tourist report.",
      error: error.message,
    });
  }
};