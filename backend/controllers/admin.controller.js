import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";

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
