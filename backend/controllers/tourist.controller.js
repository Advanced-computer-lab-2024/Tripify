import Tourist from '../models/tourist.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Optional for token generation (if using authentication)

// Create a new tourist (sign up)
export const registerTourist = async (req, res) => {
  try {
    const { email, username, password, mobileNumber, nationality, dob, jobStatus, jobTitle } = req.body;
    // Check if user already exists
    const existingUser = await Tourist.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    // Validate job status
    if (!['student', 'job'].includes(jobStatus)) {
      return res.status(400).json({ message: 'Invalid job status' });
    }
    // If the user is not a student, ensure the job title is provided
    if (jobStatus === 'job' && !jobTitle) {
      return res.status(400).json({ message: 'Job title is required if you are not a student.' });
    }
    // Ensure user is not underage
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const ageCutoff = today.setFullYear(today.getFullYear() - 18); // 18 years ago
    if (birthDate > ageCutoff) {
      return res.status(403).json({ message: 'You must be 18 or older to register' });
    }
    // Create a new tourist instance
    const newTourist = new Tourist({
      email,
      username,
      password,
      mobileNumber,
      nationality,
      dob: birthDate,
      jobStatus,
      jobTitle: jobStatus === 'job' ? jobTitle : undefined // Assign job title only if jobStatus is 'job'
    });
    // Save the user in the database
    await newTourist.save();
    
    res.status(201).json({
      message: 'Tourist registered successfully',
      tourist: {
        id: newTourist._id,
        email: newTourist.email,
        username: newTourist.username,
        mobileNumber: newTourist.mobileNumber,
        nationality: newTourist.nationality,
        dob: newTourist.dob,
        jobStatus: newTourist.jobStatus,
        jobTitle: newTourist.jobTitle // Only present if jobStatus is 'job'
      },
      token // Optional if you want to authenticate right after registration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Login tourist (optional)
export const loginTourist = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const tourist = await Tourist.findOne({ email });
    if (!tourist) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Compare passwords
    const isMatch = await tourist.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    // Generate JWT token
    // const token = jwt.sign({ id: tourist._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Send success response
    res.status(200).json({
      message: 'Login successful',
      tourist: {
        id: tourist._id,
        email: tourist.email,
        username: tourist.username,
        mobileNumber: tourist.mobileNumber,
        nationality: tourist.nationality,
        dob: tourist.dob,
        jobStatus: tourist.jobStatus,
        jobTitle: tourist.jobTitle
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};