<<<<<<< HEAD
import TourGuide from "../models/tourguide.model.js";
import bcrypt from "bcrypt";

// Register a Tour Guide
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
        console.error("Error registering tour guide:", error);
        return res.status(500).json({ message: "Error registering tour guide", error: error.message });
    }
};

// Login a Tour Guide
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
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Get Tour Guide Account Details by Username and Email
export const getTourGuideAccount = async (req, res) => {
    const { username, email } = req.query;

    try {
        const tourGuide = await TourGuide.findOne({ username, email });
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour Guide not found" });
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

// Update Tour Guide Account Details
export const updateTourGuideAccount = async (req, res) => {
    const { id } = req.params; // Get tour guide ID from URL parameters
    const { username, email, mobileNumber, yearsOfExperience, previousWork } = req.body; // Extract updated fields

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

        await tourGuide.save(); // Save updated tour guide details
        res.status(200).json({ message: "Tour guide updated successfully" });
    } catch (error) {
        console.error("Error updating tour guide:", error);
        return res.status(500).json({ message: "Error updating tour guide", error: error.message });
    }
};
export const getAllTourGuides = async (req, res) => {
    try {
        const tourGuides = await TourGuide.find();
        res.status(200).json(tourGuides);
    } catch (error) {
        console.error("Error fetching tour guides:", error);
        return res.status(500).json({ message: "Error fetching tour guides", error: error.message });
    }
}
export const deleteTourGuide = async (req, res) => {
    const { id } = req.params;

    try {
        const tourGuide = await TourGuide.findById(id);
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        await tourGuide.deleteOne();
        return res.status(200).json({ message: "Tour guide deleted successfully" });
    } catch (error) {
        console.error("Error deleting tour guide:", error);
        return res.status(500).json({ message: "Error deleting tour guide", error: error.message });
    }
};
export const getTourGuideByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const tourGuide = await TourGuide.findOne({
            username: username
        });
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }
        res.status(200).json(tourGuide);
    }
    catch (error) {
        console.error("Error fetching tour guide:", error);
        return res.status(500).json({ message: "Error fetching tour guide", error: error.message });
    }
}
=======
import TourGuide from "../models/tourguide.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import Itinerary from "../models/itinerary.model.js";
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token
const generateToken = (tourGuide) => {
  return jwt.sign(
    {
      _id: tourGuide._id,
      username: tourGuide.username,
      email: tourGuide.email,
      mobileNumber: tourGuide.mobileNumber,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register a Tour Guide
export const registerTourGuide = async (req, res) => {
    const { username, email, password, mobileNumber, yearsOfExperience, previousWork } = req.body;

    try {
        // Check if the email or username already exists
        const existingTourGuide = await TourGuide.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingTourGuide) {
            return res.status(400).json({ 
                message: existingTourGuide.email === email ? 
                    "Email already exists" : 
                    "Username already taken" 
            });
        }

        // Create a new tour guide
        const newTourGuide = new TourGuide({
            username,
            email,
            password, // Will be hashed by the model's pre-save hook
            mobileNumber,
            yearsOfExperience,
            previousWork
        });

        await newTourGuide.save();
        
        // Generate token
        const token = generateToken(newTourGuide);

        return res.status(201).json({ 
            message: "Tour guide registered successfully",
            tourGuide: {
                id: newTourGuide._id,
                username: newTourGuide.username,
                email: newTourGuide.email,
                mobileNumber: newTourGuide.mobileNumber,
                yearsOfExperience: newTourGuide.yearsOfExperience,
                previousWork: newTourGuide.previousWork
            },
            token
        });
    } catch (error) {
        console.error("Error registering tour guide:", error);
        return res.status(500).json({ message: "Error registering tour guide", error: error.message });
    }
};

// Login a Tour Guide
export const loginTourGuide = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the tour guide exists by username or email
        const tourGuide = await TourGuide.findOne({ 
            $or: [{ username }, { email: username }] 
        });

        if (!tourGuide) {
            return res.status(404).json({ message: "Invalid username or password" });
        }

        // Compare passwords
        const isMatch = await tourGuide.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate token
        const token = generateToken(tourGuide);

        // Successful login
        return res.status(200).json({
            message: "Login successful",
            tourGuide: {
                id: tourGuide._id,
                username: tourGuide.username,
                email: tourGuide.email,
                mobileNumber: tourGuide.mobileNumber,
                yearsOfExperience: tourGuide.yearsOfExperience,
                previousWork: tourGuide.previousWork
            },
            token
        });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Get Tour Guide Profile (Protected Route)
export const getTourGuideByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        // Check authorization
        if (req.user.username !== username) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const tourGuide = await TourGuide.findOne({ username }).select('-password');
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }
        res.status(200).json(tourGuide);
    }
    catch (error) {
        console.error("Error fetching tour guide:", error);
        return res.status(500).json({ message: "Error fetching tour guide", error: error.message });
    }
};

// Update Tour Guide Profile (Protected Route)
export const updateTourGuideAccount = async (req, res) => {
    const { id } = req.params;
    const { username, email, mobileNumber, yearsOfExperience, previousWork } = req.body;

    try {
        // Check authorization
        if (req.user._id !== id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const tourGuide = await TourGuide.findById(id);
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        // Update fields
        tourGuide.username = username || tourGuide.username;
        tourGuide.email = email || tourGuide.email;
        tourGuide.mobileNumber = mobileNumber || tourGuide.mobileNumber;
        tourGuide.yearsOfExperience = yearsOfExperience || tourGuide.yearsOfExperience;

        if (Array.isArray(previousWork)) {
            tourGuide.previousWork = previousWork.map(work => ({
                jobTitle: work.jobTitle || '',
                company: work.company || '',
                description: work.description || '',
                startDate: work.startDate || null,
                endDate: work.endDate || null
            }));
        }

        await tourGuide.save();
        
        res.status(200).json({
            message: "Tour guide updated successfully",
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
        console.error("Error updating tour guide:", error);
        return res.status(500).json({ message: "Error updating tour guide", error: error.message });
    }
};

// Get All Tour Guides (Optional: Could be admin-only route)
export const getAllTourGuides = async (req, res) => {
    try {
        const tourGuides = await TourGuide.find().select('-password');
        res.status(200).json(tourGuides);
    } catch (error) {
        console.error("Error fetching tour guides:", error);
        return res.status(500).json({ message: "Error fetching tour guides", error: error.message });
    }
};

// Delete Tour Guide (Protected Route)
export const deleteTourGuide = async (req, res) => {
    const { id } = req.params;

    try {
        // Check authorization
        if (req.user._id !== id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const tourGuide = await TourGuide.findById(id);
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        await tourGuide.deleteOne();
        return res.status(200).json({ message: "Tour guide deleted successfully" });
    } catch (error) {
        console.error("Error deleting tour guide:", error);
        return res.status(500).json({ message: "Error deleting tour guide", error: error.message });
    }
};


export const getProfileByToken = async (req, res) => {
    try {
        // req.user contains the decoded token information from authMiddleware
        const { _id } = req.user;

        const tourGuide = await TourGuide.findById(_id).select('-password');
        if (!tourGuide) {
            return res.status(404).json({ message: "Tour guide not found" });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
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
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};


export const getTourGuideItineraries = async (req, res) => {
    try {
        console.log('Fetching itineraries for tour guide:', req.user._id);
        
        const itineraries = await Itinerary.find({ createdBy: req.user._id })
            .populate('preferenceTags')
            .sort({ createdAt: -1 });
        
        console.log('Found itineraries:', itineraries.length);
        res.json(itineraries);
    } catch (error) {
        console.error('Error fetching tour guide itineraries:', error);
        res.status(500).json({ message: error.message });
    }
};
>>>>>>> jwtdemo
