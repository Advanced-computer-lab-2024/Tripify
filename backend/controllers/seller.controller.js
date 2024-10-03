import Seller from "../models/seller.model.js";
import bcrypt from "bcrypt";

// Register a Seller
export const registerSeller = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new Seller
        const newSeller = new Seller({ username, email, password });
        await newSeller.save();

        return res.status(201).json({ message: "Seller registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering seller", error });
    }
};

// Login a Seller
export const loginSeller = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the seller exists
        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        // Compare passwords
        const isMatch = await seller.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Successful login
        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
    }
};
