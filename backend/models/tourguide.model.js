import mongoose from 'mongoose';
import BaseUser from './BaseUser';

const tourGuideSchema = new mongoose.Schema({
  specialties: [String],
  languages: [String],
  availableDates: [Date],
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

const TourGuide = BaseUser.discriminator('TourGuide', tourGuideSchema);

export default TourGuide;