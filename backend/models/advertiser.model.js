import mongoose from 'mongoose';
import BaseUser from './BaseUser';

const advertiserSchema = new mongoose.Schema({
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  activeAds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertisement'
  }]
});

const Advertiser = BaseUser.discriminator('Advertiser', advertiserSchema);

export default Advertiser;