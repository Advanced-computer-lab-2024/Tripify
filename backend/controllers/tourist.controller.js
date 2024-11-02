import Tourist from '../models/tourist.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token
const generateToken = (tourist) => {
  return jwt.sign(
    {
      _id: tourist._id,
      username: tourist.username,
      email: tourist.email,
      mobileNumber: tourist.mobileNumber,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register Tourist
export const registerTourist = async (req, res) => {
  try {
    const { email, username, password, mobileNumber, nationality, dob, jobStatus, jobTitle } = req.body;
    
    // Check if user already exists
    const existingUser = await Tourist.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email is already registered' : 'Username is already taken' 
      });
    }

    // Validate job status
    if (!['student', 'job'].includes(jobStatus)) {
      return res.status(400).json({ message: 'Invalid job status' });
    }

    if (jobStatus === 'job' && !jobTitle) {
      return res.status(400).json({ message: 'Job title is required if you are not a student.' });
    }

    // Ensure user is not underage
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const ageCutoff = today.setFullYear(today.getFullYear() - 18);
    
    if (birthDate > ageCutoff) {
      return res.status(403).json({ message: 'You must be 18 or older to register' });
    }

    const newTourist = new Tourist({
      email,
      username,
      password,
      mobileNumber,
      nationality,
      dob: birthDate,
      jobStatus,
      jobTitle: jobStatus === 'job' ? jobTitle : undefined,
      Wallet: 0
    });

    await newTourist.save();
    
    const token = generateToken(newTourist);

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
        jobTitle: newTourist.jobTitle,
        Wallet: newTourist.Wallet,
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Login Tourist with username
export const loginTourist = async (req, res) => {
  try {
    const { username, password } = req.body;

    const tourist = await Tourist.findOne({ username }) || await Tourist.findOne({ email: username });
    if (!tourist) {
      return res.status(404).json({ message: 'Invalid username or password' });
    }

    const isMatch = await tourist.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(tourist);

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
        jobTitle: tourist.jobTitle,
        Wallet: tourist.Wallet
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Tourist Profile
export const getTouristProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check authorization using the decoded token from middleware
    if (req.user.username !== username) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const tourist = await Tourist.findOne({ username }).lean();

    if (!tourist) {
      return res.status(404).json({ message: 'Tourist not found' });
    }

    res.status(200).json({
      message: 'Tourist profile fetched successfully',
      tourist: {
        email: tourist.email,
        username: tourist.username,
        mobileNumber: tourist.mobileNumber,
        nationality: tourist.nationality,
        dob: tourist.dob,
        jobStatus: tourist.jobStatus,
        jobTitle: tourist.jobTitle,
        Wallet: tourist.Wallet
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update Tourist Profile
export const updateTouristProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check authorization using the decoded token from middleware
    if (req.user.username !== username) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { email, mobileNumber, nationality, jobStatus, jobTitle } = req.body;

    const tourist = await Tourist.findOne({ username });
    if (!tourist) {
      return res.status(404).json({ message: 'Tourist not found' });
    }

    tourist.email = email || tourist.email;
    tourist.mobileNumber = mobileNumber || tourist.mobileNumber;
    tourist.nationality = nationality || tourist.nationality;
    tourist.jobStatus = jobStatus || tourist.jobStatus;
    tourist.jobTitle = jobStatus === 'job' ? jobTitle : undefined;

    await tourist.save();

    res.status(200).json({
      message: 'Tourist profile updated successfully',
      tourist: {
        id: tourist._id,
        email: tourist.email,
        username: tourist.username,
        mobileNumber: tourist.mobileNumber,
        nationality: tourist.nationality,
        dob: tourist.dob,
        jobStatus: tourist.jobStatus,
        jobTitle: tourist.jobTitle,
        Wallet: tourist.Wallet
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all tourists
export const getAllTourists = async (req, res) => {
  try {
    const tourists = await Tourist.find({}, 'username');
    res.status(200).json(tourists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};