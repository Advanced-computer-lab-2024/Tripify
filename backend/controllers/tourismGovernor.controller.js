import TourismGovernor from "../models/toursimGovernor.model.js";
import bcrypt from "bcrypt";

// Register a Tourism Governor
export const registerTourismGovernor = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingGovernor = await TourismGovernor.findOne({ email });
        if (existingGovernor) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new Tourism Governor
        const newGovernor = new TourismGovernor({ username, email, password });
        await newGovernor.save();

        return res.status(201).json({ message: "Tourism Governor registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering tourism governor", error });
    }
};

// Login a Tourism Governor
export const loginTourismGovernor = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the tourism governor exists
        const governor = await TourismGovernor.findOne({ email });
        if (!governor) {
            return res.status(404).json({ message: "Tourism Governor not found" });
        }

        // Compare passwords
        const isMatch = await governor.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Successful login
        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
    }
};


export const getTourismGovernors = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (id) {
            // If an ID is provided, fetch a single governor
            const governor = await TourismGovernor.findById(id).select('-password');
            if (!governor) {
                return res.status(404).json({ message: "Tourism Governor not found" });
            }
            return res.status(200).json(governor);
        } else {
            // If no ID is provided, fetch all governors
            const governors = await TourismGovernor.find().select('-password');
            return res.status(200).json(governors);
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching tourism governor(s)", error });
    }
};