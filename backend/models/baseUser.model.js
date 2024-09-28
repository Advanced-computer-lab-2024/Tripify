import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


const baseUserSchema = new mongoose.Schema({
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
  profilePicture: {
    type: String
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true,
  discriminatorKey: 'role'
});

baseUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

baseUserSchema.methods.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

baseUserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  return resetToken;
};

const BaseUser = mongoose.model('BaseUser', baseUserSchema);

export default BaseUser;