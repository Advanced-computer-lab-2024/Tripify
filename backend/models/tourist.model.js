import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the Preferences Schema
const preferenceSchema = new mongoose.Schema({
  tripTypes: [
    {
      type: String,
      enum: [
        "historic",
        "beaches",
        "shopping",
        "family-friendly",
        "adventures",
        "luxury",
        "budget-friendly",
      ],
    },
  ],
  budgetLimit: {
    type: Number,
  },
  preferredDestinations: {
    type: String,
    trim: true,
  },
});

// Define the Tourist Schema
const touristSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
    immutable: true, // Prevents DOB from being changed
  },
  jobStatus: {
    type: String,
    enum: ["student", "job"],
    required: true,
  },
  jobTitle: {
    type: String,
    required: function () {
      return this.jobStatus === "job"; // Job title is required only if jobStatus is 'job'
    },
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,  // Makes createdAt immutable
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isUnderage: {
    type: Boolean,
    default: false,
  },
  wallet: {
    type: Number,
    default: 0,
    min: 0,  // Ensures wallet can't go negative
  },
  preferences: {
    type: preferenceSchema,
    default: {},
  },
  loyaltypoints: {
    type: Number,
    default: 0,
    min: 0,  // Ensures points can't go negative
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 3,
  },
  isDeletionRequested: {
    type: Boolean,
    default: false,
  },
  deletionRequestedAt: {
    type: Date,
    default: null,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  accountRestrictions: [{
    type: String,
    enum: ['booking', 'payment', 'review', 'all'],
  }]
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password; // Remove password from JSON responses
      return ret;
    }
  }
});

// Pre-save hook to hash the password and update fields
touristSchema.pre("save", async function (next) {
  const tourist = this;

  // Hash the password if it's new or has been modified
  if (tourist.isModified("password")) {
    tourist.password = await bcrypt.hash(tourist.password, 10);
  }

  // Calculate the age and set isUnderage field
  const today = new Date();
  const birthDate = new Date(tourist.dob);
  const age = today.getFullYear() - birthDate.getFullYear() - 
    (today.getMonth() < birthDate.getMonth() || 
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()));
  tourist.isUnderage = age < 18;

  // Update the updatedAt timestamp
  this.updatedAt = new Date();

  next();
});

// Password comparison method
touristSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account can be deleted
touristSchema.methods.canBeDeleted = async function() {
  return !this.isUnderage && 
         this.status === 'active' && 
         !this.accountRestrictions?.includes('all');
};

// Virtual for full name
touristSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dob);
  return today.getFullYear() - birthDate.getFullYear() - 
    (today.getMonth() < birthDate.getMonth() || 
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()));
});

// Index for better query performance
touristSchema.index({ username: 1, email: 1 });
touristSchema.index({ isDeletionRequested: 1, deletionRequestedAt: 1 });
touristSchema.index({ status: 1 });

// Static method to find deletable accounts
touristSchema.statics.findDeletableAccounts = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return this.find({
    isDeletionRequested: true,
    deletionRequestedAt: { $lte: thirtyDaysAgo },
    status: 'active'
  });
};

// Export the model
const Tourist = mongoose.model("Tourist", touristSchema);

export default Tourist;