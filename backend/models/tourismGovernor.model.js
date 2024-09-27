import mongoose from 'mongoose';
import BaseUser from './BaseUser';

const tourismGovernorSchema = new mongoose.Schema({
  jurisdiction: String,
  officeAddress: String,
  contactNumber: String,
  policiesManaged: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourismPolicy'
  }]
});

const TourismGovernor = BaseUser.discriminator('TourismGovernor', tourismGovernorSchema);

export default TourismGovernor;