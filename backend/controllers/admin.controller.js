import Admin from "../models/admin.model.js";
import TourGuide from "../models/tourGuide.model.js";
import Tourist from "../models/tourist.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


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

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { _id } = req.user;

  if (!currentPassword || !newPassword) {
    return res.status(400).send("Both current and new passwords are required");
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const admin = await Admin.findByIdAndUpdate(_id, {
      password: hashedPassword,
    });

    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    // Compare the current password with the stored password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).send("Current password is incorrect");
    }

    res.status(200).send("Password updated successfully");
  } catch (err) {
    res.status(500).send("Server error");
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
    const sellers = await Seller.find({ isVerified: false })
      .select('username email createdAt businessLicense identificationDocument isVerified');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unverified advertisers
export const getUnverifiedAdvertisers = async (req, res) => {
  try {
    const advertisers = await Advertiser.find({ isVerified: false })
      .select('username email createdAt businessLicense identificationDocument isVerified');
    res.json(advertisers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unverified tour guides
export const getUnverifiedTourGuides = async (req, res) => {
  try {
    const tourGuides = await TourGuide.find({ isVerified: false })
      .select('username email createdAt identificationDocument certificate isVerified');
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
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.isVerified = isApproved;
    await seller.save();

    res.json({ message: `Seller ${isApproved ? 'approved' : 'rejected'} successfully` });
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
      return res.status(404).json({ message: 'Advertiser not found' });
    }

    advertiser.isVerified = isApproved;
    await advertiser.save();

    res.json({ message: `Advertiser ${isApproved ? 'approved' : 'rejected'} successfully` });
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
      return res.status(404).json({ message: 'Tour guide not found' });
    }

    tourGuide.isVerified = isApproved;
    await tourGuide.save();

    res.json({ message: `Tour guide ${isApproved ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
