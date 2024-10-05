import TourGuide from "../models/tourguide.model.js";
import bcrypt from "bcrypt";

// Register a tour guide
export const registerTourGuide = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the email already exists
        const existingTourGuide = await TourGuide.findOne({ email });
        if (existingTourGuide) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new tour guide
        const newTourGuide = new TourGuide({
            username,
            email,
            password: hashedPassword
        });

        await newTourGuide.save();
        return res.status(201).json({ message: "Tour guide registered successfully" });
    } catch (error) {
        console.error("Error registering tour guide:", error);
        return res.status(500).json({ message: "Error registering tour guide", error: error.message });
    }
};

// Login a tour guide
export const loginTourGuide = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the tour guide exists
        const tourGuide = await TourGuide.findOne({ email });
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, tourGuide.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Successful login
        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Get tour guide details by username from request body
export const getTourGuideByUsername = async (req, res) => {
    const { username } = req.body;

    try {
        // Find the tour guide by username
        const tourGuide = await TourGuide.findOne({ username });

        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        // Return tour guide details
        return res.status(200).json(tourGuide);
    } catch (error) {
        console.error("Error fetching tour guide details:", error);
        return res.status(500).json({ message: "Error fetching tour guide details", error: error.message });
    }
};
