import Advertiser from "../models/advertiser.model.js";
import bcrypt from "bcrypt";

// Register a Advertiser
export const registerAdvertiser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingAdvertiser = await Advertiser.findOne({ email });
        if (existingAdvertiser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new Advertiser
        const newAdvertiser = new Advertiser({ username, email, password });
        await newAdvertiser.save();

        return res.status(201).json({ message: "Advertiser registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering Advertiser", error });
    }
};

// Login a Advertiser
export const loginAdvertiser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the Advertiser exists
        const Advertiser = await Advertiser.findOne({ email });
        if (!Advertiser) {
            return res.status(404).json({ message: "Advertiser not found" });
        }

        // Compare passwords
        const isMatch = await Advertiser.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Successful login
        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
    }
};
