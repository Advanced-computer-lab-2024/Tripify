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
      jobTitle: jobStatus === 'job' ? jobTitle : undefined, // Assign job title only if jobStatus is 'job'
      wallet: 0
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
        jobTitle: newTourist.jobTitle, // Only present if jobStatus is 'job'
        wallet: newTourist.wallet,
      },
      // Optional if you want to authenticate right after registration
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
      
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTouristProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const tourist = await Tourist.findOne({ username }).lean(); // Use .lean() here

    if (!tourist) {
      return res.status(404).json({ message: 'Tourist not found' });
    }

    console.log(tourist); // Log the entire tourist object

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
        wallet: tourist.wallet // Ensure this is included
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};




// Update tourist profile
export const updateTouristProfile = async (req, res) => {
  try {
    const { email, mobileNumber, nationality, dob, jobStatus, jobTitle } = req.body;

    const { username } = req.params;
    const tourist = await Tourist.findOne({ username });
      if (!tourist) {
      return res.status(404).json({ message: 'Tourist not found' });
    }

    tourist.email = email || tourist.email;
    tourist.mobileNumber = mobileNumber || tourist.mobileNumber;
    tourist.nationality = nationality || tourist.nationality;
    tourist.dob = dob ? new Date(dob) : tourist.dob;
    tourist.jobStatus = jobStatus || tourist.jobStatus;
    tourist.jobTitle = jobStatus === 'job' ? jobTitle : undefined;
    

    await tourist.save();

    res.status(200).json({
      message: 'Tourist profile updated successfully',
      tourist: {
        id: tourist._id,
        email: tourist.email,
        username: tourist.username, // Non-editable field
        mobileNumber: tourist.mobileNumber,
        nationality: tourist.nationality,
        dob: tourist.dob,
        jobStatus: tourist.jobStatus,
        jobTitle: tourist.jobTitle,
        wallet: tourist.wallet // Non-editable field
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};
// Get all tourists for dropdown
export const getAllTourists = async (req, res) => {
  try {
    const tourists = await Tourist.find({}, 'username'); // Only fetch usernames for dropdown
    res.status(200).json(tourists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};
