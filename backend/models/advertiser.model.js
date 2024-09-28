import mongoose from 'mongoose';
import BaseUser from '../models/baseUser.model.js';

const advertiserSchema = new mongoose.Schema({
  // Company name of the advertiser
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Description of the company
  companyDescription: {
    type: String,
    required: true,
    trim: true
  },
  
  // URL for the company's website
  website: {
    type: String,
    required: true,
    match: [/^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/([\w/._-]*(\?\S+)?)?)?$/, 'Please enter a valid website URL'] // Basic URL validation
  },
  
  // Hotline for customer service
  hotline: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid hotline number'] // Ensures valid international phone number format
  },
  
  // Company logo URL
  companyLogo: {
    type: String,
    required: true,
  },
  
  // Array of active advertisements linked to the advertiser
  activeAds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertisement'
  }]

}, {
  timestamps: true
});

// Create the Advertiser model as a discriminator of BaseUser
const Advertiser = BaseUser.discriminator('Advertiser', advertiserSchema);

export default Advertiser;
