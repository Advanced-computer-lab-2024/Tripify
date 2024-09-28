import TourGuide from '../models/tourguide.model.js';
import Advertiser from '../models/advertiser.model.js';
import Seller from '../models/seller.model.js';
import BaseUser from '../models/baseUser.model.js';

// Create a new user profile
export const createUserProfile = async (req, res) => {
    try {
        console.log('Entering createUserProfile');
        console.log('Request body:', req.body);

        const { role, ...userData } = req.body;

        // Ensure that role is provided and is a valid type
        if (!role || !['tourguide', 'advertiser', 'seller'].includes(role)) {
            console.log('Invalid role');
            return res.status(400).json({ message: 'Invalid role' });
        }

        let user;

        // Create user based on the role
        if (role === 'tourguide') {
            console.log('Creating TourGuide');
            user = new TourGuide(userData);
        } else if (role === 'advertiser') {
            console.log('Creating Advertiser');
            user = new Advertiser(userData);
        } else if (role === 'seller') {
            console.log('Creating Seller');
            user = new Seller(userData);
        }

        console.log('Saving user');
        await user.save();

        console.log('User saved successfully');
        res.status(201).json(user);
    } catch (error) {
        console.error('Error in createUserProfile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update an existing user profile
export const updateUserProfile = async (req, res) => {
    try {
        console.log('Entering updateUserProfile');
        const { role, ...userData } = req.body;

        if (!role || !['tourguide', 'advertiser', 'seller'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        let user;

        // Update user based on the role
        if (role === 'tourguide') {
            console.log('Updating TourGuide');
            user = await TourGuide.findByIdAndUpdate(req.params.id, userData, { new: true });
        } else if (role === 'advertiser') {
            console.log('Updating Advertiser');
            user = await Advertiser.findByIdAndUpdate(req.params.id, userData, { new: true });
        } else if (role === 'seller') {
            console.log('Updating Seller');
            user = await Seller.findByIdAndUpdate(req.params.id, userData, { new: true });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get Profile by ID
export const getUserProfile = async (req, res) => {
    try {
        const user = await BaseUser.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete a User Profile
export const deleteUserProfile = async (req, res) => {
    try {
        const user = await BaseUser.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(204).send(); // No content to send in the response
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
};
