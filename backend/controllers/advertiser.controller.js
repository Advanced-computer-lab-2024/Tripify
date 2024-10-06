import Advertiser from '../models/advertiser.model.js';
import bcrypt from 'bcrypt';

// Register an Advertiser
export const registerAdvertiser = async (req, res) => {
    const { username, email, password, companyName, companyDescription, website, hotline, companyLogo } = req.body;

    try {
        // Check if the email or username already exists
        const existingAdvertiser = await Advertiser.findOne({ $or: [{ email }, { username }] });
        if (existingAdvertiser) {
            return res.status(400).json({ message: 'Advertiser with this email or username already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new Advertiser instance
        const newAdvertiser = new Advertiser({
            username,
            email,
            password: hashedPassword,
            companyName,
            companyDescription,
            website,
            hotline,
            companyLogo
        });

        // Save the new advertiser
        await newAdvertiser.save();
        res.status(201).json({ message: "Advertiser registered successfully" });
    } catch (error) {
        console.error('Error registering advertiser:', error);
        res.status(500).json({ message: 'Error registering advertiser', error });
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
        const isMatch = await bcrypt.compare(password, advertiser.password);
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
                hotline: advertiser.hotline,
                companyLogo: advertiser.companyLogo,
            }
        });
    } catch (error) {
        console.error('Error logging in advertiser:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Get Advertiser Account Details by ID
export const getAdvertiserAccountById = async (req, res) => {
    const { id } = req.params;

    try {
        const advertiser = await Advertiser.findById(id);
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        res.status(200).json({
            id: advertiser._id,
            username: advertiser.username,
            email: advertiser.email,
            companyName: advertiser.companyName,
            companyDescription: advertiser.companyDescription,
            website: advertiser.website,
            hotline: advertiser.hotline,
            companyLogo: advertiser.companyLogo,
        });
    } catch (error) {
        console.error('Error fetching advertiser account details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Advertiser Account Details by Username and Email
export const getAdvertiserAccountByParams = async (req, res) => {
    const { username, email } = req.query;

    try {
        const advertiser = await Advertiser.findOne({ username, email });
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        res.status(200).json({
            id: advertiser._id,
            username: advertiser.username,
            email: advertiser.email,
            companyName: advertiser.companyName,
            companyDescription: advertiser.companyDescription,
            website: advertiser.website,
            hotline: advertiser.hotline,
            companyLogo: advertiser.companyLogo,
        });
    } catch (error) {
        console.error('Error fetching advertiser account details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an Advertiser
export const updateAdvertiserAccount = async (req, res) => {
    const { id } = req.params; // Get advertiser ID from URL parameters
    const { username, email, password, companyName, companyDescription, website, hotline, companyLogo } = req.body; // Extract updated fields

    try {
        const advertiser = await Advertiser.findById(id);
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        // Update the fields that are provided in the request
        advertiser.username = username || advertiser.username;
        advertiser.email = email || advertiser.email;
        if (password) {
            advertiser.password = await bcrypt.hash(password, 10); // Hash password if provided
        }
        advertiser.companyName = companyName || advertiser.companyName;
        advertiser.companyDescription = companyDescription || advertiser.companyDescription;
        advertiser.website = website || advertiser.website;
        advertiser.hotline = hotline || advertiser.hotline;
        advertiser.companyLogo = companyLogo || advertiser.companyLogo;

        const updatedAdvertiser = await advertiser.save(); // Save updated advertiser
        res.status(200).json(updatedAdvertiser);
    } catch (error) {
        console.error('Error updating advertiser:', error);
        res.status(500).json({ message: 'Error updating advertiser', error: error.message });
    }
};

// Delete an Advertiser
export const deleteAdvertiser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAdvertiser = await Advertiser.findByIdAndDelete(id);
        if (!deletedAdvertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }
        res.status(200).json({ message: 'Advertiser deleted successfully' });
    } catch (error) {
        console.error('Error deleting advertiser:', error);
        res.status(500).json({ message: error.message });
    }
};
