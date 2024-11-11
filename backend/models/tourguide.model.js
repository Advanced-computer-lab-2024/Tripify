import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define a schema for previous work experience
const previousWorkSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        trim: true,
        required: true // Ensure jobTitle is required
    },
    company: {
        type: String,
        trim: true,
        required: true // Ensure company is required
    },
    description: {
        type: String,
        trim: true,
        required: false // Make this optional
    },
    startDate: {
        type: Date,
        required: false // Make this optional
    },
    endDate: {
        type: Date,
        required: false // Make this optional
    }
}, { _id: false }); // Prevent creation of separate _id for each subdocument

// Define the main TourGuide schema
const tourGuideSchema = new mongoose.Schema({
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
    mobileNumber: {
        type: String,
        trim: true,
        match: [/^\+?[1-20]\d{1,14}$/, 'Please enter a valid mobile number'] // Validates international phone number format
    },
    yearsOfExperience: {
        type: Number,
        min: [0, 'Years of experience cannot be negative'],
        max: [50, 'Unrealistic value for years of experience'] // Validation based on common sense
    },
    // Add to tourGuideSchema

    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    documents: [{
      type: {
        type: String,
        enum: ['tourGuidelicense', 'identityProof', 'certifications', 'other'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }],
    rejectionReason: {
      type: String
    },
  
    previousWork: [previousWorkSchema], // Store previous work as an array of objects
}, { timestamps: true });

// Pre-save hook to hash the password
tourGuideSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

// Method to compare password
tourGuideSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create the TourGuide model
const TourGuide = mongoose.model('TourGuide', tourGuideSchema);

export default TourGuide;
