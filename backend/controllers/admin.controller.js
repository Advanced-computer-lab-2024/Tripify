import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";
import TourGuide from "../models/tourguide.model.js";
import Tourist from "../models/tourist.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";

// Register an Admin
export const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new Admin
        const newAdmin = new Admin({ username, email, password });
        await newAdmin.save();

        return res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering admin", error });
    }
};

// Login an Admin
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Compare passwords
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Successful login
        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
    }
};


export const listAllUsers = async (req, res) => {
    try {
       
        const tourGuides = await TourGuide.find({});
        const tourists = await Tourist.find({});
        const advertisers = await Advertiser.find({});
        const sellers = await Seller.find({});
        const admins = await Admin.find({});

        
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

export const deleteUser = async (req, res) => {
    const { userId, userType } = req.body;

    try {
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
                deletedUser = await Admin.findByIdAndDelete(userId);
                break;
            default:
                return res.status(400).json({ message: "Invalid user type" });
        }

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting user", error });
    }
};