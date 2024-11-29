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
  },
  isUnderage: {
    type: Boolean,
    default: false,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  preferences: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PreferenceTag",
      },
    ],
    default: [], // Set default value as empty array
  },
  loyaltypoints: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
});

// Pre-save hook to hash the password
touristSchema.pre("save", async function (next) {
  const tourist = this;

  // Hash the password if it's new or has been modified
  if (tourist.isModified("password")) {
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
const Tourist = mongoose.model("Tourist", touristSchema);

export default Tourist;
