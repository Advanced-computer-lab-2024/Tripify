import mongoose from 'mongoose';
import BaseUser from './BaseUser';

const sellerSchema = new mongoose.Schema({
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  listedDeals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  }]
});

const Seller = BaseUser.discriminator('Seller', sellerSchema);

export default Seller;