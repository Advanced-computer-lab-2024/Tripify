import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'tourist', 'admin', 'tourguide', 'advertiser', 'seller', 'tourism governor'],
    default: 'user'
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: [18, 'You must be at least 18 years old to create an account']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  profilePicture: String,
  dateJoined: {
    type: Date,
    default: Date.now
  },
  favoriteDeals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  listedDeals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  wallet: {
    creditNumber: {
      type: String,
      immutable: true 
    },
    balance: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;