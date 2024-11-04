import Admin from "../models/admin.model.js";
import TourGuide from "../models/tourguide.model.js";
import Tourist from "../models/tourist.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
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
      role: 'admin' // Adding role for admin-specific authorization
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register an Admin
export const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the email or username already exists
        const existingAdmin = await Admin.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingAdmin) {
            return res.status(400).json({ 
                message: existingAdmin.email === email ? 
                    "Email already exists" : 
                    "Username already taken" 
            });
        }

        // Create a new Admin
        const newAdmin = new Admin({ username, email, password });
        await newAdmin.save();

        // Generate token
        const token = generateToken(newAdmin);

        return res.status(201).json({ 
            message: "Admin registered successfully",
            admin: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email
            },
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
        // Check if admin exists by username or email
        const admin = await Admin.findOne({ 
            $or: [{ username }, { email: username }] 
        });

        if (!admin) {
            return res.status(404).json({ message: "Invalid username or password" });
        }

        // Compare passwords
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate token
        const token = generateToken(admin);

        // Successful login
        return res.status(200).json({ 
            message: "Login successful",
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            },
            token
        });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
    }
};

// List all users (Protected Admin Route)
export const listAllUsers = async (req, res) => {
    try {
        // Verify that the requester is an admin
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
        // Verify that the requester is an admin
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
                // Prevent deleting the last admin
                const adminCount = await Admin.countDocuments();
                if (adminCount <= 1) {
                    return res.status(400).json({ 
                        message: "Cannot delete the last admin account" 
                    });
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
                username: deletedUser.username
            }
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
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin profile", error });
    }
};