import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  tripTypes: [{
    type: String,
    enum: ['historic', 'beaches', 'shopping', 'adventures', 'luxury', 'budget-friendly']
  }],
  budgetLimit: {
    type: Number
  },
  preferredDestinations: [String]
});

const Preference = mongoose.model('Preference', preferenceSchema);

export default Preference;