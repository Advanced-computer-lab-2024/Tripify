import Admin from "../models/admin.model.js";
import TourGuide from "../models/tourGuide.model.js";
import Tourist from "../models/tourist.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
import PromoCode from "../models/promoCode.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Booking from "../models/booking.model.js";

dotenv.config();

// Generate JWT Token with admin role
const generateToken = (admin) => {
  return jwt.sign(
    {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Register an Admin
export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });
    if (existingAdmin) {
      return res.status(400).json({
        message:
          existingAdmin.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();
    const token = generateToken(newAdmin);

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error registering admin", error });
  }
};

// In admin.controller.js

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required" });
    }

    // Find the admin and explicitly select the password field
    const admin = await Admin.findById(_id).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Set new password (it will be hashed by the pre-save middleware)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      message: "Error updating password",
      error: error.message,
    });
  }
};
// Login an Admin
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(admin);
    return res.status(200).json({
      message: "Login successful",
      admin: { id: admin._id, username: admin.username, email: admin.email },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
};

// List all users (Protected Admin Route)
export const listAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    const [tourGuides, tourists, advertisers, sellers, admins] =
      await Promise.all([
        TourGuide.find({}).select("-password"),
        Tourist.find({}).select("-password"),
        Advertiser.find({}).select("-password"),
        Seller.find({}).select("-password"),
        Admin.find({}).select("-password"),
      ]);

    const allUsers = [
      ...tourGuides.map((user) => ({
        ...user.toObject(),
        userType: "Tour Guide",
      })),
      ...tourists.map((user) => ({ ...user.toObject(), userType: "Tourist" })),
      ...advertisers.map((user) => ({
        ...user.toObject(),
        userType: "Advertiser",
      })),
      ...sellers.map((user) => ({ ...user.toObject(), userType: "Seller" })),
      ...admins.map((user) => ({ ...user.toObject(), userType: "Admin" })),
    ];

    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
};

// Delete user (Protected Admin Route)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    const { userId, userType } = req.body;
    let deletedUser;

    switch (userType.toLowerCase()) {
      case "tour guide":
        deletedUser = await TourGuide.findByIdAndDelete(userId);
        break;
      case "tourist":
        deletedUser = await Tourist.findByIdAndDelete(userId);
        break;
      case "advertiser":
        deletedUser = await Advertiser.findByIdAndDelete(userId);
        break;
      case "seller":
        deletedUser = await Seller.findByIdAndDelete(userId);
        break;
      case "admin":
        const adminCount = await Admin.countDocuments();
        if (adminCount <= 1) {
          return res
            .status(400)
            .json({ message: "Cannot delete the last admin account" });
        }
        deletedUser = await Admin.findByIdAndDelete(userId);
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser: {
        id: deletedUser._id,
        userType,
        email: deletedUser.email,
        username: deletedUser.username,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

// Get Admin Profile (Protected Route)
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin profile", error });
  }
};

// Get unverified sellers
export const getUnverifiedSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ isVerified: false }).select(
      "username email createdAt businessLicense identificationDocument isVerified"
    );
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unverified advertisers
export const getUnverifiedAdvertisers = async (req, res) => {
  try {
    const advertisers = await Advertiser.find({ isVerified: false }).select(
      "username email createdAt businessLicense identificationDocument isVerified"
    );
    res.json(advertisers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unverified tour guides
export const getUnverifiedTourGuides = async (req, res) => {
  try {
    const tourGuides = await TourGuide.find({ isVerified: false }).select(
      "username email createdAt identificationDocument certificate isVerified"
    );
    res.json(tourGuides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify seller
export const verifySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isVerified = isApproved;
    await seller.save();

    res.json({
      message: `Seller ${isApproved ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify advertiser
export const verifyAdvertiser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const advertiser = await Advertiser.findById(id);
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    advertiser.isVerified = isApproved;
    await advertiser.save();

    res.json({
      message: `Advertiser ${
        isApproved ? "approved" : "rejected"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify tour guide
export const verifyTourGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const tourGuide = await TourGuide.findById(id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    tourGuide.isVerified = isApproved;
    await tourGuide.save();

    res.json({
      message: `Tour guide ${
        isApproved ? "approved" : "rejected"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPromoCode = async (req, res) => {
  const { code, discount, expiryDate, usageLimit } = req.body;

  if (!code || !discount || !expiryDate || !usageLimit) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if promo code already exists
    const existingPromoCode = await PromoCode.findOne({ code });
    if (existingPromoCode) {
      return res.status(400).json({ message: "Promo code already exists" });
    }

    // Create new promo code
    const newPromoCode = new PromoCode({
      code,
      discount,
      expiryDate,
      usageLimit,
    });

    await newPromoCode.save();
    res.status(201).json({
      message: "Promo code created successfully",
      promoCode: newPromoCode,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating promo code", error });
  }
};

// Update an existing promo code (Admin Only)
export const updatePromoCode = async (req, res) => {
  const { id } = req.params; // Promo code ID from URL
  const { code, discount, expiryDate, usageLimit, isActive } = req.body;

  try {
    // Find promo code by ID
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    // Update fields
    promoCode.code = code || promoCode.code;
    promoCode.discount = discount || promoCode.discount;
    promoCode.expiryDate = expiryDate || promoCode.expiryDate;
    promoCode.usageLimit = usageLimit || promoCode.usageLimit;
    promoCode.isActive = isActive !== undefined ? isActive : promoCode.isActive;

    await promoCode.save();
    res
      .status(200)
      .json({ message: "Promo code updated successfully", promoCode });
  } catch (error) {
    res.status(500).json({ message: "Error updating promo code", error });
  }
};

// Delete a promo code (Admin Only)
export const deletePromoCode = async (req, res) => {
  const { id } = req.params; // Promo code ID from URL

  try {
    // Find and delete the promo code by ID
    const promoCode = await PromoCode.findByIdAndDelete(id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    res.status(200).json({ message: "Promo code deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting promo code", error });
  }
};

// Get all promo codes (Admin Only)
export const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.status(200).json(promoCodes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching promo codes", error });
  }
};
export const triggerBirthdayPromos = async (req, res) => {
  try {
    const results = await checkAndSendBirthdayPromos();
    res.status(200).json({
      message: "Birthday promos processed successfully",
      results,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing birthday promos", error });
  }
};

export const getItinerarySales = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingType: "Itinerary",
      status: { $in: ["confirmed", "completed", "attended"] },
    }).populate({
      path: "itemId",
      select: "name totalPrice",
    });

    const sales = bookings
      .filter((booking) => booking.itemId)
      .map((booking) => ({
        purchaseDate: booking.bookingDate,
        totalPrice: booking.itemId.totalPrice || 0,
        itemName: booking.itemId.name,
        bookingId: booking._id,
      }));

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getItinerarySales:", error);
    res.status(500).json({
      message: "Error fetching itinerary sales",
      error: error.message,
    });
  }
};

export const getActivitySales = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingType: "Activity",
      status: { $in: ["confirmed", "completed", "attended"] },
    }).populate({
      path: "itemId",
      select: "name price",
    });

    const sales = bookings
      .filter((booking) => booking.itemId)
      .map((booking) => ({
        purchaseDate: booking.bookingDate,
        totalPrice: booking.itemId.price || 0,
        itemName: booking.itemId.name,
        bookingId: booking._id,
      }));

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getActivitySales:", error);
    res.status(500).json({
      message: "Error fetching activity sales",
      error: error.message,
    });
  }
};

// In admin.controller.js, update the getProductSales function:

// In admin.controller.js, update the getProductSales function:

export const getProductSales = async (req, res) => {
  try {
    // Find all completed product purchases
    const bookings = await Booking.find({
      bookingType: "Product",
      // Include both confirmed and completed statuses
      status: { $in: ["confirmed", "completed"] },
    }).populate({
      path: "itemId",
      model: "Product", // Explicitly specify Product model
      select: "name price productImage seller",
    });

    // Map the sales data, ensuring we handle null itemId cases
    const sales = bookings
      .filter((booking) => booking.itemId !== null) // Filter out null items
      .map((booking) => {
        const price = booking.itemId.price || 0;
        const quantity = booking.quantity || 1;
        const totalPrice = price * quantity;

        return {
          purchaseDate: booking.bookingDate,
          totalPrice: totalPrice,
          itemName: booking.itemId.name,
          quantity: quantity,
          status: booking.status,
          // Include additional details that might be useful
          productId: booking.itemId._id,
          bookingId: booking._id,
        };
      });

    // Log the data for debugging
    console.log("Product Sales Data:", {
      totalBookings: bookings.length,
      validSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      sampleSale: sales[0],
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getProductSales:", error);
    res.status(500).json({
      message: "Error fetching product sales",
      error: error.message,
      stack: error.stack,
    });
  }
};
export const getHistoricalPlaceSales = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingType: "HistoricalPlace",
      status: { $in: ["confirmed", "completed", "attended"] },
    }).populate({
      path: "itemId",
      select: "name ticketPrices",
    });

    const sales = bookings
      .filter((booking) => booking.itemId)
      .map((booking) => ({
        purchaseDate: booking.bookingDate,
        totalPrice: booking.itemId.ticketPrices?.price || 0,
        itemName: booking.itemId.name,
        bookingId: booking._id,
      }));

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getHistoricalPlaceSales:", error);
    res.status(500).json({
      message: "Error fetching historical place sales",
      error: error.message,
    });
  }
};
