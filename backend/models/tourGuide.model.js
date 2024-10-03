import mongoose from "mongoose";
import bcrypt from "bcrypt";


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
        required: true,
        trim: true,
        match: [/^+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number'] // Ensures valid international phone number format
      },
      yearsOfExperience: {
        type: Number,
        required: true,
        min: [0, 'Years of experience cannot be negative'],
        max: [50, 'Unrealistic value for years of experience'] // Add validation based on common sense or user story
      },
      previousWork: [{
        jobTitle: {
          type: String,
          trim: true
        },
        company: {
          type: String,
          trim: true
        },
        description: {
          type: String,
          trim: true
        },
        startDate: {
          type: Date,
          required: false
        },
        endDate: {
          type: Date,
          required: false
        }
      }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
tourGuideSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

tourGuideSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const TourGuide = mongoose.model('TourGuide', tourGuideSchema);

export default TourGuide;