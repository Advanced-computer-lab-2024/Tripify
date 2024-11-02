import TourismGovernor from "../models/toursimGovernor.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token
const generateToken = (governor) => {
  return jwt.sign(
    {
      _id: governor._id,
      username: governor.username,
      email: governor.email,
      role: 'governor' // Adding role for additional security
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register a Tourism Governor
export const registerTourismGovernor = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the email or username already exists
        const existingGovernor = await TourismGovernor.findOne({ 
          $or: [{ email }, { username }] 
        });

        if (existingGovernor) {
            return res.status(400).json({ 
              message: existingGovernor.email === email ? 
                "Email already exists" : 
                "Username already taken" 
            });
        }

        // Create a new Tourism Governor
        const newGovernor = new TourismGovernor({ username, email, password });
        await newGovernor.save();

        // Generate token
        const token = generateToken(newGovernor);

        return res.status(201).json({ 
            message: "Tourism Governor registered successfully",
            governor: {
                id: newGovernor._id,
                username: newGovernor.username,
                email: newGovernor.email
            },
            token
        });
    } catch (error) {
        return res.status(500).json({ message: "Error registering tourism governor", error });
    }
};

// Login a Tourism Governor
export const loginTourismGovernor = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the tourism governor exists by email
        const governor = await TourismGovernor.findOne({ email });
        if (!governor) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await governor.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken(governor);

        // Successful login
        return res.status(200).json({ 
            message: "Login successful",
            governor: {
                id: governor._id,
                username: governor.username,
                email: governor.email
            },
            token
        });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error });
    }
};

// Get Tourism Governor Profile (Protected Route)
export const getTourismGovernorProfile = async (req, res) => {
    try {
        // The ID comes from the authenticated user's token
        const governorId = req.user._id;
        
        const governor = await TourismGovernor.findById(governorId).select('-password');
        if (!governor) {
            return res.status(404).json({ message: "Tourism Governor not found" });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            governor
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching profile", error });
    }
};

// Get All Tourism Governors (Protected Admin Route)
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

// Update Tourism Governor Profile (Protected Route)
export const updateTourismGovernorProfile = async (req, res) => {
    try {
        // The ID comes from the authenticated user's token
        const governorId = req.user._id;
        const { username, email } = req.body;

        const governor = await TourismGovernor.findById(governorId);
        if (!governor) {
            return res.status(404).json({ message: "Tourism Governor not found" });
        }

        // Update fields if provided
        if (username) governor.username = username;
        if (email) governor.email = email;

        await governor.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            governor: {
                id: governor._id,
                username: governor.username,
                email: governor.email
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Error updating profile", error });
    }
};