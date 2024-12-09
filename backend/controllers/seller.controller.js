import Seller from "../models/seller.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import Otp from "../models/otp.model.js";
import sendEmail from "../utils/sendEmail.js";


dotenv.config();

// Generate JWT Token
const generateToken = (seller) => {
  return jwt.sign(
    {
      _id: seller._id,
      username: seller.username,
      email: seller.email,
      name: seller.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Register a Seller
export const registerSeller = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      description,
      mobileNumber
    } = req.body;

    console.log("Registration attempt for seller:", username);

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

    // Check for existing seller
    const existingSeller = await Seller.findOne({
      $or: [{ email }, { username }],
    });

    if (existingSeller) {
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
          existingSeller.email === email
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

    // Create new seller
    const newSeller = new Seller({
      username,
      email,
      password,
      name,
      description,
      mobileNumber,
      // TandC,
      ...fileData,
      
    });

    await newSeller.save();
    console.log("Seller saved successfully");

    const token = generateToken(newSeller);
    console.log("Token generated successfully");

    return res.status(201).json({
      message: "Seller registered successfully",
      seller: {
        id: newSeller._id,
        username: newSeller.username,
        email: newSeller.email,
        name: newSeller.name,
        description: newSeller.description,
        mobileNumber: newSeller.mobileNumber,
        businessLicense: newSeller.businessLicense.path,
        identificationDocument: newSeller.identificationDocument.path,
        TandC: newSeller.TandC, 

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

    console.error("Error registering seller:", error);
    return res
      .status(500)
      .json({ message: "Error registering seller", error: error.message });
  }
};

// Login a Seller
export const loginSeller = async (req, res) => {
  const { username, password } = req.body;

  try {
    const seller = await Seller.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!seller || !(await seller.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(seller);

    return res.status(200).json({
      message: "Login successful",
      seller: {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        name: seller.name,
        description: seller.description,
      },
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};

// Reset Password for Seller


// Change Password (Protected Route)
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const seller = await Seller.findById(req.user._id);
    if (!seller || !(await bcrypt.compare(currentPassword, seller.password))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    seller.password = newPassword;
    await seller.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};

// Get Seller Profile (Protected Route)
export const getSellerProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (req.user.username !== username) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const seller = await Seller.findOne({ username }).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      seller: {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        name: seller.name,
        description: seller.description,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching seller profile", error: error.message });
  }
};

// Update Seller Profile (Protected Route)
export const updateSellerAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, description, TandC } = req.body;  // Add TandC here

    if (req.user._id !== id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (username) seller.username = username;
    if (email) seller.email = email;
    if (name) seller.name = name;
    if (description) seller.description = description;
    if (TandC !== undefined) seller.TandC = TandC;  // Add this

    await seller.save();

    res.status(200).json({
      message: "Seller updated successfully",
      seller: {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        name: seller.name,
        description: seller.description,
        TandC: seller.TandC,  // Add this
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating seller", error: error.message });
  }
};

// Get All Sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password");
    res.status(200).json(sellers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sellers", error: error.message });
  }
};

// Delete Seller Account (Protected Route)
export const deleteSellerAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id !== id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    await seller.deleteOne();
    res.status(200).json({ message: "Seller account deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting seller account", error: error.message });
  }
};


export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Save OTP in the database
    await Otp.create({
      userId: seller._id,
      userType: 'Seller',
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
    // First find the seller to get their ID
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Look up the OTP using userId and the OTP value
    const otpRecord = await Otp.findOne({ 
      userId: seller._id,
      userType: 'Seller',
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
    const seller = await Seller.findOne({ email });
    
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Hash the password manually
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password directly without triggering middleware
    await Seller.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    await Otp.deleteMany({ 
      userId: seller._id,
      userType: 'Seller'
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};