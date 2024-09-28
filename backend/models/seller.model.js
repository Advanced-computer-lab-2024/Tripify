import mongoose from 'mongoose';
import BaseUser from '../models/baseUser.model.js';

const sellerSchema = new mongoose.Schema({
  // Name of the seller
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Description of the seller
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Company name of the seller (if applicable)
  companyName: {
    type: String,
    required: false, // Optional since it may not apply to all sellers
    trim: true
  },
  
  // Description of the company (if applicable)
  companyDescription: {
    type: String,
    required: false, // Optional
    trim: true
  },
  
  // Company logo URL (if applicable)
  companyLogo: {
    type: String,
    required: false // Optional
  },

  // List of deals that the seller has listed
  listedDeals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  }]

}, {
  timestamps: true
});

// Create the Seller model as a discriminator of BaseUser
const Seller = BaseUser.discriminator('Seller', sellerSchema);

export default Seller;
