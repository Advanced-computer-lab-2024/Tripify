import mongoose from "mongoose";

// Define user types
const USER_TYPES = ['Tourist', 'TourGuide', 'Advertiser', 'TourismGovernor', 'Admin', 'Seller'];

// OTP Schema
const otpSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'userType' // Reference based on userType
  },
  userType: {
    type: String,
    enum: USER_TYPES, // Enforce user type
    required: true
  },
  otp: {
    type: String, // Store the hashed OTP here
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL (5 minutes)
  }
}, { timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
