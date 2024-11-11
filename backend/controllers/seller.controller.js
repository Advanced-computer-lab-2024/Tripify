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
  const { username, email, password, name, description } = req.body;

  try {
    const existingSeller = await Seller.findOne({
      $or: [{ email }, { username }],
    });

    if (existingSeller) {
      return res.status(400).json({
        message:
          existingSeller.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    const newSeller = new Seller({
      username,
      email,
      password,
      name,
      description,
    });
    await newSeller.save();

    const token = generateToken(newSeller);

    return res.status(201).json({
      message: "Seller registered successfully",
      seller: {
        id: newSeller._id,
        username: newSeller.username,
        email: newSeller.email,
        name: newSeller.name,
        description: newSeller.description,
      },
      token,
    });
  } catch (error) {
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
