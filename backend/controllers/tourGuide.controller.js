import TourGuide from "../models/tourguide.model.js";
import bcrypt from "bcrypt";

// Register a tour guide
export const registerTourGuide = async (req, res) => {
    const { username, email, password, mobileNumber, yearsOfExperience, previousWork } = req.body;

    try {
        // Check if the email or username already exists
        const existingTourGuideByEmail = await TourGuide.findOne({ email });
        const existingTourGuideByUsername = await TourGuide.findOne({ username });

        if (existingTourGuideByEmail || existingTourGuideByUsername) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new tour guide
        const newTourGuide = new TourGuide({
            username,
            email,
            password: hashedPassword,
            mobileNumber,
            yearsOfExperience,
            previousWork // Ensure this is structured correctly as an array of objects
        });

        await newTourGuide.save();
        return res.status(201).json({ message: "Tour guide registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering tour guide", error: error.message });
    }
};

// Login a tour guide
export const loginTourGuide = async (req, res) => {
    const { email, password } = req.body;

    try {
        const tourGuide = await TourGuide.findOne({ email });
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        const isMatch = await bcrypt.compare(password, tourGuide.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        return res.status(200).json({
            message: "Login successful",
            tourGuide: {
                id: tourGuide._id,
                username: tourGuide.username,
                email: tourGuide.email,
                mobileNumber: tourGuide.mobileNumber,
                yearsOfExperience: tourGuide.yearsOfExperience,
                previousWork: tourGuide.previousWork
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Get tour guide account details by username and email
export const getTourGuideAccount = async (req, res) => {
    const { username, email } = req.query;

    try {
        const tourGuide = await TourGuide.findOne({ username, email });
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        res.status(200).json({
            id: tourGuide._id,
            username: tourGuide.username,
            email: tourGuide.email,
            mobileNumber: tourGuide.mobileNumber,
            yearsOfExperience: tourGuide.yearsOfExperience,
            previousWork: tourGuide.previousWork
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching tour guide account details", error: error.message });
    }
};

// Update tour guide account details
export const updateTourGuideAccount = async (req, res) => {
    const { id } = req.params;
    const { username, email, mobileNumber, yearsOfExperience, previousWork } = req.body;

    try {
        const tourGuide = await TourGuide.findById(id);
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        // Update fields or keep old values if not provided
        tourGuide.username = username || tourGuide.username;
        tourGuide.email = email || tourGuide.email;
        tourGuide.mobileNumber = mobileNumber || tourGuide.mobileNumber;
        tourGuide.yearsOfExperience = yearsOfExperience || tourGuide.yearsOfExperience;

        // Ensure previousWork is an array of objects
        if (Array.isArray(previousWork)) {
            tourGuide.previousWork = previousWork.map(work => ({
                jobTitle: work.jobTitle || '',
                company: work.company || '',
                description: work.description || '',
                startDate: work.startDate || null,
                endDate: work.endDate || null
            }));
        } else {
            return res.status(400).json({ message: "Invalid format for previousWork. Expected an array of objects." });
        }

        await tourGuide.save();

        res.status(200).json({ message: "Tour guide updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error updating tour guide", error: error.message });
    }
};

// Get all tour guides
export const getAllTourGuides = async (req, res) => {
    try {
        const tourGuides = await TourGuide.find();
        return res.status(200).json(tourGuides);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching tour guides", error: error.message });
    }
};
