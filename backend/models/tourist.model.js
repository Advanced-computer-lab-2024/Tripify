<<<<<<< HEAD
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema
const touristSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  nationality: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true,
    immutable: true // Prevents DOB from being changed
  },
  jobStatus: {
    type: String,
    enum: ['student', 'job'],
    required: true
  },
  jobTitle: {
    type: String,
    required: function() {
      return this.jobStatus === 'job'; // Job title is required only if jobStatus is 'job'
    },
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isUnderage: {
    type: Boolean,
    default: false
  },
  Wallet: {
    type:Number,
    default:0,
  }  
});

// Pre-save hook to hash the password
touristSchema.pre('save', async function (next) {
  const tourist = this;

  // Hash the password if it's new or has been modified
  if (tourist.isModified('password')) {
    tourist.password = await bcrypt.hash(tourist.password, 10);
  }

  // Calculate the age and set isUnderage field
  const age = new Date().getFullYear() - tourist.dob.getFullYear();
  tourist.isUnderage = age < 18;

  next();
});

// Password comparison method
touristSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const Tourist = mongoose.model('Tourist', touristSchema);


export default Tourist;
=======
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema
const touristSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  nationality: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true,
    immutable: true // Prevents DOB from being changed
  },
  jobStatus: {
    type: String,
    enum: ['student', 'job'],
    required: true
  },
  jobTitle: {
    type: String,
    required: function() {
      return this.jobStatus === 'job'; // Job title is required only if jobStatus is 'job'
    },
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isUnderage: {
    type: Boolean,
    default: false
  },
  Wallet: {
    type:Number,
    default:0,
  }  
});

// Pre-save hook to hash the password
touristSchema.pre('save', async function (next) {
  const tourist = this;

  // Hash the password if it's new or has been modified
  if (tourist.isModified('password')) {
    tourist.password = await bcrypt.hash(tourist.password, 10);
  }

  // Calculate the age and set isUnderage field
  const age = new Date().getFullYear() - tourist.dob.getFullYear();
  tourist.isUnderage = age < 18;

  next();
});

// Password comparison method
touristSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const Tourist = mongoose.model('Tourist', touristSchema);


export default Tourist;
>>>>>>> jwtdemo
