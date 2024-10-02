import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema
const guideAdvertiserSellerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['tour_guide', 'advertiser', 'seller', 'admin', 'tourist_governor'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash the password before saving the user
guideAdvertiserSellerSchema.pre('save', async function (next) {
  const user = this;

  // Hash the password if it has been modified or is new
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

// Method to compare password
guideAdvertiserSellerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const GuideAdvertiserSeller = mongoose.model('GuideAdvertiserSeller', guideAdvertiserSellerSchema);


export default GuideAdvertiserSeller;
