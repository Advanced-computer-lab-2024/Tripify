import Seller from "../models/seller.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
    const { username, email, password, name, description, mobileNumber } =
      req.body;

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
export const resetPassword = async (req, res) => {
  const { identifier, newPassword } = req.body;

  try {
    const seller = await Seller.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.password = await bcrypt.hash(newPassword, 10);
    await seller.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

// Change Password (Protected Route)
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { _id } = req.user;

  console.log("Received request to change password for user:", _id);

  if (!currentPassword || !newPassword) {
    console.log("Missing current or new password");
    return res.status(400).send("Both current and new passwords are required");
  }

  try {
    // Log the passwords (be cautious with sensitive data in production)
    console.log("Current password provided:", currentPassword);
    console.log("New password provided:", newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("New password hashed:", hashedPassword);

    const seller = await Seller.findByIdAndUpdate(_id, {
      password: hashedPassword,
    });

    if (!seller) {
      console.log("Seller not found for ID:", _id);
      return res.status(404).send("Seller not found");
    }

    // Compare the current password with the stored password
    const isMatch = await seller.comparePassword(currentPassword);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Current password does not match");
      return res.status(400).send("Current password is incorrect");
    }

    console.log("Password updated successfully for user:", _id);
    res.status(200).send("Password updated successfully");
  } catch (err) {
    console.error("Error during password change:", err);
    res.status(500).send("Server error");
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
    const { username, email, name, description } = req.body;

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

    await seller.save();

    res.status(200).json({
      message: "Seller updated successfully",
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
