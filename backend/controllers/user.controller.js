import BaseUser from '../models/BaseUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Create JWT Token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role, firstName, lastName, age, gender } = req.body;

    // Ensure password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check for existing user
    const existingUser = await BaseUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create a new user
    const newUser = await BaseUser.create({
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      age,
      gender
    });

    // Create JWT token
    const token = signToken(newUser._id, newUser.role);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const user = await BaseUser.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Create JWT token
    const token = signToken(user._id, user.role);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user info
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating the password directly through this endpoint
    if (updates.password || updates.confirmPassword) {
      return res.status(400).json({ message: 'Use the password update route' });
    }

    // Update the user
    const updatedUser = await BaseUser.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Role-based access control middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};
