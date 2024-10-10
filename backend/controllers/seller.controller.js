import Seller from "../models/seller.model.js";
import bcrypt from "bcrypt";

// Register a Seller
export const registerSeller = async (req, res) => {
    const { username, email, password, name, description } = req.body;

    try {
        const existingSellerByEmail = await Seller.findOne({ email });
        const existingSellerByUsername = await Seller.findOne({ username });

        if (existingSellerByEmail || existingSellerByUsername) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = new Seller({
            username,
            email,
            password: hashedPassword,
            name,
            description,
        });

        await newSeller.save();
        return res.status(201).json({ message: "Seller registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering seller", error: error.message });
    }
};

// Login a Seller
export const loginSeller = async (req, res) => {
    const { email, password } = req.body;

    try {
        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        return res.status(200).json({
            message: "Login successful",
            seller: {
                id: seller._id,
                username: seller.username,
                email: seller.email,
                name: seller.name,
                description: seller.description,
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

// Get Seller Account Details by ID
export const getSellerAccountById = async (req, res) => {
    const { id } = req.params;

    try {
        const seller = await Seller.findById(id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        res.status(200).json({
            id: seller._id,
            username: seller.username,
            email: seller.email,
            name: seller.name,
            description: seller.description,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching seller account details', error: error.message });
    }
};

// Get Seller Account Details by Username and Email
export const getSellerAccountByParams = async (req, res) => {
    const { username, email } = req.query;

    try {
        const seller = await Seller.findOne({ username, email });
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        res.status(200).json({
            id: seller._id,
            username: seller.username,
            email: seller.email,
            name: seller.name,
            description: seller.description,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching seller account details', error: error.message });
    }
};

// Update Seller Account Details
export const updateSellerAccount = async (req, res) => {
    const { id } = req.params; // Get seller ID from URL parameters
    const { username, email, name, description } = req.body; // Extract updated fields

    try {
        const seller = await Seller.findById(id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Update seller fields with new values or keep old values if not provided
        seller.username = username || seller.username;
        seller.email = email || seller.email;
        seller.name = name || seller.name;
        seller.description = description || seller.description;

        await seller.save(); // Save updated seller

        res.status(200).json({ message: 'Seller updated successfully' });
    } catch (error) {
        console.error('Error updating seller:', error);
        res.status(500).json({ message: 'Error updating seller', error: error.message });
    }
};
