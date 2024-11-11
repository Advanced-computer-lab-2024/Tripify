import Admin from "../models/admin.model.js";
import TourGuide from "../models/tourguide.model.js";
import Tourist from "../models/tourist.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token with admin role
const generateToken = (admin) => {
  return jwt.sign(
    {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register an Admin
export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({
        message: existingAdmin.email === email ? "Email already exists" : "Username already taken"
      });
    }

    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();
    const token = generateToken(newAdmin);

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: { id: newAdmin._id, username: newAdmin.username, email: newAdmin.email },
      token
    });
  } catch (error) {
    return res.status(500).json({ message: "Error registering admin", error });
  }
};

// Login an Admin
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ $or: [{ username }, { email: username }] });
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
      token
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
};

// Reset Admin Password
export const resetPassword = async (req, res) => {
  const { identifier, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error resetting password", error });
  }
};

// Change Admin Password (Protected Route)
export const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error changing password", error });
  }
};

// List all users (Protected Admin Route)
export const listAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const [tourGuides, tourists, advertisers, sellers, admins] = await Promise.all([
      TourGuide.find({}).select('-password'),
      Tourist.find({}).select('-password'),
      Advertiser.find({}).select('-password'),
      Seller.find({}).select('-password'),
      Admin.find({}).select('-password')
    ]);

    const allUsers = [
      ...tourGuides.map(user => ({ ...user.toObject(), userType: 'Tour Guide' })),
      ...tourists.map(user => ({ ...user.toObject(), userType: 'Tourist' })),
      ...advertisers.map(user => ({ ...user.toObject(), userType: 'Advertiser' })),
      ...sellers.map(user => ({ ...user.toObject(), userType: 'Seller' })),
      ...admins.map(user => ({ ...user.toObject(), userType: 'Admin' }))
    ];

    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
};

// Delete user (Protected Admin Route)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const { userId, userType } = req.body;
    let deletedUser;

    switch (userType.toLowerCase()) {
      case 'tour guide':
        deletedUser = await TourGuide.findByIdAndDelete(userId);
        break;
      case 'tourist':
        deletedUser = await Tourist.findByIdAndDelete(userId);
        break;
      case 'advertiser':
        deletedUser = await Advertiser.findByIdAndDelete(userId);
        break;
      case 'seller':
        deletedUser = await Seller.findByIdAndDelete(userId);
        break;
      case 'admin':
        const adminCount = await Admin.countDocuments();
        if (adminCount <= 1) {
          return res.status(400).json({ message: "Cannot delete the last admin account" });
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
      deletedUser: { id: deletedUser._id, userType, email: deletedUser.email, username: deletedUser.username }
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

// Get Admin Profile (Protected Route)
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      admin: { id: admin._id, username: admin.username, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin profile", error });
  }
};

// Get all pending approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const [tourGuides, advertisers, sellers] = await Promise.all([
      TourGuide.find({ approvalStatus: 'pending' }).select('-password'),
      Advertiser.find({ approvalStatus: 'pending' }).select('-password'),
      Seller.find({ approvalStatus: 'pending' }).select('-password')
    ]);

    const pendingApprovals = {
      tourGuides: tourGuides.map(guide => ({
        ...guide.toObject(),
        userType: 'Tour Guide'
      })),
      advertisers: advertisers.map(advertiser => ({
        ...advertiser.toObject(),
        userType: 'Advertiser'
      })),
      sellers: sellers.map(seller => ({
        ...seller.toObject(),
        userType: 'Seller'
      }))
    };

    return res.status(200).json(pendingApprovals);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching pending approvals", error });
  }
};

// Update user approval status
export const updateApprovalStatus = async (req, res) => {
  const { userId, userType, status, rejectionReason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Invalid approval status" });
  }

  try {
    let user;
    let Model;

    switch (userType.toLowerCase()) {
      case 'tour guide':
        Model = TourGuide;
        break;
      case 'advertiser':
        Model = Advertiser;
        break;
      case 'seller':
        Model = Seller;
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    const updateData = {
      approvalStatus: status,
      ...(status === 'rejected' && { rejectionReason })
    };

    user = await Model.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: `User ${status} successfully`,
      user: {
        ...user.toObject(),
        userType
      }
    });
  } catch (error) {
    return res.status(500).json({ message: `Error updating user approval status`, error });
  }
};

// Get approval statistics
export const getApprovalStatistics = async (req, res) => {
  try {
    const stats = await Promise.all([
      TourGuide.aggregate([
        { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
      ]),
      Advertiser.aggregate([
        { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
      ]),
      Seller.aggregate([
        { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
      ])
    ]);

    const formatStats = (statArray) => {
      return statArray.reduce((acc, stat) => {
        acc[stat._id || 'pending'] = stat.count;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 });
    };

    const statistics = {
      tourGuides: formatStats(stats[0]),
      advertisers: formatStats(stats[1]),
      sellers: formatStats(stats[2])
    };

    return res.status(200).json(statistics);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching approval statistics", error });
  }
};
