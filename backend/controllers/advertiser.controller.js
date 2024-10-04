import Advertiser from '../models/advertiser.model.js';
import bcrypt from 'bcrypt';

// Register an Advertiser
export const registerAdvertiser = async (req, res) => {
    const { username, email, password, companyName, companyDescription, website, hotline, companyLogo } = req.body;
    
    try {
        // Check if email or username already exists
        const existingAdvertiser = await Advertiser.findOne({ email });
        if (existingAdvertiser) {
            return res.status(400).json({ message: 'Advertiser with this email already exists' });
        }

        // Create a new Advertiser instance
        const newAdvertiser = new Advertiser({
            username,
            email,
            password,  // Will be hashed by the pre-save hook in the schema zebra
            companyName,
            companyDescription,
            website,
            hotline,
            companyLogo
        });

        // Save the new advertiser
        const savedAdvertiser = await newAdvertiser.save();
        res.status(201).json(savedAdvertiser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login Advertiser
export const loginAdvertiser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the advertiser by email
        const advertiser = await Advertiser.findOne({ email });
        if (!advertiser) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await advertiser.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Successful login
        res.status(200).json({
            message: 'Login successful',
            advertiser: {
                id: advertiser._id,
                username: advertiser.username,
                email: advertiser.email,
                companyName: advertiser.companyName,
                companyDescription: advertiser.companyDescription,
                website: advertiser.website,
                hotline: advertiser.hotline
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Advertisers
export const getAllAdvertisers = async (req, res) => {
    try {
        const advertisers = await Advertiser.find().populate('activeAds');
        res.status(200).json(advertisers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get an Advertiser by ID
export const getAdvertiserById = async (req, res) => {
    const { id } = req.params;

    try {
        const advertiser = await Advertiser.findById(id).populate('activeAds');
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }
        res.status(200).json(advertiser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an Advertiser
export const updateAdvertiser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password, companyName, companyDescription, website, hotline, companyLogo } = req.body;

    try {
        // Find the advertiser by ID
        const advertiser = await Advertiser.findById(id);
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        // Update the fields that are provided in the request
        advertiser.username = username || advertiser.username;
        advertiser.email = email || advertiser.email;
        if (password) {
            advertiser.password = await bcrypt.hash(password, 10);  // Hash password if provided
        }
        advertiser.companyName = companyName || advertiser.companyName;
        advertiser.companyDescription = companyDescription || advertiser.companyDescription;
        advertiser.website = website || advertiser.website;
        advertiser.hotline = hotline || advertiser.hotline;
        advertiser.companyLogo = companyLogo || advertiser.companyLogo;

        // Save the updated advertiser
        const updatedAdvertiser = await advertiser.save();
        res.status(200).json(updatedAdvertiser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an Advertiser
export const deleteAdvertiser = async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the advertiser by ID
        const deletedAdvertiser = await Advertiser.findByIdAndDelete(id);
        if (!deletedAdvertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }
        res.status(200).json({ message: 'Advertiser deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};