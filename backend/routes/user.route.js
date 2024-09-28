import express from 'express';
import { createUserProfile, updateUserProfile, getUserProfile, deleteUserProfile } from '../controllers/user.controller.js';

const router = express.Router();

// Route to create a new user profile
router.post('/profile', createUserProfile);

// Route to update an existing user profile by ID
router.put('/profile/:id', updateUserProfile);

// Route to get user profile by ID
router.get('/profile/:id', getUserProfile);

// Route to delete user profile by ID
router.delete('/profile/:id', deleteUserProfile);

export default router;
