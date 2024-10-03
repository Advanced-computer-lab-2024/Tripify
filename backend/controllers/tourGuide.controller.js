import tourGuide from "../models/tourGuide.model.js";
import bcrypt from "bcrypt";

// Register a tourGuide
export const registertourGuide = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingtourGuide = await tourGuide.findOne({ email });
        if (existingtourGuide) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new tourGuide
        const newtourGuide = new tourGuide({ username, email, password });
        await newtourGuide.save();

        return res.status(201).json({ message: "tourGuide registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering tourGuide", error });
    }
};

// Login a tourGuide
export const logintourGuide = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the tourGuide exists
        const tourGuide = await tourGuide.findOne({ email });
        if (!tourGuide) {
            return res.status(404).json({ message: "tourGuide not found" });
        }

        // Compare passwords
        const isMatch = await tourGuide.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Successful login
        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
    }
};
