import mongoose from 'mongoose';
import BaseUser from './BaseUser';

const tourGuideSchema = new mongoose.Schema({
  // Mobile number for the tour guide
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number'] // Ensures valid international phone number format
  },
  
  // Years of experience in the field
  yearsOfExperience: {
    type: Number,
    required: true,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Unrealistic value for years of experience'] // Add validation based on common sense or user story
  },

  // List of previous work (if exists)
  previousWork: [{
    jobTitle: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: false
    },
    endDate: {
      type: Date,
      required: false
    }
  }],

  // Specialties of the tour guide (e.g., adventure, historical tours)
  specialties: [String],

  // Languages the tour guide speaks
  languages: [String],

  // Available dates for tours
  availableDates: [Date],

  // Tour guide rating between 1 and 5
  rating: {
    type: Number,
    min: 1,
    max: 5
  }

}, {
  timestamps: true
});

// Create the TourGuide model as a discriminator of BaseUser
const TourGuide = BaseUser.discriminator('TourGuide', tourGuideSchema);

export default TourGuide;
